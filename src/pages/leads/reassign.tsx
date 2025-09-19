import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState, AppDispatch } from '../../store';
import Table from '../../components/Table';
import IconBell from '../../components/Icon/IconBell';
import IconPlus from '../../components/Icon/IconPlus';
import IconTrash from '../../components/Icon/IconTrash';
import { useNavigate } from 'react-router-dom';
import Toast from '../../services/toast';
import Loader from '../../services/loader';
import { setPageTitle } from '../../slices/themeConfigSlice';
import { newleads, destoryLeads, assignleads, reassigleads, allLeads } from '../../slices/leadsSlice';
import Select from 'react-select';
import LeadModal from '../../components/LeadModal';
import '../dashboard/dashboard.css'; 
import Swal from 'sweetalert2';
import { DataTableSortStatus } from 'mantine-datatable';
import { setLoading } from '../../slices/dashboardSlice';
import IconSearch from '../../components/Icon/IconSearch';
import LeadDetailModal from '../../components/LeadDetailModal';

const ReAssign = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const toast = Toast();
    const combinedRef = useRef<any>({ 
        fetched: false, 
        form: null,
        prevPage: 1,
        prevPerPage: 10,
        prevSortStatus: { columnAccessor: 'id', direction: 'desc' }
    });

    // State for bulk selection
    const [allSelected, setAllSelected] = useState(false);
    const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set());
    const [disable, setDisable] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'desc',
    });
    const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<string>('');

    const { leads, loading, agents, total, last_page, current_page, per_page } = useSelector((state: IRootState) => state.leadslices);

    const [SearchagentSelected, setSearchAgentSelected] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<any>(null);

    useEffect(() => {
        dispatch(setPageTitle('Re-Assign Leads'));
        fetchData();
    }, [dispatch, current_page, per_page, sortStatus, searchTerm]);

    const fetchData = () => {
        dispatch(reassigleads({
            page: searchTerm ? 1 : current_page,
            perPage: per_page, 
            sortField: sortStatus.columnAccessor, 
            sortOrder: sortStatus.direction, 
            search: searchTerm 
        }));
    };
    const transformedAgents = agents?.map(agent => ({
        value: agent?.client_user_id,
        label: agent?.client_user_name,
        phone: agent?.client_user_phone,
    })) || [];
    
    const tableData = useMemo(() => {

        console.log(leads);

        return (Array.isArray(leads) ? leads : []).map((lead: any) => ({
            id: lead.lead_id || 'Unknown',
            title: lead.lead_title || 'Unknown',
            name: lead.customer_name || 'Unknown',
            phone: lead.customer_phone || 'Unknown',
            source: lead.lead_source || 'Unknown',
            created_at: lead.created_at || 'Unknown',
            updated_at: lead.updated_at || 'Unknown',
            assigned_at: lead.assigned_at || 'Unknown',
        }));
    }, [leads]);

    const openLeadModal = () => {
        setIsModalOpen(true);
    };

    const handleCheckboxChange = (record: any, isChecked: boolean) => {
        const newSelectedIds = new Set(bulkSelectedIds);
        if (isChecked) {
            newSelectedIds.add(record.id);
             setSearchAgentSelected(true);
        } else {
            newSelectedIds.delete(record.id);
             setSearchAgentSelected(false);
        }
        setBulkSelectedIds(newSelectedIds);
        setDisable(newSelectedIds.size === 0);
        setAllSelected(false);
       
    };

    const handleSelectAllCurrentPage = (isChecked: boolean) => {
        const newSelectedIds = new Set(bulkSelectedIds);
        
        if (isChecked) {
            tableData.forEach(record => newSelectedIds.add(record.id));
              setSearchAgentSelected(true);
        } else {
            tableData.forEach(record => newSelectedIds.delete(record.id));
            setSearchAgentSelected(false);
        }
        setBulkSelectedIds(newSelectedIds);
        setDisable(newSelectedIds.size === 0);
        setAllSelected(isChecked);
    };

    const handleSelectAllPages = async (isChecked: boolean) => {
        if (isChecked) {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: `This will select ALL leads matching your search criteria (${total} records).`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, select all',
                cancelButtonText: 'Cancel'
            });
            
            if (!result.isConfirmed) return;
            
            try {
                setLoading(true);
                const response = await dispatch(reassigleads({
                    page: 1,
                    perPage: total,
                    sortField: sortStatus.columnAccessor,
                    sortOrder: sortStatus.direction,
                    search: searchTerm,
                    idsOnly: true
                }) as any);
                
                if (response.payload?.data?.ids) {
                    setBulkSelectedIds(new Set(response.payload.data.ids));
                    setDisable(false);
                    setAllSelected(true);
                }
            } catch (error) {
                toast.error('Failed to select all records');
            } finally {
               setLoading(false);
            }
        } else {
            setBulkSelectedIds(new Set());
            setDisable(true);
            setAllSelected(false);
        }
    };

    const AssignLead = async (agentId: number, phone: number) => {
        if (bulkSelectedIds.size === 0) { 
            toast.error('Please select at least one lead to assign');
            return;
        }
        
        const formData = new FormData();
        Array.from(bulkSelectedIds).forEach((id) => formData.append('lead_id[]', id));
        formData.append('agent_id', agentId.toString());
        formData.append('agent_phone', phone.toString());
        try {
            const response = await dispatch(assignleads({ formData }) as any);
            if (response.payload.status === 200 || response.payload.status === 201){
                toast.success(`${bulkSelectedIds.size} leads have been assigned successfully`);
                setBulkSelectedIds(new Set());
                setDisable(true);
                setAllSelected(false);
                setSelectedAgent(null);
                setSearchAgentSelected(false);

                dispatch(reassigleads({
                    page: searchTerm ? 1 : current_page,
                    perPage: per_page, 
                    sortField: sortStatus.columnAccessor, 
                    sortOrder: sortStatus.direction, 
                    search: searchTerm 
                }));
            }
        } catch (error) {
            toast.error('Failed to assign leads');
        }
    };

    const RemoveLead = async () => {
        if (bulkSelectedIds.size === 0) {
            toast.error('Please select at least one lead to remove');
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to remove ${bulkSelectedIds.size} selected lead(s). This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });
        
        if (result.isConfirmed) {
            try {
                const formData = new FormData();
                Array.from(bulkSelectedIds).forEach((id) => formData.append('lead_id[]', id));
                const response = await dispatch(destoryLeads({ formData }) as any);
                if (response.payload.status === 200 || response.payload.status === 201) {
                    toast.success(`${bulkSelectedIds.size} leads removed successfully`);
                    setBulkSelectedIds(new Set());
                    setDisable(true);
                    setAllSelected(false);
                } else {
                    toast.error('Failed to remove leads. Please try again.');
                }
            } catch (error) {
                toast.error('An error occurred while removing leads.');
            }
        }
    };

    const handlePageChange = (page: number) => {
        dispatch(reassigleads({ 
            page,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: searchTerm  
        }));
    };

    const handlePerPageChange = (pageSize: number) => {
        dispatch(reassigleads({ 
            perPage: pageSize,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: searchTerm  
        }));
    };

    const handleSortChange = (status: DataTableSortStatus) => {
        setSortStatus(status);
        dispatch(reassigleads({ 
            sortField: status.columnAccessor,
            sortOrder: status.direction,
            search: searchTerm  
        }));
    };

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        dispatch(reassigleads({ 
            page: 1, 
            perPage: per_page,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: newSearchTerm  
        }));
    };


    const SelectAgent = async (agentId: number) => {
            
        setSelectedAgent(agentId);
            const response = await dispatch(allLeads({ 
                page: 1, 
                perPage: per_page,
                sortField: sortStatus.columnAccessor,
                sortOrder: sortStatus.direction,
                search: searchTerm,
                date_range: dateRange,
                agent_id: agentId,
                status_id: selectedStatus
            }));
          }

    const columns = [
        { 
            accessor: 'id', 
            width: '30px',
            title: (
                <div className="flex items-center">
                    <input 
                        type="checkbox" 
                        className="form-checkbox mr-2" 
                        checked={allSelected || (tableData.length > 0 && tableData.every(record => bulkSelectedIds.has(record.id)))}
                        onChange={(e) => handleSelectAllCurrentPage(e.target.checked)}
                    />
                    Select
                    {bulkSelectedIds.size > 0 && (
                        <span className="ml-2 text-xs">({bulkSelectedIds.size} selected)</span>
                    )}
                </div>
            ), 
            sortable: false, 
            render: (record: any) => (
                <input 
                    type="checkbox" 
                    className="form-checkbox" 
                    checked={bulkSelectedIds.has(record.id)} 
                    onChange={(e) => handleCheckboxChange(record, e.target.checked)} 
                />
            ),
        },
        {
            accessor: 'title',
            title: 'Title',
            sortable: true,
            width: 320, 
            cellsClassName: 'break-all whitespace-normal', 
            render: (record: any) => (
                <div className="break-words whitespace-normal max-w-xs truncate">
                    {record.title}
                </div>
            )
        },
        {
            accessor: 'name',
            title: 'Name',
            sortable: true,
            width: 200, 
            cellsClassName: 'break-all whitespace-normal', 
            render: (record: any) => (
                <div className="break-words whitespace-normal max-w-xs truncate">
                    {record.name}
                </div>
            )
        },
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
        { accessor: 'created_at', title: 'Lead Created', sortable: true },
        { accessor: 'updated_at', title: 'Last Updated', sortable: true },
        { accessor: 'assigned_at', title: 'Last Assigned', sortable: true },

        {
            accessor: 'actions', 
            title: 'Actions',
            render: (record: any) => {
                const fullLead = leads.find((l: any) => l.lead_id === record.id);
                return (
                    <button type="button" className="btn btn-secondary btn-sm" style={{ height: '23px', borderRadius: '13px' }} onClick={() => { setIsDetailModalOpen(true); setSelectedLead((fullLead as any)?.comments || []); }} > View </button>
                );
            },
        },
    ];
    
    return (
        <div>
            <div className="panel flex items-center justify-between overflow-visible whitespace-nowrap p-3 text-dark relative">
                <div className="flex items-center">
                    <div className="rounded-full bg-primary p-1.5 text-white ring-2 ring-primary/30 ltr:mr-3 rtl:ml-3">
                        <IconBell />
                    </div>
                    <span className="ltr:mr-3 rtl:ml-3">Details of Your Re-Assign Leads: </span>
                    <button onClick={openLeadModal} className="btn btn-success btn-sm"> 
                        <IconPlus /> Add Lead
                    </button>
                </div> 
                <div className="flex items-center space-x-2">

                    <div className="w-full md:w-[200px]">
                        {/* isDisabled={selectedAgent !== null} */}
                        <Select placeholder="Select an Agent" options={transformedAgents} isDisabled={SearchagentSelected} classNamePrefix="custom-select" className="custom-multiselect z-10" value={transformedAgents.find(option => option.value === selectedAgent) || null}
                        onChange={(selectedOption) => { if (selectedOption?.value !== undefined) SelectAgent(selectedOption.value); }} />
                    </div>
                    <Select 
                        placeholder="Select an option" 
                        options={transformedAgents} 
                        isDisabled={bulkSelectedIds.size === 0} 
                        className="cursor-pointer custom-multiselect z-10 w-[300px]" 
                        onChange={(selectedOption) => { 
                            if (selectedOption?.value !== undefined) {
                                AssignLead(selectedOption.value, selectedOption.phone);
                            }
                        }}
                    />
                    <button 
                        onClick={RemoveLead}  
                        type="button" 
                        className="btn btn-default btn-sm" 
                        style={{ background: "#d33", color: '#fff' }} 
                        disabled={bulkSelectedIds.size === 0}
                    > 
                        <IconTrash/> 
                    </button>
                </div>
            </div>
            <div className="datatables mt-6">
                <Table 
                    title="Re-Assign Leads"  
                    columns={columns ? columns : []}  
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
            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <LeadDetailModal 
                isOpen={isDetailModalOpen} 
                onClose={() => setIsDetailModalOpen(false)} 
                comments={selectedLead} 
            />
        </div>
    );
};

export default ReAssign;
