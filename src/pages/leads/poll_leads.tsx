import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState, AppDispatch } from '../../store';
import Table from '../../components/Table';
import IconBell from '../../components/Icon/IconBell';
import IconRefresh from '../../components/Icon/IconRefresh';
import { setPageTitle } from '../../slices/themeConfigSlice';
import { pollLeads } from '../../slices/leadsSlice';
import Toast from '../../services/toast';
import Loader from '../../services/loader';
import '../dashboard/dashboard.css';
import { DataTableSortStatus } from 'mantine-datatable';
interface SortStatus {
  columnAccessor: string;
  direction: 'asc' | 'desc';
}

const PollLeads = () => {
    const dispatch = useDispatch<AppDispatch>();
    const toast = Toast();
    const loader = Loader();
    const combinedRef = useRef<any>({  fetched: false,  form: null, prevPage: 1, prevPerPage: 10, prevSortStatus: { columnAccessor: 'id', direction: 'desc' } });
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const [disable, setDisable] = useState(true);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortStatus, setSortStatus] = useState<SortStatus>({
        columnAccessor: 'date',
        direction: 'desc'
    });
    const { leads, loading, total, last_page, current_page, per_page } = useSelector((state: IRootState) => state.leadslices);

    const fetchPollLeads = () => {
        dispatch(pollLeads({
            page: searchTerm ? 1 : current_page, 
            perPage: pageSize,
            sortField: sortStatus.columnAccessor === 'date' ? 'updated_at' : sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: searchTerm
        }));
    };

    useEffect(() => {
        if (!combinedRef.current.fetched) {
            dispatch(setPageTitle('Poll Leads'));
            fetchPollLeads();
            combinedRef.current.fetched = true;
        }
        // combinedRef.current.prevPage = current_page;
        // combinedRef.current.prevPerPage = per_page;
        // combinedRef.current.prevSortStatus = sortStatus;
    }, [page, pageSize, sortStatus, searchTerm]);


    const handlePageChange = (page: number) => {
        dispatch(pollLeads({ 
            page,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: searchTerm  
        }));
        setSelectedRecords([]);
        setDisable(true);
    };

    const handlePerPageChange = (pageSize: number) => {
        dispatch(pollLeads({ 
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
        dispatch(pollLeads({ 
            sortField: status.columnAccessor,
            sortOrder: status.direction,
            search: searchTerm  
        }));
    };

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        dispatch(pollLeads({ 
            page: 1, 
            perPage: per_page,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: newSearchTerm  
        }));
    };
    
    const tableData = leads?.map((lead: any) => ({
        id: lead.lead_id || 'N/A',
        title: lead.lead_title || 'N/A',
        name: lead.customer_name || 'N/A',
        phone: lead.customer_phone || 'N/A',
        status: lead.lead_status || 'N/A',
        date: lead.updated_at || 'N/A',
    })) || [];

    return (
        <div className="">
            <div className="panel flex items-center justify-between overflow-visible whitespace-nowrap p-3 text-dark relative">
                <div className="flex items-center">
                    <div className="rounded-full bg-primary p-1.5 text-white ring-2 ring-primary/30 ltr:mr-3 rtl:ml-3"> <IconBell /> </div>
                    <span className="ltr:mr-3 rtl:ml-3">Poll Leads</span>
                </div>
            </div>
            <div className="datatables mt-6">
                    <Table 
                        title={`Poll Leads (${total})` || 'Poll Leads (0)'}
                        columns={[
                            { 
                                accessor: 'title', 
                                title: 'Title', 
                                sortable: true,
                                width: '25%'
                            },
                            { 
                                accessor: 'name', 
                                title: 'Name', 
                                sortable: true,
                                width: '20%'
                            },
                            { 
                                accessor: 'phone', 
                                title: 'Phone', 
                                sortable: true,
                                width: '15%'
                            },
                            { 
                                accessor: 'status', 
                                title: 'Status', 
                                sortable: false,
                                width: '15%',
                                render: () => (
                                    <span className="badge bg-success">Poll Lead</span>
                                ),
                            },
                            { 
                                accessor: 'date', 
                                title: 'Closed Date', 
                                sortable: true,
                                width: '25%'
                            },
                        ]} 
                        rows={tableData}
                        totalRecords={total}
                        currentPage={current_page}
                        recordsPerPage={per_page}
                        onPageChange={handlePageChange}
                        onRecordsPerPageChange={handlePerPageChange}
                        onSortChange={handleSortChange}
                        sortStatus={sortStatus}
                        onSearchChange={onSearchChange}
                        searchValue={searchTerm}
                        noRecordsText="No Poll Leads found"
                    />
            </div> 
        </div>
    );
};

export default PollLeads;