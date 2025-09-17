import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState, AppDispatch } from '../../store';
import Table from '../../components/Table';
import IconBell from '../../components/Icon/IconBell';
import { useNavigate } from 'react-router-dom';
import Toast from '../../services/toast';
import { setPageTitle } from '../../slices/themeConfigSlice';
import Select from 'react-select';
import { DataTableSortStatus } from 'mantine-datatable';
import IconSearch from '../../components/Icon/IconSearch';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { DashboardLeadslist, setLoading } from '../../slices/dashboardSlice';
import LeadDetailModal from '../../components/LeadDetailModal';
import { updateLeadsStatus } from '../../slices/leadsSlice';

const Reports = () => {
    const dispatch = useDispatch<AppDispatch>();
    const toast = Toast();
    const navigate = useNavigate();
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set());
    const [allSelected, setAllSelected] = useState(false);    
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const [disable, setDisable] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [dateRange, setDateRange] = useState<string>('');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'lead_id', direction: 'desc', });
    const combinedRef = useRef<any>({
        fetched: false,
        form: null,
        prevPage: 1,
        prevPerPage: 10,
        prevSortStatus: { columnAccessor: 'lead_id', direction: 'desc' }
    });

    const {
        leads,
        loading,
        agents,
        statuses,
        total,
        current_page,
        per_page,
        last_page
    } = useSelector((state: IRootState) => state.dashboardslice);

    useEffect(() => {
        dispatch(setPageTitle('Agents Reports'));
        
        if (!combinedRef.current.fetched) {
            fetchData();
            combinedRef.current.fetched = true;
            return;
        }
    }, [dispatch, current_page, per_page, sortStatus, searchTerm]);

    const fetchData = () => {
        dispatch(DashboardLeadslist({
            page_number: searchTerm ? 1 : current_page,
            per_page: per_page,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: searchTerm,
            agent_id: selectedAgent || undefined,
            date_range: dateRange,
            lead_status: selectedStatus || undefined
        }));
    };

    const transformedAgents = useMemo(() => {
        return agents?.map(agent => ({
            value: agent?.client_user_id,
            label: agent?.client_user_name,
            phone: agent?.client_user_phone,
        })) || [];
    }, [agents]);

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
        dispatch(DashboardLeadslist({
            page_number: 1,
            per_page: per_page,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: searchTerm,
            date_range: dateRange,
            agent_id: agentId,
            lead_status: selectedStatus || undefined
        }));
    };

    const SelectStatus = (status: any) => {
        setSelectedStatus(status.value);
        dispatch(DashboardLeadslist({
            page_number: 1,
            per_page: per_page,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: searchTerm,
            date_range: dateRange,
            agent_id: selectedAgent || undefined,
            lead_status: status.value
        }));
    };

    const Search = () => {
        if (!selectedAgent) {
            toast.error('Please select an agent before Search.');
            return;
        }
        dispatch(DashboardLeadslist({
            page_number: 1,
            per_page: per_page,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: searchTerm,
            date_range: dateRange,
            agent_id: selectedAgent,
            lead_status: selectedStatus || undefined
        }));
    };

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const tableData = useMemo(() => {
        return Array.isArray(leads) ? leads.map((lead: any) => ({
            id: lead.lead_id || 'Unknown',
            title: lead.lead_title || 'Unknown',
            name: lead.customer_name || 'Unknown',
            phone: lead.customer_phone || 'Unknown',
            source: lead.lead_source || 'Unknown',
            date: lead.updated_at || 'Unknown',
        })) : [];
    }, [leads]);

    const handlePageChange = (page: number) => {
        dispatch(
            DashboardLeadslist({
                page_number: page,
                per_page: per_page,
                sortField: sortStatus.columnAccessor,
                sortOrder: sortStatus.direction,
                search: searchTerm,
                agent_id: selectedAgent || undefined,
                date_range: dateRange,
                lead_status: selectedStatus || undefined
            })
        );
        setSelectedRecords([]);
        setDisable(true);
    };

    const handlePerPageChange = (pageSize: number) => {
        dispatch(DashboardLeadslist({
            page_number: 1,
            per_page: pageSize,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: searchTerm,
            agent_id: selectedAgent || undefined,
            date_range: dateRange,
            lead_status: selectedStatus || undefined
        }));
        setSelectedRecords([]);
        setDisable(true);
    };

    const handleSortChange = (status: DataTableSortStatus) => {
        setSortStatus(status);
        dispatch(DashboardLeadslist({
            page_number: 1,
            per_page: per_page,
            sortField: status.columnAccessor,
            sortOrder: status.direction,
            search: searchTerm,
            agent_id: selectedAgent || undefined,
            date_range: dateRange,
            lead_status: selectedStatus || undefined
        }));
    };

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        dispatch(DashboardLeadslist({
            page_number: 1,
            per_page: per_page,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: newSearchTerm,
            agent_id: selectedAgent || undefined,
            date_range: dateRange,
            lead_status: selectedStatus || undefined
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
        setAllSelected(isChecked);
    };

    const handleTakeBackConfirm = async () => {
        if (!selectedAgent) {
            toast.error('Please select an agent before taking back leads.');
            return;
        }
        if (bulkSelectedIds.size === 0) {
            toast.error('Please select the leads you want to take back.');
            return;
        }

        try {
            dispatch(setLoading(true));
            const leadIds = Array.from(bulkSelectedIds);
            const response = await dispatch(updateLeadsStatus({ 
                agent_id: selectedAgent, 
                lead_ids: leadIds, 
                status_id: selectedStatus, 
                date_range: dateRange 
            })).unwrap();

            if (response.status === 'success') {
                toast.success(response.message || 'Selected leads successfully taken back!');
                
                setIsConfirmModalOpen(false);
                setBulkSelectedIds(new Set());
                setSelectedRecords([]);
                setDisable(true);
                setAllSelected(false);
                dispatch(DashboardLeadslist({ 
                    page_number: current_page, 
                    per_page: per_page,
                    sortField: sortStatus.columnAccessor,
                    sortOrder: sortStatus.direction,
                    search: searchTerm,
                    // agent_id: selectedAgent,
                    // lead_status: selectedStatus || undefined
                }));
            } else {
                toast.error(response.message || 'Failed to take back leads.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to take back leads.');
        } finally {
            dispatch(setLoading(false));
        }
    }

    const columns = [
         { 
            accessor: 'id', 
            title: (
                <div className="flex items-center">
                    <input 
                        type="checkbox" 
                        className="form-checkbox mr-2" 
                        checked={allSelected || (tableData.length > 0 && tableData.every(record => bulkSelectedIds.has(record.id)))} 
                        onChange={(e) => handleSelectAllCurrentPage(e.target.checked)} 
                        disabled={!selectedStatus} 
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
                    disabled={!selectedStatus} 
                />
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
        {
            accessor: 'actions', 
            title: 'Actions',
            render: (record: any) => {
                const fullLead = leads.find((l: any) => l.lead_id === record.id);
                return (
                    <button type="button" className="btn btn-secondary btn-sm" style={{ height: '23px', borderRadius: '13px' }} onClick={() => {  setIsDetailModalOpen(true); setSelectedLead((fullLead as any)?.comments || []); }} > View </button>
                    // fullleads as any  this is called Type Assertion
                );
            },
        },
    ];

    return (
        <div>
            <div className="panel flex flex-col md:flex-row items-start md:items-center justify-between overflow-visible whitespace-nowrap p-3 text-dark relative gap-4 md:gap-0">
                <div className="flex items-center mb-4 md:mb-0">
                    <div className="rounded-full bg-primary p-1.5 text-white ring-2 ring-primary/30 mr-3">
                        <IconBell />
                    </div>
                    <span className="mr-3">Details of Your Agents Reports.</span>
                </div>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
                    <div className="w-full md:w-[200px]">
                        <Select 
                            placeholder="Select Agent Name" 
                            options={transformedAgents} 
                            classNamePrefix="custom-select" 
                            className="custom-multiselect z-10"
                            onChange={(selectedOption) => { 
                                if (selectedOption?.value !== undefined) SelectAgent(selectedOption.value); 
                            }}
                        />
                    </div>
                    <div className="w-full md:w-[200px]">
                        <Select 
                            placeholder="Select a Status"
                            options={Object.entries(statuses || {}).map(([value, label]) => ({
                                value,
                                label,
                            }))}
                            formatOptionLabel={(option: any) => {
                                const match = option.label.match(/^(.*?)\s*\((\d+)\)$/);
                                const statusText = match ? match[1] : option.label;
                                const count = match ? match[2] : null;
                                return (
                                    <div className="flex items-center gap-1">
                                        {statusText} 
                                        {count && <span className="badge bg-success ms-1">{count}</span>}
                                    </div>
                                );
                            }}
                            classNamePrefix="custom-select"
                            className="custom-multiselect z-10"
                            onChange={(selectedOption) => {
                                if (selectedOption?.value !== undefined) SelectStatus(selectedOption);
                            }}
                        />    
                    </div>
                    <div className="w-full md:w-[200px]">
                        <Flatpickr
                            options={{
                                mode: 'range',
                                dateFormat: 'Y-m-d',
                            }}
                            className="form-input"
                            placeholder="Y-m-d"
                            onChange={(dates) => {
                                if (dates.length === 2) {
                                    const startDate = formatDate(dates[0]);
                                    const endDate = formatDate(dates[1]);
                                    setDateRange(`${startDate},${endDate}`);
                                } else {
                                    setDateRange('');
                                }
                            }}
                        />
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                        <button onClick={Search} type="button" className="btn btn-secondary btn-sm flex items-center">
                            <IconSearch /> &nbsp;Search
                        </button>
                        <button 
                            onClick={() => setIsConfirmModalOpen(true)} 
                            type="button" 
                            className="btn btn-danger btn-sm flex items-center"
                            disabled={disable}
                        >
                            Take Back
                        </button>
                    </div>
                </div>
            </div>
            <div className="datatables mt-6">
                <Table 
                    title="All Leads" 
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
            <LeadDetailModal 
                isOpen={isDetailModalOpen} 
                onClose={() => setIsDetailModalOpen(false)} 
                comments={selectedLead} 
            />
            {isConfirmModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md">
                        <h3 className="text-lg font-bold mb-4">Confirm Take Back</h3>
                        {/* <p>Are you sure you want to take back {bulkSelectedIds.size} selected leads?</p> */}
                        <p>Are you sure you want to take back {total || 0} selected leads?</p>
                        <div className="flex justify-end mt-4 space-x-2">
                            <button onClick={() => setIsConfirmModalOpen(false)}  className="btn btn-outline-secondary"> Cancel </button>
                            <button  onClick={handleTakeBackConfirm} className="btn btn-primary">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;