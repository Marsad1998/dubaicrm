import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../slices/themeConfigSlice';
import Swal from 'sweetalert2';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Loader from '../../services/loader';
import { options } from '../../services/status';
import Select from 'react-select';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconPencil from '../../components/Icon/IconPencil';
import Table from '../../components/Table';
import { AppDispatch, IRootState } from '../../store';
import '../dashboard/dashboard.css'; 

const endpoints = {
    createApi: `${getBaseUrl()}/kpi/create`,
    listApi: `${getBaseUrl()}/kpi/show`,
    destoryApi: `${getBaseUrl()}/kpi/delete`,
    updateStatusApi: `${getBaseUrl()}/kpi/update_kpi`,
};

const Create = () => {
    const dispatch = useDispatch<AppDispatch>();
    const loader = Loader();
    const combinedRef = useRef<any>({ userformRef: null });
    const [users, setUsers] = useState([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const requestMade = useRef(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
    const [agents, setAgents] = useState<any[]>([]);
    const [agent_id, setAgentId] = useState<any | null>(null);

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!requestMade.current) { dispatch(setPageTitle('Create User')); requestMade.current = true; }
    }, [dispatch]);

    useEffect(() => {
        fetchKpiLists();
    }, [page, pageSize, sortStatus, searchQuery]);

    const fetchKpiLists = async () => {
        try {
            const params = {
                page,
                per_page: pageSize,
                sort_field: sortStatus.columnAccessor,
                sort_order: sortStatus.direction,
                search: searchQuery
            };
            const response = await apiClient.get(endpoints.listApi, { params });
            if (response.data) {
                setUsers(response.data.data || []); 
                setTotalRecords(response.data.total || 0);

                const agents = response.data.agents || [];
                const headOptions = agents.map((head: any) => ({
                    value: head.client_user_id,
                    label: ( <> {head.client_user_name}{' '}<span className='badge bg-success rounded-full text-white ml-2'>{head.client_user_designation}</span></>)
                }));
                setAgents(headOptions);
            }
        } catch (error: any) {
            if (error.response?.status === 403) {
                window.location.href = '/error';
            }
            showServerError();
        }
    };

    const handleTeamHeadChange = (selectedOption: any) => {
        setAgentId(selectedOption);
    };

    const formatOptionLabel = ({ label, customLabel }: any) => {
        return customLabel || label;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (combinedRef.current.userformRef) {
                const formData = new FormData(combinedRef.current.userformRef);
                const kpiId = formData.get('id');
                const response = kpiId ? await apiClient.post(`${endpoints.createApi}/${kpiId}`, formData) : await apiClient.post(endpoints.createApi, formData);

                console.log(response, 'response');


                if (response.status === 200 || response.status === 201) {
                    showSuccessToast(response.data.message);
                    fetchKpiLists();
                    setErrors({});
                    combinedRef.current.userformRef.reset();
                    // setSelectedRole(null);
                    // setStatus(null);
                    // setStatusFor(null); 
                    // setIconState(null);
                }
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response?.status === 403) {
            } else if (error.response?.status === 422) {
                    // Swal.fire({ title: ``+error.response.data.message+``, icon : 'error',  text: `Total ${stageName} : ${error.response.data.count}`});
            }else {
                showServerError();
            }
        }
    };
    const showSuccessToast = (message: string) => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            title: message,
            icon: 'success',
        });
    };
    const showServerError = () => {
            Swal.fire({
                text: 'Something went wrong on the server',
                icon: 'error',
                title: 'Server Error',
            });
    };
    const handleEdit = async (data: any) => {
        console.log(data);
        
        if (combinedRef.current.userformRef) {
            const form = combinedRef.current.userformRef;
            form.id.value = data.id || '';
            form.title.value = data.title || '';
            form.title.value = data.title || '';
            let headOptions = [];
            let userteam = data.agent;
            if (userteam) {
                headOptions = [{
                    value: userteam.client_user_id,
                    label: userteam.client_user_name + ' (' + userteam.client_user_designation + ')',
                }];
            } else {
                headOptions = [{ value: null, label: 'No Team Head', }];
            }
            setAgentId(headOptions); 

            form.start_date.value = data.start_date || '';
            form.end_date.value = data.end_date || '';
            form.description.value = data.description || '';
        }
    };

    const handleDelete = async (status: any) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        });
        if (result.isConfirmed) {
            try {
                const response = await apiClient.delete(endpoints.destoryApi + `/${status.id}`);
                if (response.status === 200 || response.status === 201) {
                    showSuccessToast('User deleted successfully');
                    fetchKpiLists(); 
                }
            } catch (error: any) {
                if (error.response?.status === 403) {
                    window.location.href = '/error';
                }
                showServerError();
            }
        }
    };
    
    const handleRoleChange = (selectedOption: any) => {
        // setSelectedRole(selectedOption); 
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1); 
    };

    const handlePageChange = (p: number) => {
        setPage(p);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
    };

    const columns = [
        { 
            accessor: 'id', 
            title: '#', 
            width: 80,
            key: 'id'
        }, 
        { 
            accessor: 'title', 
            title: 'Title', 
            sortable: true, 
        },
        { 
            accessor: 'start_date', 
            title: 'Start Date', 
            sortable: true, 
        },
        { 
            accessor: 'end_date', 
            title: 'End Date', 
            sortable: true, 
        },
        { 
            accessor: 'agent', 
            title: 'Responsible', 
            sortable: true, 
            render: (item: any) => item.agent?.client_user_name || 'N/A'
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: (item: any) => {
                let progressWidth = '0%';
                let bgColor = 'bg-gray-300';
                let label = '';
                switch(item.status) {
                    case 1: 
                        progressWidth = '25%';
                        bgColor = 'bg-blue-500';
                        label = 'Kpi Task Assigned';
                        break;
                    case 2: 
                        progressWidth = '50%';
                        bgColor = 'bg-yellow-400';
                        label = 'Kpi Task In Progress';
                        break;
                    case 3: 
                        progressWidth = '100%';
                        bgColor = 'bg-green-500';
                        label = 'Kpi Task Completed';
                        break;
                    case 4: 
                        progressWidth = '100%';
                        bgColor = 'bg-red-500';
                        label = 'Kpi Task is Cancelled';
                        break;
                    default:
                        progressWidth = '0%';
                        bgColor = 'bg-gray-300';
                        label = 'Unknown';
                }
                return (
                    <div className="flex flex-col">
                        <div className="text-xs mb-1">{label}</div>
                        <div className="bg-gray-200 h-2 rounded-full w-full overflow-hidden">
                            <div
                                className={`h-2 rounded-full ${bgColor} animated-progress`}
                                style={{
                                    width: progressWidth,
                                    backgroundImage:
                                        'linear-gradient(45deg,hsla(0,0%,100%,.15) 25%,transparent 0,transparent 50%,hsla(0,0%,100%,.15) 0,hsla(0,0%,100%,.15) 75%,transparent 0,transparent)',
                                    backgroundSize: '1rem 1rem',
                                    transition: 'width 0.5s ease',
                                }}
                            ></div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessor: 'actions',
            title: 'Actions',
            width: 120,
            key: 'actions-column', 
            render: (item: any) => (
                <div className="flex space-x-2">
                    <button type="button" onClick={() => handleEdit(item)} className="btn px-1 py-0.5 rounded text-white bg-info" key={`edit-${item.client_user_id}`} 
                    >
                    <IconPencil />
                    </button>
                    <button type="button" onClick={() => handleDelete(item)} className="btn px-1 py-0.5 rounded text-white bg-red-600" key={`delete-${item.client_user_id}`} 
                    >
                        <IconTrashLines />
                    </button>
                </div>
            ),
        },
    ];
    
    return (
        <form ref={(el) => (combinedRef.current.userformRef = el)} onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-wrap -mx-4">
                <div className="w-full lg:w-1/3 px-4">
                    <div className="panel">
                        <div className="panel-body">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-group sm:col-span-2">
                                    <label htmlFor="name">Kpi Title</label>
                                    <input name="title" type="text" placeholder="Kpi Title" className="form-input" />
                                    <input type="hidden" name="id" id="id" />
                                    {errors.title && (  <span className="text-red-500 text-sm"> {errors.title} </span>  )}
                                </div>
                                <div className="form-group sm:col-span-2">
                                    <label htmlFor="">Send to</label>
                                    <Select name="client_user_id" placeholder="Select an Team" options={agents || []} value={agent_id} onChange={handleTeamHeadChange} isClearable={true}/>
                                    {errors.client_user_id && (
                                        <span className="text-red-500 text-sm">
                                            {errors.client_user_id}
                                        </span>
                                    )}
                                </div>
                                 <div className="form-group sm:col-span-2">
                                    <label htmlFor="name">Start Date</label>
                                    <input name="start_date" type="date" placeholder="Date" className="form-input" />
                                    {errors.start_date && (  <span className="text-red-500 text-sm"> {errors.start_date} </span>  )}
                                </div>
                                <div className="form-group sm:col-span-2">
                                    <label htmlFor="name">Start Date</label>
                                    <input name="end_date" type="date" placeholder="Date" className="form-input" />
                                    {errors.end_date && (  <span className="text-red-500 text-sm"> {errors.end_date} </span>  )}
                                </div>
                                <div className="form-group sm:col-span-2">
                                    <label htmlFor="description">Task list</label>
                                    <textarea name="description" id="description" className="form-input" style={{ height: '316px' }} placeholder='Add Here Task list'/>
                                </div>
                                <div className="sm:col-span-2">
                                    <button type="submit" className="btn btn-primary w-full">Submit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="w-full lg:w-2/3 px-2 mt-6 lg:mt-0 md-mt-0">
                      <div className="datatables">
                        <Table
                            columns={columns}
                            rows={users}
                            title="All Leads Stages"
                            idAccessor="id"
                            totalRecords={totalRecords}
                            currentPage={page}
                            recordsPerPage={pageSize}
                            onPageChange={handlePageChange}
                            onRecordsPerPageChange={handlePageSizeChange}
                            onSortChange={setSortStatus}
                            onSearchChange={handleSearchChange}
                            sortStatus={sortStatus}
                            isLoading={false}
                            minHeight={200}
                            noRecordsText="No Stage found"
                            searchValue={searchQuery}
                        />
                    </div>
                </div> 
            </div>
        </form>
    );
};

export default Create;