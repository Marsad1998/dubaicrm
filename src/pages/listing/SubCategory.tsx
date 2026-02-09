import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { DataTableSortStatus } from 'mantine-datatable';

import { setPageTitle } from '../../slices/themeConfigSlice';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import Table from '../../components/Table';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconPencil from '../../components/Icon/IconPencil';
import Loader2 from '../../services/loader2';
import { AppDispatch } from '../../store';

const endpoints = {
    create: `${getBaseUrl()}/sub-categories/store`,
    list: `${getBaseUrl()}/sub-categories/show`,
    delete: `${getBaseUrl()}/sub-categories/delete`,
    categories: `${getBaseUrl()}/categories/show`,
};

const CreateSubCategory = () => {
    const dispatch = useDispatch<AppDispatch>();
    const formRef = useRef<HTMLFormElement | null>(null);

    /* State */
    const [subCategories, setSubCategories] = useState<any[]>([]);
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
        dispatch(setPageTitle('Create Sub Categories'));
        fetchCategories();
    }, []);

    /* Fetch Sub Categories */
    useEffect(() => {
        fetchSubCategories();
    }, [page, pageSize, sortStatus, searchQuery]);

    /* Fetch Categories for Dropdown */
    const fetchCategories = async () => {
        try {
            const res = await apiClient.get(endpoints.categories);
            setCategories(res.data.data || []);
        } catch {
            showServerError();
        }
    };

    /* Fetch Sub Categories */
    const fetchSubCategories = async () => {
        try {
            setLoading(true);

            const params = {
                page,
                per_page: pageSize,
                search: searchQuery,
                sort_field: sortStatus.columnAccessor,
                sort_order: sortStatus.direction,
            };

            const res = await apiClient.get(endpoints.list, { params });

            setSubCategories(res.data.data || []);
            setTotalRecords(res.data.total || res.data.data.length);
        } catch {
            showServerError();
        } finally {
            setLoading(false);
        }
    };

    /* Submit */
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
                fetchSubCategories();
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

    /* Reset */
    const resetForm = () => {
        formRef.current?.reset();
        setErrors({});
    };

    /* Edit */
    const handleEdit = (item: any) => {
        if (!formRef.current) return;

        (formRef.current.elements.namedItem('id') as HTMLInputElement).value = item.id;
        (formRef.current.elements.namedItem('name') as HTMLInputElement).value = item.name;
        (formRef.current.elements.namedItem('category_id') as HTMLSelectElement).value =
            item.category_id;
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
            await apiClient.delete(`${endpoints.delete}/${item.id}`);
            showSuccess('Sub category deleted successfully');
            fetchSubCategories();
        } catch {
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
        { accessor: 'id', title: '#', width: 80, sortable: true },
         {
            accessor: 'category.name',
            title: 'Category',
            sortable: false,
            render: (item: any) => item.category?.name || '-',
        },

        { accessor: 'name', title: 'Sub Category', sortable: true },
        { accessor: 'created_at', title: 'Date', sortable: true },
        {
            accessor: 'actions',
            title: 'Actions',
            width: 120,
            render: (item: any) => (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="btn bg-info text-white px-1 py-0.5"
                    >
                        <IconPencil />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="btn bg-red-600 text-white px-1 py-0.5"
                    >
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
                    {/* FORM */}
                    <div className="w-full lg:w-1/3 px-4">
                        <div className="panel">
                            <div className="panel-body space-y-4">
                                <div>
                                    <label>Category</label>
                                    <select name="category_id" className="form-select" required>
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_id && (
                                        <p className="text-red-500 text-sm">{errors.category_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label>Sub Category Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-input"
                                        placeholder="Sub category name"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm">{errors.name}</p>
                                    )}
                                </div>

                                <input type="hidden" name="id" />

                                <div className="flex justify-end">
                                    <button type="submit" className="btn btn-secondary">
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="w-full lg:w-2/3 px-2 mt-6 lg:mt-0">
                        <Table
                            columns={columns}
                            rows={subCategories}
                            title="Sub Categories List"
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
                            minHeight={200}
                            noRecordsText="No sub categories found"
                        />
                    </div>
                </div>
            </form>
        </>
    );
};

export default CreateSubCategory;