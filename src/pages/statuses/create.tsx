import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
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
import { AppDispatch } from '../../store';
import '../dashboard/dashboard.css'; 
import { LeadsOption } from '../../services/status';
import { IconOption } from '../../components/Icon';

const endpoints = {
    createApi: `${getBaseUrl()}/statuses/create`,
    listApi: `${getBaseUrl()}/statuses/show`,
    destoryApi: `${getBaseUrl()}/statuses/delete`,
    updateStatusApi: `${getBaseUrl()}/statuses/update_stage`,


};

const Create = () => {
    const dispatch = useDispatch<AppDispatch>();
    const loader = Loader();
    const combinedRef = useRef<any>({ userformRef: null });
    const [users, setUsers] = useState([]);
    const [status, setStatus] = useState<any | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [urole, setRoles] = useState<any | null>(null); 
    const [selectedRole, setSelectedRole] = useState<any | null>(null);
    const requestMade = useRef(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState('');
    const [statusfor, setStatusFor] = useState<any | null>(null);
    const [IconState, setIconState] = useState<any | null>(null);

    useEffect(() => {
        if (!requestMade.current) { dispatch(setPageTitle('Create User')); requestMade.current = true; }
    }, [dispatch]);

    useEffect(() => {
        fetchStatusLists();
    }, [page, pageSize, sortStatus, searchQuery]);

    const fetchStatusLists = async () => {
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
            }
        } catch (error: any) {
            if (error.response?.status === 403) {
                window.location.href = '/error';
            }
            showServerError();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let stageName: any = null;
        try {
            if (combinedRef.current.userformRef) {
                const formData = new FormData(combinedRef.current.userformRef);
                const ststusId = formData.get('id');
                stageName = formData.get('name');
                const response = ststusId ? await apiClient.post(`${endpoints.createApi}/${ststusId}`, formData) : await apiClient.post(endpoints.createApi, formData);
                if (response.status === 200 || response.status === 201) {
                    showSuccessToast(response.data.message);
                    fetchStatusLists();
                    setErrors({});
                    combinedRef.current.userformRef.reset();
                    setSelectedRole(null);
                    setStatus(null);
                    setStatusFor(null); 
                    setIconState(null);
                }
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response?.status === 403) {
            } else if (error.response?.status === 422) {
                    Swal.fire({ title: ``+error.response.data.message+``, icon : 'error',  text: `Total ${stageName} : ${error.response.data.count}`});
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
    const handleEdit = async (statuses: any) => {
        if (combinedRef.current.userformRef) {
            const form = combinedRef.current.userformRef;
            form.id.value = statuses.id || '';
            form.name.value = statuses.name || '';
            form.type.value = statuses.type || '';
            form.status_old_id.value = statuses.status_old_id || '';
            form.sort_order.value = statuses.sort_order || '';
            form.color.value = statuses.color || '';
            setStatus(statuses.status || '');
            setStatusFor(statuses.status_for || '');
            setIconState(statuses.icon !== null ? Number(statuses.icon) : null);
            setTimeout(() => {
                const colorInput = form.querySelector('input[type="color"]');
                if (colorInput) {
                    colorInput.click(); 
                }
            }, 100);
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
                    fetchStatusLists(); 
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
        setSelectedRole(selectedOption); 
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


    const handleCheckbox = async (item: any) => {
        if (!item || !item.id) { console.error('Invalid item or item ID not found'); return; }
        const newStatus = item.status == 1 ? 2 : 1;

        try {
            const formData = new FormData();
            formData.append('id', item.id ? item.id : '');
            formData.append('status', newStatus.toString());
            const response = await apiClient.post(endpoints.updateStatusApi, formData);
              if (response.status === 200 || response.status === 201) {
                showSuccessToast('Update status successfully');
                setUsers((prevUsers:any) => prevUsers.map((user:any) => user.id === item.id ? {...user, status: newStatus} : user )
            );
            }
        } catch (error: any) {
            if (error.response?.status === 422) {
                Swal.fire({ title: ``+error.response.data.message+``, icon : 'error',  text: `Total ${item.name} : ${error.response.data.count}`});
        }
        }
    }

    const columns = [
        { 
            accessor: 'id', 
            title: '#', 
            width: 80,
            key: 'id'
        }, 
        { 
            accessor: 'name', 
            title: 'Name', 
            sortable: true, 
        },

        {
            accessor: 'color',
            title: 'Color',
            sortable: true,
            render: (item: any) => (
                <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: item.color }} />
                    <span>{item.color}</span>
                </div>
            ),
        },

        {
            accessor: 'type',
            title: 'Type',
            width: 120,
            render: (item: any) => (
                <div className="flex space-x-2">
                    <span className="badge bg-info"> {item.type } </span>
                </div>
            ),
        },

        {
            accessor: 'status_old_id',
            title: 'Old Id',
            width: 120,
            render: (item: any) => (
                <div className="flex space-x-2">
                    <span className="badge bg-success"> {item.status_old_id } </span>
                </div>
            ),
        },


        {
            accessor: 'status',
            title: 'Hide | Show',
            width: 120,
            key: 'actions-column2', 
            render: (item: any) => (
                <div className="flex space-x-1">
                     <label className="w-12 h-6 relative">
                        <input 
                        onChange={() => handleCheckbox(item)}
                        checked={item.status === 1}
                        type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                        <span className="bg-[#ebedf2] dark:bg-dark block h-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 peer-checked:before:left-7 peer-checked:bg-success before:transition-all before:duration-300 "></span>
                    </label>
                </div>
            ),
        },

        // {
        //     accessor: 'actions',
        //     title: 'Actions',
        //     width: 120,
        //     key: 'actions-column', 
        //     render: (item: any) => (
        //         <div className="flex space-x-2">
        //             <button type="button" onClick={() => handleEdit(item)} className="btn px-1 py-0.5 rounded text-white bg-info" key={`edit-${item.client_user_id}`} 
        //             >
        //             <IconPencil />
        //             </button>
        //             <button type="button" onClick={() => handleDelete(item)} className="btn px-1 py-0.5 rounded text-white bg-red-600" key={`delete-${item.client_user_id}`} 
        //             >
        //                 <IconTrashLines />
        //             </button>
        //         </div>
        //     ),
        // },
    ];
    
    return (
        <form ref={(el) => (combinedRef.current.userformRef = el)} onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-wrap -mx-4">
                <div className="w-full lg:w-1/3 px-4">
                    <div className="panel">
                        <div className="panel-body">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label htmlFor="name">Stage Name</label>
                                    <input name="name" type="text" placeholder="Name" className="form-input" />
                                    <input type="hidden" name="id" id="id" />
                                    {errors.name && ( 
                                        <span className="text-red-500 text-sm"> {errors.name} </span> 
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="color">Stage Color</label>
                                    <input name="color" type="color" required placeholder="Color" className="form-input" style={{ height: '37px' }} />
                                    {errors.color && ( 
                                        <span className="text-red-500 text-sm"> {errors.color} </span> 
                                    )} 
                                </div>
                                <div className="form-group">
                                    <label htmlFor="type">Stage Type</label>  
                                    <input name="type" type="text" placeholder="sidebar | top-bar means dashboard" className="form-input" />
                                    {errors.type && ( 
                                        <span className="text-red-500 text-sm"> {errors.type} </span> 
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="status">Stage Status</label>
                                    <Select name="status" placeholder="Select an option" options={options} value={options.find((option) => option.value === status)} onChange={(selected) => setStatus(selected?.value || null)} />
                                    {errors.status && ( 
                                        <span className="text-red-500 text-sm"> {errors.status} </span> 
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="status_for">Stage For</label>
                                    <Select name="status_for" placeholder="Select an option" options={LeadsOption} value={LeadsOption.find((option:any) => option.value === statusfor)} onChange={(selected) => setStatusFor(selected?.value || null)} />
                                    {errors.status_for && ( 
                                        <span className="text-red-500 text-sm"> {errors.status_for} </span> 
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="sort_order">Sort Order</label>
                                    <input name="sort_order" type="number" placeholder="Sort Order" className="form-input" />
                                    {errors.sort_order && ( 
                                        <span className="text-red-500 text-sm"> {errors.sort_order} </span> 
                                    )}
                                </div>
                                {/* sm:col-span-2 */}
                                <div className="form-group">
                                    <label htmlFor="status_old_id">Stage Old Id</label>
                                    <input  name="status_old_id"  type="number"  placeholder="Status Old Id"  className="form-input w-full" />
                                    {errors.status_old_id && ( <span className="text-red-500 text-sm"> {errors.status_old_id} </span> )}
                                </div>
                                 <div className="form-group">
                                    <label htmlFor="icon">Icon</label>
                                    <Select name="icon" placeholder="Select an option" options={IconOption}
                                        value={IconOption.find((option) => option.value === IconState)}
                                        onChange={(selected) => setIconState(selected?.value ?? null)}
                                        formatOptionLabel={(option: any) => (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}> {option.label} <span>{option.iconName}</span> </div>
                                        )}
                                    />
                                    {errors.icon && ( 
                                        <span className="text-red-500 text-sm"> {errors.icon} </span> 
                                    )}
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