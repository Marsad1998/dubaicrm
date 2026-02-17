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
import apiClient from '../../utils/apiClient';
import { downloadExcel } from 'react-export-table-to-excel';

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
    const [selectionRange, setSelectionRange] = useState<{
      startDate: Date | undefined;
      endDate: Date | undefined;
      key: string;
    }>({
      startDate: undefined,
      endDate: undefined,
      key: 'selection',
    })
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set());
    const [allSelected, setAllSelected] = useState(false);
    const [selectedCampaignSource, setSelectedCampaignSource] = useState<string | null>(null);
    const [selectedCampaign, setSelectedCampaign] = useState<string[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);

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
      
      
      
    }, [dispatch, current_page, per_page, sortStatus, searchTerm]);

    const transformedAgents = agents?.map(agent => ({
        value: agent?.client_user_id,
        label: agent?.client_user_name,
        phone: agent?.client_user_phone,
    }));

      const handleCheckboxChange = (record: any, isChecked: boolean) => {
          const newSelectedIds = new Set(bulkSelectedIds);
          
          if (isChecked) {
              newSelectedIds.add(record.id);
          } else {
              newSelectedIds.delete(record.id);
          }
          
          setBulkSelectedIds(newSelectedIds);
          setDisable(newSelectedIds.size === 0);
          
          
          if (isChecked && newSelectedIds.size === tableData.length) {
              setAllSelected(true);
          } else if (!isChecked) {
              setAllSelected(false);
          }
      };

      const SelectAgent = (agentId: number) => {
        setSelectedAgent(agentId);
        dispatch(allLeads({ 
          page: 1, 
          perPage: per_page,
          sortField: sortStatus.columnAccessor,
          sortOrder: sortStatus.direction,
          search: searchTerm,
          date_range: selectionRange.startDate && selectionRange.endDate ? JSON.stringify(selectionRange) : '',
          agent_id: agentId,
          campaign_id: selectedCampaign.length > 0 ? selectedCampaign : undefined
        }));
      }

      
      const campaignSourceOptions = [
        { value: 'meta', label: 'Meta Leads' },
        { value: 'google', label: 'Google Leads' }
      ];

      
      const fetchCampaigns = async (source: string) => {
        setLoadingCampaigns(true);
        setSelectedCampaign([]); 
        setCampaigns([]);
        
        try {
          const response = await apiClient.get(`/leads/campaigns?source=${source}`);
          
          
          let campaignData = [];
          if (response.data) {
            if (response.data.status === 200 || response.data.status === 201) {
              campaignData = response.data.data || response.data.campaigns || [];
            } else if (Array.isArray(response.data)) {
              campaignData = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              campaignData = response.data.data;
            }
          }
          console.log(campaignData);
          const campaignOptions = campaignData.map((campaign: any) => ({
            value: campaign.id,
            label: campaign.campaign_name
          }));
          
          setCampaigns(campaignOptions);
          
          if (campaignOptions.length === 0) {
            toast.info('No campaigns found for the selected source.');
          }
        } catch (error: any) {
          console.error('Error fetching campaigns:', error);
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch campaigns.';
          toast.error(errorMessage);
          setCampaigns([]);
        } finally {
          setLoadingCampaigns(false);
        }
      };

      const SelectCampaignSource = async (option: any) => {
        const source = option?.value;
        setSelectedCampaignSource(source);
        setSelectedCampaign([]); 
        
        if (source) {
          await fetchCampaigns(source);
          
          dispatch(allLeads({ 
            page: 1, 
            perPage: per_page,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: searchTerm,
            date_range: selectionRange.startDate && selectionRange.endDate ? JSON.stringify(selectionRange) : '',
            agent_id: selectedAgent,
            status_id: selectedStatus
          }));
        } else {
          setCampaigns([]);
          
          dispatch(allLeads({ 
            page: 1, 
            perPage: per_page,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: searchTerm,
            date_range: selectionRange.startDate && selectionRange.endDate ? JSON.stringify(selectionRange) : '',
            agent_id: selectedAgent,
            status_id: selectedStatus
          }));
        }
      };

      const SelectCampaign = async (selectedOptions: any) => {
        const campaignIds = selectedOptions ? selectedOptions.map((opt: any) => opt.value) : [];
        setSelectedCampaign(campaignIds);
        
        // Get campaign labels for the API if needed
        const campaignLabels = selectedOptions ? selectedOptions.map((opt: any) => opt.label) : [];
        
        dispatch(allLeads({ 
          page: 1, 
          perPage: per_page,
          sortField: sortStatus.columnAccessor,
          sortOrder: sortStatus.direction,
          search: searchTerm,
          date_range: selectionRange.startDate && selectionRange.endDate ? JSON.stringify(selectionRange) : '',
          agent_id: selectedAgent,
          status_id: selectedStatus,
          campaign_id: campaignLabels.length > 0 ? campaignLabels : undefined
        }));
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
        if (selectedCampaign.length > 0) {
          // Get campaign names from IDs
          const campaignNames = selectedCampaign
            .map(id => campaigns.find(c => c.value === id)?.label)
            .filter(Boolean);
          campaignNames.forEach((campaignName) => {
            formData.append('campaign_id[]', campaignName);
          });
        }
        if (selectionRange.startDate && selectionRange.endDate) {
          formData.append('date_range', JSON.stringify(selectionRange));
        }
        
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
            if (selectionRange.startDate && selectionRange.endDate) {
              doc.text(
                `Dates: ${new Date(selectionRange.startDate).toLocaleDateString()} - ${new Date(selectionRange.endDate).toLocaleDateString()}`,
                200,
                10,
                { align: 'right', maxWidth: 100 }
              );
            }
            doc.text(' ', 10, 10);
            const headers = [['Lead Title', 'Customer Name', 'Phone', 'Assigned Date', 'Source']];
            
            
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

        
        const body = Object.values(groupedLeads).flatMap((lead: any) => {
            const mainRow = [
                lead.title,
                lead.customer_name,
                lead.phone,
                lead.assigned_at,
                lead.source
            ];

            
            const commentRows = lead.comments.map((comment: any) => [
                '', 
                `Comment: ${comment.comment}`,
                `By: ${comment.agent}`,
                `On: ${comment.date}`,
                '' 
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
                  
                  
                    
                  
                  
                  fontSize: 8,
                  cellPadding: 1
                },
                
                
                
              });
              doc.save('reports.pdf');
        }
      }
      const formatDate =  (date: string) => {
        const formattedDate = new Date(date);
        return formattedDate.toLocaleString(); 
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

    const handleDownloadExcel = async () => {
      try {
        const formData = new FormData();
        formData.append('lead_status', selectedStatus ?? '');
        formData.append('agent_id', selectedAgent?.toString() ?? '');

        if (selectedCampaign.length > 0) {
          const campaignNames = selectedCampaign
            .map((id) => campaigns.find((c) => c.value === id)?.label)
            .filter(Boolean);
          campaignNames.forEach((campaignName) => {
            formData.append('campaign_id[]', campaignName as string);
          });
        }

        if (selectionRange.startDate && selectionRange.endDate) {
          formData.append('date_range', JSON.stringify(selectionRange));
        }

        const response = await dispatch(download({ formData, export_type: 'excel' }) as any);
        if (response?.payload?.status === 200 || response?.payload?.status === 201) {
          const leadsData = response?.payload?.data || [];

          if (!Array.isArray(leadsData) || leadsData.length === 0) {
            toast.error('No leads found for the current filters.');
            return;
          }

          const header = ['Lead Title', 'Customer Name', 'Phone', 'Assigned Date', 'Source'];
          const body = leadsData.map((lead: any) => [
            lead.lead_title || 'N/A',
            lead.customer_name || 'N/A',
            lead.customer_phone || 'N/A',
            lead.assigned_at ? formatDate(lead.assigned_at) : 'N/A',
            lead.lead_source || 'N/A',
          ]);

          downloadExcel({
            fileName: 'leads',
            sheet: 'Leads',
            tablePayload: {
              header,
              body,
            },
          });
        } else {
          toast.error('Failed to export leads to Excel.');
        }
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Failed to export leads to Excel.';
        toast.error(message);
      }
    };

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
        const formData = new FormData();
        formData.append('agent_id', selectedAgent?.toString() ?? '');
        if (selectedCampaign.length > 0) {
          // Get campaign names from IDs
          const campaignNames = selectedCampaign
            .map(id => campaigns.find(c => c.value === id)?.label)
            .filter(Boolean);
          campaignNames.forEach((campaignName) => {
            formData.append('campaign_id[]', campaignName);
          });
        }        
        
        if (selectionRange.startDate && selectionRange.endDate) {
            const dateRange = {
                startDate: selectionRange.startDate.toISOString().split('T')[0],
                endDate: selectionRange.endDate.toISOString().split('T')[0]
            };
            formData.append('date_range', JSON.stringify(dateRange));
        }
        
        try {
            const response = await dispatch(leadcampaignreport({ formData }) as any);
            
            if (response?.payload?.status === 200 || response?.payload?.status === 201) {
                const blobUrl = response.payload.blobUrl;
                const a = document.createElement('a');
                a.href = blobUrl;
                
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
        if (selectedCampaign.length > 0) {
          // Get campaign names from IDs
          const campaignNames = selectedCampaign
            .map(id => campaigns.find(c => c.value === id)?.label)
            .filter(Boolean);
          campaignNames.forEach((campaignName) => {
            formData.append('campaign_id[]', campaignName);
          });
        }
        if (selectionRange.startDate && selectionRange.endDate) {
          formData.append('date_range', JSON.stringify(selectionRange));
        }
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
            </div> 
        </div>
        <div className="panel mt-2">
            <div className="p-1">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Filters Section */}
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        {/* Date Filter Button */}
                        <div className="w-full sm:w-auto">
                            <button 
                                className={`btn w-full sm:w-auto ${showPicker ? 'btn-primary' : 'btn-secondary'} flex items-center justify-center`} 
                                onClick={() => setShowPicker(!showPicker)}
                            >
                                <IconCalender className='w-4 h-4 ltr:mr-2 rtl:ml-2' />
                                {showPicker ? 'Hide Date Filter' : 'Filter by Date'}
                            </button>
                            {errors?.meeting_date && (
                                <p className="text-danger text-xs mt-1">{errors.meeting_date[0]}</p>
                            )}
                        </div>

                        {/* Agent Select */}
                        <div className="w-full sm:w-[250px]">
                            <Select 
                                placeholder="Select Agent" 
                                options={transformedAgents} 
                                classNamePrefix="custom-select" 
                                className="custom-multiselect z-10" 
                                onChange={(selectedOption) => { 
                                    if (selectedOption?.value !== undefined) SelectAgent(selectedOption.value); 
                                }} 
                            />
                        </div>

                        {/* Campaign Source Select */}
                        <div className="w-full sm:w-[200px]">
                            <Select 
                                placeholder="Campaign Source" 
                                options={campaignSourceOptions} 
                                classNamePrefix="custom-select" 
                                className="custom-multiselect z-10" 
                                onChange={(selectedOption) => { 
                                    SelectCampaignSource(selectedOption); 
                                }}
                                value={selectedCampaignSource ? campaignSourceOptions.find(opt => opt.value === selectedCampaignSource) : null}
                            />
                        </div>

                        {/* Campaign Name Select - Only shows when source is selected */}
                        {selectedCampaignSource && (
                            <div className="w-full sm:w-[250px]">
                                <Select 
                                    placeholder={loadingCampaigns ? "Loading campaigns..." : "Select Campaign(s)"} 
                                    options={campaigns} 
                                    classNamePrefix="custom-select" 
                                    className="custom-multiselect z-10" 
                                    onChange={(selectedOptions) => { 
                                        SelectCampaign(selectedOptions); 
                                    }}
                                    value={campaigns.filter(opt => selectedCampaign.includes(opt.value))}
                                    isLoading={loadingCampaigns}
                                    isDisabled={loadingCampaigns}
                                    isClearable={true}
                                    isMulti={true}
                                />
                            </div>
                        )}
                    </div>

                    {/* Action Buttons Section */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                            onClick={() => { DownloadPdf(); }} 
                            type="button"  
                            className="btn btn-secondary btn-sm flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="hidden sm:inline">Download PDF</span>
                            <span className="sm:hidden">PDF</span>
                        </button>
                        {selectedAgent && (
                            <button 
                                onClick={handleDownloadExcel} 
                                type="button"  
                                className="btn btn-success btn-sm flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v4H4zM4 10h16v4H4zM4 16h10v4H4z" />
                                </svg>
                                <span className="hidden sm:inline">Export Excel</span>
                                <span className="sm:hidden">Excel</span>
                            </button>
                        )}
                        <button 
                            onClick={() => { LeadsSummaryReport(); }} 
                            type="button"  
                            className="btn btn-info btn-sm flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="hidden sm:inline">Summary Report</span>
                            <span className="sm:hidden">Summary</span>
                        </button>
                        <button 
                            onClick={() => { handleLeadCampaignReport(); }} 
                            type="button"  
                            className="btn btn-info btn-sm flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="hidden sm:inline">Campaign Report</span>
                            <span className="sm:hidden">Campaign</span>
                        </button>
                    </div>
                </div>

                {/* Selected Date Range Display */}
                {selectionRange.startDate && selectionRange.endDate && (
                    <div className="mt-4 p-3 bg-info/10 dark:bg-info/20 rounded-lg border border-info/20">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                            <div className="flex items-center gap-2">
                                <IconCalender className="w-4 h-4 text-info" />
                                <span className="text-dark dark:text-white font-medium">Selected Date Range:</span>
                            </div>
                            <span className="text-info">
                                {new Date(selectionRange.startDate).toLocaleDateString()} - {new Date(selectionRange.endDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
        {showPicker && (
          <div className="panel">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-dark dark:text-white">Select Date Range</h3>
                <button 
                  onClick={() => {
                    setSelectionRange({
                      startDate: undefined,
                      endDate: undefined,
                      key: 'selection',
                    });
                  }}
                  className="btn btn-sm btn-outline-danger"
                >
                  Clear Dates
                </button>
              </div>
              <div className="flex justify-center overflow-x-auto">
                <DateRangePicker
                  ranges={[selectionRange]}
                  onChange={(ranges) =>
                    setSelectionRange({
                      startDate: ranges.selection.startDate,
                      endDate: ranges.selection.endDate,
                      key: ranges.selection.key ?? 'selection',
                    })
                  }
                />
              </div>
            </div>
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
