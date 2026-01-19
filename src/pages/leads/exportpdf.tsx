import { useState, useEffect, useRef, Fragment, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState, AppDispatch } from '../../store';
import Table from '../../components/Table';
import IconBell from '../../components/Icon/IconBell';
import IconPlus from '../../components/Icon/IconPlus';
import IconCalender from '../../components/Icon/IconCalendar';
import { useNavigate } from 'react-router-dom';
import Toast from '../../services/toast';
import Loader from '../../services/loader';
import { setPageTitle } from '../../slices/themeConfigSlice';
import { allLeads, download, moveleadtocold, summaryreport, leadcampaignreport } from '../../slices/leadsSlice';
import Select from 'react-select';
import LeadModal from '../../components/LeadModal';
import '../dashboard/dashboard.css'; 
import { uniqueDropdown } from '../../services/status';
import { jsPDF } from 'jspdf';
import "jspdf-autotable";
import { DataTableSortStatus } from 'mantine-datatable';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css'; 
import { DateRangePicker } from 'react-date-range';
import IconSearch from '../../components/Icon/IconSearch';
import { setLoading } from '../../slices/dashboardSlice';

const ExportPdf = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const toast    = Toast();
    const loader   = Loader();
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [date, setDate] = useState<any>(null);
    const dropdownOption  = uniqueDropdown();
    const combinedRef = useRef<any>({  fetched: false,  form: null, prevPage: 1, prevPerPage: 10, prevSortStatus: { columnAccessor: 'lead_id', direction: 'desc' } });
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const [disable, setDisable] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'lead_id', direction: 'desc', });
    const { leads, loading, agents, statuses, total, last_page, current_page, per_page } = useSelector((state: IRootState) => state.leadslices);
    const [showPicker, setShowPicker] = useState(false);
    const [selectionRange, setSelectionRange] = useState({
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    })
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set());
    const [allSelected, setAllSelected] = useState(false);

    useEffect(() => {
      dispatch(setPageTitle('All Leads'));

      const fetchData = () => {
          dispatch(allLeads({ 
              page: searchTerm ? 1 : current_page, 
              perPage: per_page,
              sortField: sortStatus.columnAccessor,
              sortOrder: sortStatus.direction,
              search: searchTerm
          }));
      };
      if (!combinedRef.current.fetched) {
          fetchData();
          combinedRef.current.fetched = true;
          return;
      } 
      // combinedRef.current.prevPage = current_page;
      // combinedRef.current.prevPerPage = per_page;
      // combinedRef.current.prevSortStatus = sortStatus;
    }, [dispatch, current_page, per_page, sortStatus, searchTerm]);

    const transformedAgents = agents?.map(agent => ({
        value: agent?.client_user_id,
        label: agent?.client_user_name,
        phone: agent?.client_user_phone,
    }));

    const openLeadModal = () => {
        setIsModalOpen(true);
    }

      const handleCheckboxChange = (record: any, isChecked: boolean) => {
          const newSelectedIds = new Set(bulkSelectedIds);
          
          if (isChecked) {
              newSelectedIds.add(record.id);
          } else {
              newSelectedIds.delete(record.id);
          }
          
          setBulkSelectedIds(newSelectedIds);
          setDisable(newSelectedIds.size === 0);
          
          // Update the allSelected state if needed
          if (isChecked && newSelectedIds.size === tableData.length) {
              setAllSelected(true);
          } else if (!isChecked) {
              setAllSelected(false);
          }
      };

      const SelectAgent = (agentId: number) => {
        setSelectedAgent(agentId);
      }
      const SelectStatus = async (status:any) => {
        setSelectedStatus(status.value);
        const response = await dispatch(allLeads({ 
            page: 1, 
            perPage: per_page,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: searchTerm,
            date_range: '',
            agent_id: selectedAgent,
            status_id: status.value
        }));

      }

      const DownloadPdf = async () => {
        const formData = new FormData();
        formData.append('lead_status', selectedStatus ?? '');
        formData.append('agent_id', selectedAgent?.toString() ?? '');
        formData.append('date_range', JSON.stringify(selectionRange));
        
        const response = await dispatch(download({ formData }) as any);
        if (response.payload.status === 200 || response.payload.status === 201){
            dispatch(allLeads({ 
              page: current_page, 
              perPage: per_page,
              sortField: sortStatus.columnAccessor,
              sortOrder: sortStatus.direction,
              search: searchTerm  
          }));
            const doc = new jsPDF();
            doc.setFontSize(16);

            doc.text(`Agent: ${response.payload.agent_name}`, 10, 10);
            doc.text(
              `Dates: ${new Date(selectionRange.startDate).toLocaleDateString()} - ${new Date(selectionRange.endDate).toLocaleDateString()}`,
              200,
              10,
              { align: 'right', maxWidth: 100 }
            );
            doc.text(' ', 10, 10);
            const headers = [['Lead Title', 'Customer Name', 'Phone', 'Assigned Date', 'Source']];
            
            // Group leads by title (or another unique identifier if available)
        const groupedLeads = response.payload.data?.reduce((acc: any, lead: any) => {
            const key = lead.lead_title;
            if (!acc[key]) {
                acc[key] = {
                    title: lead.lead_title,
                    customer_name: lead.customer_name || 'N/A',
                    phone: lead.customer_phone || 'N/A',
                    assigned_at: lead.assigned_at ? formatDate(lead.assigned_at) : 'N/A',
                    source: lead.lead_source || 'N/A',
                    comments: []
                };
            }
            if (lead.lead_comment) {
                acc[key].comments.push({
                    comment: lead.lead_comment,
                    date: lead.updated_at ? formatDate(lead.updated_at) : 'N/A',
                    agent: lead.agent_name || 'N/A'
                });
            }
            return acc;
        }, {});

        // Convert grouped leads to PDF rows
        const body = Object.values(groupedLeads).flatMap((lead: any) => {
            const mainRow = [
                lead.title,
                lead.customer_name,
                lead.phone,
                lead.assigned_at,
                lead.source
            ];

            // Add comment rows as nested data
            const commentRows = lead.comments.map((comment: any) => [
                '', // Empty first column for indentation
                `Comment: ${comment.comment}`,
                `By: ${comment.agent}`,
                `On: ${comment.date}`,
                '' // Empty last column
            ]);

            return [mainRow, ...commentRows];
        });
            
            (doc as any).autoTable({
                head: headers,
                body: body,
                startY: 15,  
                margin: { top: 5, right: 5, left: 5, bottom: 5 },
                tableWidth: 'wrap',
                styles: {
                    fontSize: 10,          
                    cellPadding: 1,        
                    overflow: 'linebreak', 
                    minCellHeight: 5       
                },
                columnStyles: {
                    0: { cellWidth: 70 },   
                    1: { cellWidth: 50 },  
                    2: { cellWidth: 30 },  
                    3: { cellWidth: 25 },  
                    4: { cellWidth: 25 },  
                    5: { cellWidth: 20 }    
                },
                theme: 'grid', 
                headStyles: {
                  fillColor: [22, 160, 133], 
                  textColor: [255, 255, 255], 
                  fontStyle: 'bold', 
                },
                bodyStyles: {
                  fillColor: [240, 240, 240],
                  // fillColor: (row: any) => {
                  //   console.log(row);
                    
                  //   return row.some((cell: any) => cell !== '') ? [220, 240, 255] : false;
                  // },
                  fontSize: 8,
                  cellPadding: 1
                },
                //  alternateRowStyles: {
                //     fillColor: false // No background for comment rows
                // },
              });
              doc.save('reports.pdf');
        }
      }
      const formatDate =  (date: string) => {
        const formattedDate = new Date(date);
        return formattedDate.toLocaleString(); 
      } 
      const getLeadStatusLabel = (leadStatus: any) => {
        const status = dropdownOption.find(option => option.value === leadStatus);
        return status ? status.label : 'Unknown Status';
      }

    const tableData = useMemo(() => {
      return (Array.isArray(leads) ? leads : []).map((lead: any, index: number) => ({
          id: lead.lead_id || 'Unknown',
          title: lead.lead_title || 'Unknown',
          name: lead.customer_name || 'Unknown',
          phone: lead.customer_phone || 'Unknown',
          source: lead.lead_source || 'Unknown',
          date: lead.created_at ? new Date(lead.created_at).toLocaleString() : 'Unknown',
      }));
    }, [leads]);  

    const handlePageChange = (page: number) => {
           dispatch(allLeads({ 
               page,
               sortField: sortStatus.columnAccessor,
               sortOrder: sortStatus.direction,
               search: searchTerm  
           }));
           setSelectedRecords([]);
           setDisable(true);
      };
      const handlePerPageChange = (pageSize: number) => {
           dispatch(allLeads({ 
               perPage: pageSize,
               sortField: sortStatus.columnAccessor,
               sortOrder: sortStatus.direction,
               search: searchTerm  
           }));
           setSelectedRecords([]);
           setDisable(true);
       };
       const handleSortChange = (status: DataTableSortStatus) => {
          setSortStatus(status);
          dispatch(allLeads({ 
              page: 1, 
              perPage: per_page,
              sortField: sortStatus.columnAccessor,
              sortOrder: sortStatus.direction,
              search: searchTerm  
          }));
      };
      const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        dispatch(allLeads({ 
            page: 1, 
            perPage: per_page,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: newSearchTerm  
        }));
    };


    const handleSelectAllCurrentPage = (isChecked: boolean) => {
        const newSelectedIds = new Set(bulkSelectedIds);
        if (isChecked) {
            tableData.forEach(record => newSelectedIds.add(record.id));
        } else {
            tableData.forEach(record => newSelectedIds.delete(record.id));
        }
        
        setBulkSelectedIds(newSelectedIds);
        setDisable(newSelectedIds.size === 0);
    };

     const columns = [
      { 
            accessor: 'id', 
            title: (
                <div className="flex items-center">
                    <input type="checkbox" className="form-checkbox mr-2" checked={allSelected || (tableData.length > 0 && tableData.every(record => bulkSelectedIds.has(record.id)))} onChange={(e) => handleSelectAllCurrentPage(e.target.checked)} disabled={!selectedStatus}  />
                    Select
                    {bulkSelectedIds.size > 0 && (
                        <span className="ml-2 text-xs">({bulkSelectedIds.size} selected)</span>
                    )}
                </div>
            ), 
            sortable: false, 
            render: (record: any) => (
                <input type="checkbox" className="form-checkbox" checked={bulkSelectedIds.has(record.id)}  onChange={(e) => handleCheckboxChange(record, e.target.checked)}  disabled={!selectedStatus} />
            ),
        },
        { accessor: 'title', title: 'Title', sortable: true },
        { accessor: 'name', title: 'Name', sortable: true },
        { accessor: 'phone', title: 'Phone', sortable: true },
        { 
            accessor: 'source', 
            title: 'Source', 
            sortable: true,
            render: (record: any) => {
                switch (record.source) {
                    case 'Facebook': return <span className="badge bg-info">Facebook</span>;
                    case 'Instagram': return <span className="badge bg-secondary">Instagram</span>;
                    case 'created own': return <span className="badge bg-success">Created own</span>;
                    case 'Website': return <span className="badge bg-warning">Website</span>;
                    case 'Reshuffle': return <span className="badge bg-primary">Reshuffle</span>;
                    case 'Walk-in': return <span className="badge bg-danger">Walk-in</span>;
                    case 'Other': return <span className="badge bg-secondary">Other</span>;
                    default: return <span className="badge bg-secondary">Unknown</span>;
                }
            },
        },
        { accessor: 'date', title: 'Date', sortable: true },
    ];
    
    const handleSendToBulk = async () => {
        if (!selectedStatus) { toast.error('Please select the status of the leads you want to move to Cold.'); return; }
        const leadIds = Array.from(bulkSelectedIds);
        if (leadIds.length === 0) {toast.error('Please select the leads you want move to Cold like 10 | 20 ...'); return; }
        try {
          setLoading(true);
          const response = await dispatch(moveleadtocold({ lead_ids: leadIds, status_id: selectedStatus})).unwrap();
          if (response.status === 'success') {
              toast.success(response.message || 'Leads have been successfully moved to Cold.');
              setIsConfirmModalOpen(false);
              setSelectedRecords([]);
              setDisable(true);
          } else {
              toast.error(response.message || 'Failed to move to cold leads.');
          }
          dispatch(allLeads({ 
              page: 1, 
              perPage: per_page,
              sortField: sortStatus.columnAccessor,
              sortOrder: sortStatus.direction,
              search: searchTerm,
              date_range: '',
              agent_id: selectedAgent,
              status_id: SelectStatus
          }));
          
      } catch (error) {
          toast.error('Failed to take back leads.');
      } finally {
          setLoading(true);
      }
    }

    const handleLeadCampaignReport = async () => {
        // Validate date range
        if (!selectionRange.startDate || !selectionRange.endDate) {
            toast.error('Please select a date range.');
            return;
        }

        const dateRange = {
            startDate: selectionRange.startDate.toISOString().split('T')[0],
            endDate: selectionRange.endDate.toISOString().split('T')[0]
        };

        const formData = new FormData();
        formData.append('agent_id', selectedAgent?.toString() ?? '');
        formData.append('date_range', JSON.stringify(dateRange));
        
        try {
            const response = await dispatch(leadcampaignreport({ formData }) as any);
            
            if (response?.payload?.status === 200 || response?.payload?.status === 201) {
                const blobUrl = response.payload.blobUrl;
                const a = document.createElement('a');
                a.href = blobUrl;
                // Generate filename with timestamp like backend does
                const timestamp = new Date().toISOString().replace(/[-:]/g, '_').split('.')[0];
                a.download = `lead_campaign_${timestamp}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(blobUrl);
                toast.success('Leads campaign report generated successfully.');
            } else {
                const errorMessage = response?.payload?.message || 'Failed to generate leads campaign report.';
                toast.error(errorMessage);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to generate leads campaign report.';
            toast.error(errorMessage);
        }
    }
    
    const LeadsSummaryReport = async () => {
        const formData = new FormData();
        formData.append('agent_id', selectedAgent?.toString() ?? '');
        formData.append('date_range', JSON.stringify(selectionRange));
        const response = await dispatch(summaryreport({ formData }) as any);
        if (response?.payload?.status === 200 || response?.payload?.status === 201) {
            const blobUrl = response.payload.blobUrl;
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = 'lead_summary_report.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } else {
            toast.error('❌ Failed to generate report.');
            console.error('Error:', response);
        }
        };

    return (
    <div>
        <div className="panel flex items-center justify-between overflow-visible whitespace-nowrap p-3 text-dark relative">
          <div className="flex items-center">
              <div className="rounded-full bg-primary p-1.5 text-white ring-2 ring-primary/30 ltr:mr-3 rtl:ml-3"> 
                  <IconBell /> 
              </div>
              <span className="ltr:mr-3 rtl:ml-3"> Details of Your Agents Pdf Reports. </span>
              {/* <div className='w-[200px] ltr:ml-3 rtl:mr-3'>
                  <Select placeholder="Select a Status" options={Object.entries(statuses || {}).map(([value, label]) => ({ value: value, label: label }))}
                      classNamePrefix="custom-select"
                      className="custom-multiselect z-10"
                      onChange={(selectedOption) => { 
                        if (selectedOption?.value !== undefined) SelectStatus(selectedOption);
                      }}
                  />
              </div> */}
              {/* <button onClick={() => setIsConfirmModalOpen(true)}  type="button" className="btn btn-secondary btn-sm flex items-center ltr:ml-2 rtl:mr-2">
                  <IconSearch /> &nbsp; Send To Cold
              </button> */}
          </div> 
          <div className="flex items-center space-x-2">
              <div className="w-[200px]">
                  <button className="btn btn-secondary" onClick={() => setShowPicker(!showPicker)}>
                      <IconCalender className='mr-2' />
                      {showPicker ? 'Hide Date Filter' : 'Filter by Date'}
                  </button>
                  {errors?.meeting_date && <p className="text-danger error">{errors.meeting_date[0]}</p>}
              </div>
               <div className="w-full md:w-[200px]">
                  <Select placeholder="Select an option" options={transformedAgents} classNamePrefix="custom-select" 
                      className="custom-multiselect z-10" 
                      onChange={(selectedOption) => { 
                          if (selectedOption?.value !== undefined) SelectAgent(selectedOption.value); 
                      }} 
                  />
              </div> 
              <button onClick={() => { DownloadPdf(); }} type="button"  className="btn btn-secondary btn-sm"> Download Pdf </button>
              <button onClick={() => { LeadsSummaryReport(); }} type="button"  className="btn btn-info btn-sm"> Leads Summary Report </button>
              <button onClick={() => { handleLeadCampaignReport(); }} type="button"  className="btn btn-info btn-sm"> Leads Campaign Report </button>
          </div>
      </div>
        {showPicker && (
          <div className="panel flex items-center justify-center overflow-visible whitespace-nowrap p-3 text-dark relative">
            <DateRangePicker
              ranges={[selectionRange]}
              onChange={(ranges) =>
                setSelectionRange({
                  startDate: ranges.selection.startDate ?? new Date(),
                  endDate: ranges.selection.endDate ?? new Date(),
                  key: ranges.selection.key ?? 'selection',
                })
              }
              />
          </div>
        )}
      <div className="datatables mt-6"> 
              <Table title="All Leads"  
                  columns={columns}  
                  rows={tableData}  
                  totalRecords={total || 0}  
                  currentPage={current_page} 
                  recordsPerPage={per_page} 
                  onPageChange={handlePageChange} 
                  onRecordsPerPageChange={handlePerPageChange} 
                  onSortChange={handleSortChange} 
                  sortStatus={sortStatus} 
                  isLoading={loading}
                  onSearchChange={onSearchChange}
                  searchValue={searchTerm}
                  noRecordsText="No records found matching your search criteria"
              />
            </div>
        <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}  />

        {isConfirmModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md">
                    <h3 className="text-lg font-bold mb-4">Confirm Take Back</h3>
                    <p>Are you sure you want to move the {bulkSelectedIds.size} selected leads to Cold?</p>
                    <div className="flex justify-end mt-4 space-x-2">
                        <button onClick={() => setIsConfirmModalOpen(false)} className="btn btn-outline-secondary"> Cancel
                        </button>
                        <button onClick={handleSendToBulk} className="btn btn-primary">
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        )} 
    </div>
    )
}

export default ExportPdf;
