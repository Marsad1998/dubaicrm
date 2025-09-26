import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../dashboard/dashboard.css';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import Toast from '../../services/toast';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import IconBell from '../../components/Icon/IconBell';
import IconPlus from '../../components/Icon/IconPlus';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import Table from '../../components/Table';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import { DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';

const endpoints = {
    loadTemplateApi:`${getBaseUrl()}/whatsapp/load-template`,
    listApi:`${getBaseUrl()}/whatsapp/show`,
};

const Templates = () => {
    const navigate    = useNavigate();
    const dispatch   = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({  columnAccessor: 'id',  direction: 'asc'  });
    const [searchQuery, setSearchQuery] = useState('');
    const toast = Toast();
    const [wtemplates, setwTemplate] = useState([]);

    useEffect(() => { 
        getTemplate();
    }, [page, pageSize, sortStatus, searchQuery]);

    const LoadTemplate = async () => {
        try {
            setLoading(true); 
            const response = await apiClient.get(endpoints.loadTemplateApi);
            if (response.status === 200) {
                toast.success('Template Load Successfully');
                await getTemplate(); 
            }
        } catch (error: any) {
            toast.error('Failed to load template');
        } finally {
            setLoading(false);
        }
    };  

    const getTemplate = async () => {
        try {
            setLoading(true);
            const params = { page, per_page: pageSize, sort_field: sortStatus.columnAccessor, sort_order: sortStatus.direction, search: searchQuery };
            const response = await apiClient.get(endpoints.listApi, { params });
            if (response.data) {
                setwTemplate(response.data.data || []);
                setTotalRecords(response.data.total || 0);
            }
        } catch (error: any) {
            if (error.response?.status === 403) {
                window.location.href = '/error';
            }
            showServerError('Something wrong on server');
        } finally {
            setLoading(false);
        }
    };

    const showServerError = (message: string) => {
        Swal.fire({
            text: message,
            icon: 'error',
            title: 'Server Error',
        });
    };


    const tableData = (Array.isArray(wtemplates) ? wtemplates : []).map((wtemplatess: any, index: number) => ({
        id: wtemplatess.id,
        friendly_name: wtemplatess.friendly_name,
        sid: wtemplatess.sid,
        // phone: wtemplatess.phone,
        // source: wtemplatess.status,
    }));

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
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
                const response = await apiClient.delete(`${getBaseUrl()}/subscriber/delete/${id}`);
                if (response.status === 200) {
                    showSuccessToast('Subscriber deleted successfully');
                    getTemplate();
                }
            } catch (error: any) {
                if (error.response?.status === 403) {
                    window.location.href = '/error';
                }
                showServerError('Something wrong on server');
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

    return (
        <div>
            <div className="panel flex items-center justify-between overflow-visible whitespace-nowrap p-3 text-dark relative">
                <div className="flex items-center">
                    <div className="rounded-full bg-primary p-1.5 text-white ring-2 ring-primary/30 ltr:mr-3 rtl:ml-3"> <IconBell /> </div>
                        <span className="ltr:mr-3 rtl:ml-3">Details of Your Whatsapp Templates: </span>
                    </div>
                  <div className="">
                    <button className="btn btn-secondary btn-sm" onClick={LoadTemplate} type="button"> Load Template </button>
                </div>
            </div>
              <div className="datatables mt-6">
               <Table title="List of all Templates" columns={[
                        { accessor: 'id', title: '#', sortable: true },
                        { accessor: 'friendly_name', title: 'Name', sortable: true },
                        { accessor: 'sid', title: 'SId', sortable: true },
                        {
                            accessor: 'action',
                            title: 'Action',
                            sortable: false,
                            render: (user: any) => (
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        className="btn px-1 py-0.5 rounded text-white bg-info"
                                    >
                                        <IconPencil />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(user.id)}
                                        className="btn px-1 py-0.5 rounded text-white bg-red-600"
                                    >
                                        <IconTrashLines />
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                    rows={tableData}
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
                    isLoading={loading}
                    minHeight={200}
                    noRecordsText="No subscribers found"
                    searchValue={searchQuery}
                />
            </div>
        </div>
    );
};

export default Templates;
