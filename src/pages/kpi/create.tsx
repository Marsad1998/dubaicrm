import { useState, useEffect, useRef, Fragment } from 'react';
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
import { Dialog, Transition } from '@headlessui/react';
import IconChecks from '../../components/Icon/IconChecks';
import IconChatDot from '../../components/Icon/IconChatDot';

const endpoints = {
    createApi: `${getBaseUrl()}/kpi/create`,
    listApi: `${getBaseUrl()}/kpi/show`,
    destoryApi: `${getBaseUrl()}/kpi/delete`,
    updateStatusApi: `${getBaseUrl()}/kpi/update`,
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
    const [kpiId, kpiIdQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedKpi, setSelectedKpi] = useState<any>(null);
    const [action, setAction] = useState<string>('');
    const [response, setResponse] = useState<string>('');
    const [modalErrors, setModalErrors] = useState<Record<string, string>>({});


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

    const handleDelete = async (item: any) => {
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
                const response = await apiClient.delete(endpoints.destoryApi + `/${item.id}`);
                if (response.status === 200 || response.status === 201) {
                    showSuccessToast('Kpi deleted successfully');
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

     const openActionModal = (kpi: any) => {
        setSelectedKpi(kpi);
        setAction('');
        setResponse('');
        setModalErrors({});
        setIsModalOpen(true);
    };


     const closeModal = () => {
        setIsModalOpen(false);
        setSelectedKpi(null);
        setAction('');
        setResponse('');
        setModalErrors({});
    };
    
    
    const handleActionSubmit = async () => {
        const newErrors: Record<string, string> = {};
        if (!action) newErrors.action = 'Action is required';
        if (!response) newErrors.response = 'Response is required';
        if (Object.keys(newErrors).length > 0) { setModalErrors(newErrors); return; }

        try { 
            const formData = new FormData();
            formData.append('action', action);
            // formData.append('response', response);
            const response = await apiClient.post(`${endpoints.updateStatusApi}/${selectedKpi.id}`, formData);
            if (response.status === 200 || response.status === 201) {
                showSuccessToast(response.data.message);
                closeModal();
                fetchKpiLists(); 
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setModalErrors(error.response.data.errors);
            } else if (error.response?.status === 403) {
                window.location.href = '/error';
            } else {
                showServerError();
            }
        }
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
                switch (item.status) {
                    case 1: 
                        progressWidth = '25%';
                        bgColor = 'bg-blue-500';
                        label = 'KPI Task In Progress (User)';
                        break;
                    case 2: 
                        progressWidth = '75%';
                        bgColor = 'bg-yellow-400';
                        label = 'KPI Task Done (User)';
                        break;
                    case 3: 
                        progressWidth = '100%';
                        bgColor = 'bg-green-500';
                        label = 'KPI Task Approved (Admin)';
                        break;
                    case 4: 
                        progressWidth = '100%';
                        bgColor = 'bg-red-500';
                        label = 'KPI Task Rejected (Admin)';
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
                    <button type="button" onClick={() => handleEdit(item)} className="btn px-1 py-0.5 rounded text-white bg-info" key={`edit-${item.id}`} 
                    >
                    <IconPencil />
                    </button>
                    <button type="button" onClick={() => handleDelete(item)} className="btn px-1 py-0.5 rounded text-white bg-red-600" key={`delete-${item.id}`} 
                    >
                        <IconTrashLines />
                    </button>
                    {item.status === 2 && ( // Only show if status is "KPI Task Done (User)"
                        <>
                            <button 
                                type="button" 
                                onClick={() => openActionModal(item)} 
                                className="btn px-1 py-0.5 rounded text-white bg-green-600" 
                                key={`approve-${item.id}`}
                            >
                                <IconChatDot />
                            </button>
                        </>
                    )}

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
                            title="All Kpi's"
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



                <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" open={isModalOpen} onClose={closeModal} className="relative z-50">
                    <Transition.Child 
                        as={Fragment} 
                        enter="ease-out duration-300" 
                        enterFrom="opacity-0" 
                        enterTo="opacity-100" 
                        leave="ease-in duration-200" 
                        leaveFrom="opacity-100" 
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child 
                                as={Fragment} 
                                enter="ease-out duration-300" 
                                enterFrom="opacity-0 scale-95" 
                                enterTo="opacity-100 scale-100" 
                                leave="ease-in duration-200" 
                                leaveFrom="opacity-100 scale-100" 
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                                        Aprove / Reject KPI
                                    </Dialog.Title>
                                    <div className="mt-6 space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                                            <select 
                                                value={action} 
                                                onChange={(e) => setAction(e.target.value)}
                                                className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                <option value="">Select action...</option>
                                                <option value="3">Approve</option>
                                                <option value="4">Reject</option>
                                            </select>
                                            {modalErrors.action && (
                                                <span className="text-red-500 text-sm">{modalErrors.action}</span>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Response</label>
                                            <textarea 
                                                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                                value={response} 
                                                onChange={(e) => setResponse(e.target.value)}
                                                rows={3}
                                                placeholder="Enter your feedback here..."
                                            />
                                            {modalErrors.response && (
                                                <span className="text-red-500 text-sm">{modalErrors.response}</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 flex justify-end space-x-3">
                                        <button 
                                            type="button" 
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" 
                                            onClick={closeModal}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="button" 
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" 
                                            onClick={handleActionSubmit}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
                </Transition>

            </div>
        </form>
    );
};

export default Create;