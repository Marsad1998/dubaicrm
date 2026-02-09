// import { useState, useEffect, useRef } from 'react';
// import { useDispatch } from 'react-redux';
// import { setPageTitle } from '../../slices/themeConfigSlice';
// import Swal from 'sweetalert2';
// import { getBaseUrl } from '../../components/BaseUrl';
// import apiClient from '../../utils/apiClient';
// import { DataTable, DataTableSortStatus } from 'mantine-datatable';
// import Loader from '../../services/loader';
// import { options } from '../../services/status';
// import Select from 'react-select';
// import IconTrashLines from '../../components/Icon/IconTrashLines';
// import IconPencil from '../../components/Icon/IconPencil';
// import Table from '../../components/Table';
// import { AppDispatch } from '../../store';
// import '../dashboard/dashboard.css';
// import ReactQuill from 'react-quill';

// const endpoints = {
//     createApi: `${getBaseUrl()}/categories/store`,
//     listApi: `${getBaseUrl()}/categories/show`,
//     destoryApi: `${getBaseUrl()}/categories/delete`,
// };

// const CreateCategory = () => {

//     const dispatch = useDispatch<AppDispatch>();
//     const loader = Loader();
//     const combinedRef = useRef<any>({ userformRef: null });
//     const [announcements, setAnnouncements] = useState([]);
//     const [errors, setErrors] = useState<Record<string, string>>({});
//     const [urole, setRoles] = useState<any | null>(null);
//     const [selectedRole, setSelectedRole] = useState<any | null>(null);
//     const requestMade = useRef(false);
//     const [page, setPage] = useState(1);
//     const [pageSize, setPageSize] = useState(10);
//     const [totalRecords, setTotalRecords] = useState(0);
//     const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
//     const [searchQuery, setSearchQuery] = useState('');

//     useEffect(() => { setPageTitle('Create Categories')
//         fetchCategoryList();
//     }, [page, pageSize, sortStatus, searchQuery]);

