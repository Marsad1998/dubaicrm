import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../slices/themeConfigSlice';
import Swal from 'sweetalert2';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Loader from '../../services/loader';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import Table from '../../components/Table';

const endpoints = {
    listApi    : `${getBaseUrl()}/users/get_user_role`,
    createApi  : `${getBaseUrl()}/users/create_role`,
    destoryApi : `${getBaseUrl()}/users/delete_role`,
    updateApi  : `${getBaseUrl()}/users/create_role`,
};

const Roles = () => {
    const dispatch = useDispatch();
    const loader   = Loader();

    const [options] = useState([
        { value: '1', name: 'Active' },
        { value: '0', name: 'Inactive' }
    ]);
    
    interface Role {
        id: number;
        name: string;
    }
    
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ 
        columnAccessor: 'id', 
        direction: 'asc' 
    });
    const [searchQuery, setSearchQuery] = useState('');

    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
    });

    useEffect(() => {
        dispatch(setPageTitle('Create Role'));
        fetchRoleLists();
    }, [page, pageSize, sortStatus, searchQuery]);

    const fetchRoleLists = async () => {
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
                setRoles(response.data.data || []);
                setTotalRecords(response.data.total || 0);
            }
        } catch (error: any) {
            if (error.response?.status === 403) {
                window.location.href = '/error';
            }
            showServerError('Something wrong on server');
        }
    };

    const [errors, setErrors] = useState<Record<string, string>>({});
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isUpdate = !!formData.id;
        try {
            let response;
            if (isUpdate) {
                response = await apiClient.post(`${endpoints.updateApi}/${formData.id}`, formData);
            } else {
                response = await apiClient.post(endpoints.createApi, formData);
            }
            
            if (response.status === 200 || response.status === 201) {
                showSuccessToast(response.data.message);
                setFormData({ id: '', name: '' });
                fetchRoleLists();
                setErrors({});
            }
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                showServerError(error.response?.data?.message || 'An error occurred');
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

    const showServerError = (message: string) => {
        Swal.fire({
            text: message,
            icon: 'error',
            title: 'Server Error',
        });
    };

    const handleEdit = (role: any) => {
        setFormData({
            id: role.id,
            name: role.name,
        });
    };
    
    const handleDelete = async (id: number) => {
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
                const response = await apiClient.delete(`${endpoints.destoryApi}/${id}`);
                if (response.status === 200) {
                    showSuccessToast('Role deleted successfully');
                    fetchRoleLists();
                }
            } catch (error: any) {
                if (error.response?.status === 403) {
                    window.location.href = '/error';
                }
                showServerError('Something wrong on server');
            }
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const columns = [
        { 
            accessor: 'id', 
            title: '#', 
            sortable: true,
            width: 80,
            key: 'id'
        },
        { 
            accessor: 'name', 
            title: 'Name', 
            sortable: true,
            key: 'name'
        },
        {
            accessor: 'actions',
            title: 'Actions',
            width: 120,
            key: 'actions',
            render: (item: any) => (
                <div key={`actions-${item.id}`} className="flex space-x-2">
                    <button 
                        type="button" 
                        onClick={() => handleEdit(item)} 
                        className="btn px-1 py-0.5 rounded text-white bg-info"
                    >
                        <IconPencil />
                    </button>
                    <button 
                        type="button" 
                        onClick={() => handleDelete(item.id)} 
                        className="btn px-1 py-0.5 rounded text-white bg-red-600"
                    >
                        <IconTrashLines />
                    </button>
                </div>
            ),
        },
    ];
    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-wrap -mx-4">
                <div className="w-full lg:w-1/3 px-4">
                    <div className="panel">
                        <div className="panel-body">
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input 
                                    name="name" 
                                    type="text" 
                                    placeholder="Name" 
                                    className="form-input" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                />
                                {errors.name && <span className="text-red-500 text-sm">{errors.name[0]}</span>}
                            </div>
                            <div className="sm:col-span-2 flex justify-end mt-3">
                                <button type="submit" className="btn btn-primary w-full sm:w-auto">
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-2/3 px-2 mt-6 lg:mt-0 md-mt-0">
                        <div className="datatables">
                            <Table
                                columns={columns}
                                rows={roles}
                                title="List of all Roles"
                                totalRecords={totalRecords}
                                currentPage={page}
                                recordsPerPage={pageSize}
                                onPageChange={(p) => setPage(p)}
                                onRecordsPerPageChange={(size) => {
                                    setPageSize(size);
                                    setPage(1);
                                }}
                                onSortChange={setSortStatus}
                                onSearchChange={handleSearchChange}
                                sortStatus={sortStatus}
                                isLoading={false} 
                                minHeight={200}
                                noRecordsText="No users found"
                                searchValue={searchQuery}
                            />
                        </div>
                </div>
            </div>
        </form>
    );
};

export default Roles;
