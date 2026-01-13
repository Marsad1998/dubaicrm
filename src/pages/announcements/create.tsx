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
import ReactQuill from 'react-quill';

const endpoints = {
    createApi: `${getBaseUrl()}/announcements/store`,
    listApi: `${getBaseUrl()}/announcements/show`,
    destoryApi: `${getBaseUrl()}/announcements/delete`,
};

const Create = () => {
    const dispatch = useDispatch<AppDispatch>();
    const loader = Loader();
    const combinedRef = useRef<any>({ userformRef: null });
    const [announcements, setAnnouncements] = useState([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [urole, setRoles] = useState<any | null>(null); 
    const [selectedRole, setSelectedRole] = useState<any | null>(null);
    const requestMade = useRef(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'client_user_id', direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState('');
    useEffect(() => {
        setPageTitle('Create Announcements')
        fetchAnnouncementsList();
    }, [page, pageSize, sortStatus, searchQuery]);

    const fetchAnnouncementsList = async () => {
        try {
            const params = { page, per_page: pageSize, sort_field: sortStatus.columnAccessor, sort_order: sortStatus.direction, search: searchQuery};
            const response = await apiClient.get(endpoints.listApi, { params });
            if (response.data) {
                console.log(response.data.data)
                setAnnouncements(response.data.data || []); 
                setTotalRecords(response.data.data.length || 0);
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
        try {
            if (combinedRef.current.userformRef) {
                const formData = new FormData(combinedRef.current.userformRef);
                const userId = formData.get('announcements_id');
                const response = userId ? await apiClient.post(`${endpoints.createApi}/${userId}`, formData) : await apiClient.post(endpoints.createApi, formData);
                if (response.status === 200 || response.status === 201) {
                    showSuccessToast(response.data.message);
                    fetchAnnouncementsList();
                    setErrors({});
                    combinedRef.current.userformRef.reset();
                    setSelectedRole(null);
                }
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response?.status === 403) {
                // window.location.href = '/error';
            } else {
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

    const handleEdit = async (announcements: any) => {
        if (combinedRef.current.userformRef) {
            const form = combinedRef.current.userformRef;
            form.reset();
            form.announcements_id.value = announcements.id || '';
            form.title.value = announcements.title || '';
            form.description.value = announcements.description || '';
        }
    };

    const handleDelete = async (announcements: any) => {
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
                const response = await apiClient.delete(endpoints.destoryApi + `/${announcements.id}`);
                if (response.status === 200 || response.status === 201) {
                    showSuccessToast('Announcements deleted successfully');
                    fetchAnnouncementsList(); 
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
            key: 'title'
        },
        { 
            accessor: 'created_at', 
            title: 'Date', 
            sortable: true, 
            key: 'created_at'
        },
        {
            accessor: 'actions',
            title: 'Actions',
            width: 120,
            key: 'actions-column', 
            render: (item: any) => (
                <div className="flex space-x-2">
                    <button type="button" onClick={() => handleEdit(item)}  className="btn px-1 py-0.5 rounded text-white bg-info" key={`edit-${item.id}`}>
                        <IconPencil />
                    </button>
                    <button type="button"  onClick={() => handleDelete(item)} className="btn px-1 py-0.5 rounded text-white bg-red-600" key={`delete-${item.id}`}>
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
                                    <label htmlFor="title">Announcements Title</label>
                                    <input name="title" type="text" placeholder="Title" className="form-input" />
                                    <input type="text" name="announcements_id" id="announcements_id" />
                                    {errors.title && <span className="text-red-500 text-sm">{errors.title}</span>}
                                </div>
                                <div className="form-group sm:col-span-2">
                                <label htmlFor="description">Announcements Description</label>
                                <textarea name="description" id="description" className="form-input" style={{ height: '316px' }} defaultValue="Hi, "
                                />
                                </div>
                                <div className="sm:col-span-2 flex justify-end">
                                    <button type="submit" className="btn btn-success w-full"> Submit </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-2/3 px-2 mt-6 lg:mt-0 md-mt-0">
                      <div className="datatables">
                        <Table
                            columns={columns}
                            rows={announcements}
                            title="List of all Announcements"
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
                            noRecordsText="No users found"
                            searchValue={searchQuery}
                        />
                    </div>
                </div>
            </div>
        </form>
    );
};

export default Create;