//     const fetchCategoryList = async () => {
//         try {
//             const params = { page, per_page: pageSize, sort_field: sortStatus.columnAccessor, sort_order: sortStatus.direction, search: searchQuery};
//             const response = await apiClient.get(endpoints.listApi, { params });
//             if (response.data) {
//                 console.log(response.data.data)
//                 setAnnouncements(response.data.data || []);
//                 setTotalRecords(response.data.data.length || 0);
//             }
//         } catch (error: any) {
//             if (error.response?.status === 403) {
//                 window.location.href = '/error';
//             }
//             showServerError();
//         }
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         try {
//             if (combinedRef.current.userformRef) {
//                 const formData = new FormData(combinedRef.current.userformRef);
//                 const userId = formData.get('id');
//                 const response = userId ? await apiClient.post(`${endpoints.createApi}/${userId}`, formData) : await apiClient.post(endpoints.createApi, formData);
//                 if (response.status === 200 || response.status === 201) {
//                     showSuccessToast(response.data.message);
//                     fetchCategoryList();
//                     setErrors({});
//                     combinedRef.current.userformRef.reset();
//                     setSelectedRole(null);
//                 }
//             }
//         } catch (error: any) {
//             if (error.response?.data?.errors) {
//                 setErrors(error.response.data.errors);
//             } else if (error.response?.status === 403) {

//             } else {
//                 showServerError();
//             }
//         }
//     };

//     const showSuccessToast = (message: string) => {
//         Swal.fire({
//             toast: true,
//             position: 'top-end',
//             showConfirmButton: false,
//             timer: 3000,
//             timerProgressBar: true,
//             title: message,
//             icon: 'success',
//         });
//     };

//     const showServerError = () => {
//         Swal.fire({
//             text: 'Something went wrong on the server',
//             icon: 'error',
//             title: 'Server Error',
//         });
//     };

//     const handleEdit = async (category: any) => {
//         if (combinedRef.current.userformRef) {
//             const form = combinedRef.current.userformRef;
//             form.reset();
//             form.id.value = category.id || '';
//             form.name.value = category.name || '';
//         }
//     };

//     const handleDelete = async (announcements: any) => {
//         const result = await Swal.fire({
//             title: 'Are you sure?',
//             text: "You won't be able to revert this!",
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonText: 'Yes, delete it!',
//             cancelButtonText: 'No, cancel!',
//         });
//         if (result.isConfirmed) {
//             try {
//                 const response = await apiClient.delete(endpoints.destoryApi + `/${announcements.id}`);
//                 if (response.status === 200 || response.status === 201) {
//                     showSuccessToast('Announcements deleted successfully');
//                     fetchCategoryList();
//                 }
//             } catch (error: any) {
//                 if (error.response?.status === 403) {
//                     window.location.href = '/error';
//                 }
//                 showServerError();
//             }
//         }
//     };
//     const handleRoleChange = (selectedOption: any) => {
//         setSelectedRole(selectedOption);
//     };
//     const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setSearchQuery(e.target.value);
//         setPage(1);
//     };
//     const handlePageChange = (p: number) => {
//         setPage(p);
//     };
//     const handlePageSizeChange = (size: number) => {
//         setPageSize(size);
//         setPage(1);
//     };
//     const columns = [
//         {
//             accessor: 'id',
//             title: '#',
//             width: 80,
//             key: 'id'
//         },
//         {
//             accessor: 'name',
//             title: 'Name',
//             sortable: true,
//             key: 'name'
//         },
//         {
//             accessor: 'created_at',
//             title: 'Date',
//             sortable: true,
//             key: 'created_at'
//         },
//         {
//             accessor: 'actions',
//             title: 'Actions',
//             width: 120,
//             key: 'actions-column',
//             render: (item: any) => (
//                 <div className="flex space-x-2">
//                     <button type="button" onClick={() => handleEdit(item)}  className="btn px-1 py-0.5 rounded text-white bg-info" key={`edit-${item.id}`}>
//                         <IconPencil />
//                     </button>
//                     <button type="button"  onClick={() => handleDelete(item)} className="btn px-1 py-0.5 rounded text-white bg-red-600" key={`delete-${item.id}`}>
//                         <IconTrashLines />
//                     </button>
//                 </div>
//             ),
//         },
//     ];

//     return (
//         <form ref={(el) => (combinedRef.current.userformRef = el)} onSubmit={handleSubmit} className="space-y-5">
//             <div className="flex flex-wrap -mx-4">
//                 <div className="w-full lg:w-1/3 px-4">
//                     <div className="panel">
//                         <div className="panel-body">
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                 <div className="form-group sm:col-span-2">
//                                     <label htmlFor="name">Name</label>
//                                     <input name="name" type="text" placeholder="Name" className="form-input" />
//                                     <input type="hidden" name="id" id="id" />
//                                     {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
//                                 </div>
//                                 <div className="sm:col-span-2 flex justify-end">
//                                     <button type="submit" className="btn btn-secondary"> Submit </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                  <div className="w-full lg:w-2/3 px-2 mt-6 lg:mt-0 md-mt-0">
//                       <div className="datatables">
//                         <Table
//                             columns={columns}
//                             rows={announcements}
//                             title="List of all Categories"
//                             idAccessor="id"
//                             totalRecords={totalRecords}
//                             currentPage={page}
//                             recordsPerPage={pageSize}
//                             onPageChange={handlePageChange}
//                             onRecordsPerPageChange={handlePageSizeChange}
//                             onSortChange={setSortStatus}
//                             onSearchChange={handleSearchChange}
//                             sortStatus={sortStatus}
//                             isLoading={false}
//                             minHeight={200}
//                             noRecordsText="No categories found"
//                             searchValue={searchQuery}
//                         />
//                     </div>
//                 </div>
//             </div>
//         </form>
//     );
// };

// export default CreateCategory;

import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../slices/themeConfigSlice';
import Swal from 'sweetalert2';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import { DataTableSortStatus } from 'mantine-datatable';
import Table from '../../components/Table';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconPencil from '../../components/Icon/IconPencil';
import { AppDispatch } from '../../store';
import Loader2 from '../../services/loader2';
import Loader from '../../services/loader';

const endpoints = {
    create: `${getBaseUrl()}/categories/store`,
    list: `${getBaseUrl()}/categories/show`,
    delete: `${getBaseUrl()}/categories/delete`,
};

const CreateCategory = () => {
    const dispatch = useDispatch<AppDispatch>();

    const formRef = useRef<HTMLFormElement | null>(null);

    /* States */
    const [categories, setCategories] = useState<any[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    const [searchQuery, setSearchQuery] = useState('');

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    /* Page Title */
    useEffect(() => {
        dispatch(setPageTitle('Create Categories'));
    }, []);

    /* Fetch Data */
    useEffect(() => {
        fetchCategories();
    }, [page, pageSize, sortStatus, searchQuery]);

    /* Fetch Categories */
    const fetchCategories = async () => {
        try {
            setLoading(true);

            const params = {
                page,
                per_page: pageSize,
                sort_field: sortStatus.columnAccessor,
                sort_order: sortStatus.direction,
                search: searchQuery,
            };

            const res = await apiClient.get(endpoints.list, { params });

            if (res.data) {
                setCategories(res.data.data || []);
                setTotalRecords(res.data.total || res.data.data.length);
            }
        } catch (err) {
            showServerError();
        } finally {
            setLoading(false);
        }
    };

    /* Submit (Create / Update) */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formRef.current) return;

        try {
            setLoading(true);

            const formData = new FormData(formRef.current);
            const id = formData.get('id');

            const url = id ? `${endpoints.create}/${id}` : endpoints.create;

            const res = await apiClient.post(url, formData);

            if (res.status === 200 || res.status === 201) {
                showSuccess(res.data.message);

                fetchCategories();
                resetForm();
            }
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                showServerError();
            }
        } finally {
            setLoading(false);
        }
    };

    /* Reset Form */
    const resetForm = () => {
        if (formRef.current) {
            formRef.current.reset();
        }

        setErrors({});
    };

    /* Edit */
    const handleEdit = (item: any) => {
        if (!formRef.current) return;

        const form = formRef.current;

        (form.elements.namedItem('id') as HTMLInputElement).value = item.id;
        (form.elements.namedItem('name') as HTMLInputElement).value = item.name;
    };

    /* Delete */
    const handleDelete = async (item: any) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You won’t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
        });

        if (!result.isConfirmed) return;

        try {
            setLoading(true);
            const res = await apiClient.delete(`${endpoints.delete}/${item.id}`);
            if (res.status === 200) {
                showSuccess('Category deleted successfully');
                fetchCategories();
            }
        } catch (err: any) {
            showServerError();
        } finally {
            setLoading(false);
        }
    };

    /* Alerts */
    const showSuccess = (msg: string) => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false,
            icon: 'success',
            title: msg,
        });
    };

    const showServerError = () => {
        Swal.fire({
            title: 'Server Error',
            text: 'Something went wrong',
            icon: 'error',
        });
    };

    /* Table Columns */
    const columns = [
        {
            accessor: 'id',
            title: '#',
            width: 80,
            sortable: true,
        },

        {
            accessor: 'name',
            title: 'Name',
            sortable: true,
        },

        {
            accessor: 'created_at',
            title: 'Date',
            sortable: true,
        },

        {
            accessor: 'actions',
            title: 'Actions',
            width: 120,

            render: (item: any) => (
                <div className="flex gap-2">
                    <button type="button" onClick={() => handleEdit(item)} className="btn px-1 py-0.5 rounded text-white bg-info" key={`edit-${item.id}`}>
                        <IconPencil />
                    </button>

                    <button type="button" className="btn bg-red-600 text-white px-1 py-0.5" onClick={() => handleDelete(item)}>
                        <IconTrashLines />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            {loading && <Loader2 />}
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-wrap -mx-4">
                    {/* Form */}
                    <div className="w-full lg:w-1/3 px-4">
                        <div className="panel">
                            <div className="panel-body">
                                <div className="space-y-4">
                                    <div>
                                        <label>Name</label>
                                        <input type="text" name="name" className="form-input" placeholder="Category name" required />
                                        <input type="hidden" name="id" />
                                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button type="submit" className="btn btn-secondary">Save</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="w-full lg:w-2/3 px-2 mt-6 lg:mt-0">
                        <div className="datatables">
                            <Table
                                columns={columns}
                                rows={categories}
                                title="Categories List"
                                idAccessor="id"
                                totalRecords={totalRecords}
                                currentPage={page}
                                recordsPerPage={pageSize}
                                onPageChange={setPage}
                                onRecordsPerPageChange={(s) => {
                                    setPageSize(s);
                                    setPage(1);
                                }}
                                onSortChange={setSortStatus}
                                onSearchChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }}
                                sortStatus={sortStatus}
                                searchValue={searchQuery}
                                isLoading={false}
                                minHeight={200}
                                noRecordsText="No categories found"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default CreateCategory;
