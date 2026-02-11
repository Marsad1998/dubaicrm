import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../slices/themeConfigSlice';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import Toast from '../../services/toast';
import Table from '../../components/Table';
import { DataTableSortStatus } from 'mantine-datatable';
import Select from 'react-select';
import IconEye from '../../components/Icon/IconEye';
import IconEdit from '../../components/Icon/IconEdit';
import IconTrash from '../../components/Icon/IconTrash';
import Swal from 'sweetalert2';

const endpoints = {
    listApi: `${getBaseUrl()}/listing/list`,
    deleteApi: `${getBaseUrl()}/listing/destroy`,
    statusApi: `${getBaseUrl()}/listing/status`,
    detailApi: `${getBaseUrl()}/listing/detail`,
};

const AMENITIES_LABELS: Record<number, string> = {
    1: 'Swimming Pool', 2: 'Gym', 3: 'Parking', 4: '24/7 Security', 5: 'Balcony', 6: 'Garden',
    7: 'Elevator', 8: 'Central A/C', 9: "Maid's Room", 10: 'Storage Room', 11: 'Pets Allowed',
    12: 'Concierge', 13: 'Spa', 14: 'Jacuzzi', 15: 'BBQ Area', 16: 'Kids Play Area', 17: 'Lobby', 18: 'Study Room',
};

const ViewListing = () => {
    const dispatch = useDispatch();
    const toast = Toast();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const [disable, setDisable] = useState(true);

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedPurpose, setSelectedPurpose] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedAgent, setSelectedAgent] = useState<string>('');
    
    const [categories, setCategories] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'desc',
    });

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailData, setDetailData] = useState<any>(null);

    const loginuser = useSelector((state: IRootState) => state.auth.user || {});
    const combinedRef = useRef<any>({ fetched: false });

    const purposeOptions = [
        { value: '1', label: 'For Rent' },
        { value: '2', label: 'For Sale' }
    ];

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
    ];

    useEffect(() => {
        dispatch(setPageTitle('View Listings'));
        
        if (!combinedRef.current.fetched) {
            fetchData();
            fetchFilterData();
            combinedRef.current.fetched = true;
        }
    }, [dispatch]);

    useEffect(() => {
        fetchData();
    }, [currentPage, perPage, sortStatus, searchTerm, selectedCategory, selectedPurpose, selectedStatus, selectedAgent]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: any = {
                page: currentPage,
                per_page: perPage,
                sort_field: sortStatus.columnAccessor === 'date' ? 'created_at' : sortStatus.columnAccessor,
                sort_order: sortStatus.direction,
                search: searchTerm,
            };

            if (selectedCategory) params.category_id = selectedCategory;
            if (selectedPurpose) params.purpose = selectedPurpose;
            if (selectedStatus) params.status = selectedStatus;
            if (selectedAgent) params.agent_id = selectedAgent;

            const response = await apiClient.get(endpoints.listApi, { params });
            
            if (response.data.status) {
                setListings(response.data.data?.data || []);
                setTotal(response.data.data?.total || 0);
                setCurrentPage(response.data.data?.current_page || 1);
                setPerPage(response.data.data?.per_page || 10);
            } else {
                toast.error(response.data.message || 'Failed to fetch listings');
            }
        } catch (error: any) {
            console.error('Error fetching listings:', error);
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterData = async () => {
        try {
            const categoriesResponse = await apiClient.get(`${getBaseUrl()}/listing/get_combine_data`);  
            if (categoriesResponse.data.categories && categoriesResponse.data.users) {
                setCategories(categoriesResponse.data.categories);
                 setAgents(categoriesResponse.data.users);
            }
        } catch (error) {
            console.error('Error fetching filter data:', error);
        }
    };

    const tableData = useMemo(() => {
        return listings.map((listing: any) => ({
            id: listing.id || 'N/A',
            reference: listing.reference_number || 'N/A',
            title: listing.title_en || 'N/A',
            category: listing.category?.name || 'N/A',
            purpose: listing.purpose === 1 ? 'For Rent' : 'For Sale',
            price: listing.price ? `AED ${listing.price.toLocaleString()}` : 'N/A',
            bedrooms: listing.bedrooms || 'N/A',
            bathrooms: listing.bathrooms || 'N/A',
            agent: listing.agents?.client_user_name || listing.agents?.client_user_name || 'N/A',
            // status: listing.status || 'active',
            date: listing.created_at || 'N/A',
            actions: listing 
        }));
    }, [listings]);

    const handleCheckboxChange = (record: any, isChecked: boolean) => {
        if (isChecked) {
            setSelectedRecords((prevSelected) => [...prevSelected, record]);
            setDisable(false);
        } else {
            setSelectedRecords((prevSelected) => prevSelected.filter((selected) => selected.id !== record.id));
            if (selectedRecords.length === 1) {
                setDisable(true);
            }
        }
    };

    const handleDelete = async () => {
        if (selectedRecords.length === 0) {
            toast.error('Please select at least one listing to delete');
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${selectedRecords.length} selected listing(s). This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                const listingIds = selectedRecords.map((record) => record.id);
                const formData = new FormData();
                listingIds.forEach((id) => formData.append('ids[]', id.toString()));

                const response = await apiClient.post(endpoints.deleteApi, formData);
                
                if (response.data.status) {
                    toast.success(response.data.message || 'Listings deleted successfully');
                    setSelectedRecords([]);
                    setDisable(true);
                    fetchData();
                } else {
                    toast.error(response.data.message || 'Failed to delete listings');
                }
            } catch (error: any) {
                console.error('Error deleting listings:', error);
                toast.error(error.response?.data?.message || 'Something went wrong');
            }
        }
    };

    const handleStatusChange = async (status: string) => {
        if (selectedRecords.length === 0) {
            toast.error('Please select at least one listing to update');
            return;
        }

        try {
            const listingIds = selectedRecords.map((record) => record.id);
            const formData = new FormData();
            listingIds.forEach((id) => formData.append('ids[]', id.toString()));
            formData.append('status', status);
            const response = await apiClient.post(endpoints.statusApi, formData);
            if (response.data.status) {
                toast.success(response.data.message || 'Status updated successfully');
                setSelectedRecords([]);
                setDisable(true);
                fetchData(); 
            } else {
                toast.error(response.data.message || 'Failed to update status');
            }
        } catch (error: any) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || 'Something went wrong');
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSelectedRecords([]);
        setDisable(true);
    };

    const handlePerPageChange = (pageSize: number) => {
        setPerPage(pageSize);
        setCurrentPage(1); // Reset to first page
        setSelectedRecords([]);
        setDisable(true);
    };

    const handleSortChange = (status: DataTableSortStatus) => {
        setSortStatus(status);
        setCurrentPage(1); // Reset to first page on sort
        setSelectedRecords([]);
        setDisable(true);
    };

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        setCurrentPage(1); // Reset to first page on search
        setSelectedRecords([]);
        setDisable(true);
    };

    const handleFilterChange = (filterType: string, value: string) => {
        setCurrentPage(1); // Reset to first page on filter
        
        switch (filterType) {
            case 'category':
                setSelectedCategory(value);
                break;
            case 'purpose':
                setSelectedPurpose(value);
                break;
            case 'status':
                setSelectedStatus(value);
                break;
            case 'agent':
                setSelectedAgent(value);
                break;
        }
        
        setSelectedRecords([]);
        setDisable(true);
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedPurpose('');
        setSelectedStatus('');
        setSelectedAgent('');
        setSearchTerm('');
        setCurrentPage(1);
        setSelectedRecords([]);
        setDisable(true);
    };

    const viewListing = async (id: number) => {
        setDetailModalOpen(true);
        setDetailData(null);
        setDetailLoading(true);
        try {
            const response = await apiClient.get(`${endpoints.detailApi}/${id}`);
            if (response.data.status && response.data.data) {
                setDetailData(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to load listing detail');
                setDetailModalOpen(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load listing detail');
            setDetailModalOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const editListing = (id: number) => {
        // Navigate to edit page
        window.location.href = `/listing/edit/${id}`;
    };

    const columns = [
        { 
            accessor: 'id', 
            title: 'Select', 
            sortable: false, 
            render: (record: any) => (
                <input 
                    type="checkbox" 
                    className="form-checkbox" 
                    checked={selectedRecords.some((selected) => selected.id === record.id)} 
                    onChange={(e) => handleCheckboxChange(record, e.target.checked)} 
                />
            ),
        },
        { accessor: 'reference', title: 'Reference No.', sortable: true },
        { accessor: 'title', title: 'Title', sortable: true },
        { accessor: 'category', title: 'Category', sortable: true },
        { 
            accessor: 'purpose', 
            title: 'Purpose', 
            sortable: true,
            render: (record: any) => (
                <span className={`badge ${record.purpose === 'For Rent' ? 'bg-info' : 'bg-success'}`}>
                    {record.purpose}
                </span>
            ),
        },
        { accessor: 'price', title: 'Price', sortable: true },
        { accessor: 'bedrooms', title: 'Bedrooms', sortable: true },
        { accessor: 'bathrooms', title: 'Bathrooms', sortable: true },
        { accessor: 'agent', title: 'Agent', sortable: true },
        { 
            accessor: 'status', 
            title: 'Status', 
            sortable: true,
            render: (record: any) => {
                console.log(record.actions.status);
                let badgeClass = 'bg-secondary';
                switch (record.actions.status) {
                    case 1: badgeClass = 'bg-success'; break;
                    case 0: badgeClass = 'bg-danger'; break;
                }
                return <span className={`badge ${badgeClass}`}>{record.actions.status == 1 ? 'Active' : 'Inactive' }</span>;
            },
        },
        { accessor: 'date', title: 'Date', sortable: true },
        { 
            accessor: 'actions', 
            title: 'Actions', 
            sortable: false,
            render: (record: any) => (
                <div className="flex items-center gap-2">
                    <button 
                        type="button" 
                        className="btn btn-sm btn-info"
                        onClick={() => viewListing(record.actions.id)}
                    >
                        <IconEye />
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-sm btn-primary"
                        onClick={() => editListing(record.actions.id)}
                    >
                        <IconEdit />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="panel flex items-center justify-between overflow-visible whitespace-nowrap p-3 text-dark relative">
                <div className="flex items-center">
                    <div className="rounded-full bg-primary p-1.5 text-white ring-2 ring-primary/30 ltr:mr-3 rtl:ml-3"> <IconEye /></div>
                    <span className="ltr:mr-3 rtl:ml-3">Property Listings</span>
                    <a href="/pages/listing/create-listing" className="btn btn-success btn-sm ml-3"> Add New Listing</a>
                </div>
                
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={handleDelete} 
                        type="button" 
                        className="btn btn-danger btn-sm" 
                        disabled={disable}
                    >
                        <IconTrash /> Delete Selected
                    </button>
                    <Select placeholder="Change Status" options={statusOptions} isDisabled={disable} className="w-40" onChange={(selected) => selected && handleStatusChange(selected.value)}
                    />
                </div>
            </div>

            {/* Filters Section */}
            <div className="panel mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Search</label>
                        <input
                            type="text"
                            className="form-input w-full"
                            placeholder="Search by title, reference..."
                            value={searchTerm}
                            onChange={onSearchChange}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <Select
                            placeholder="All Categories"
                            options={categories}
                            value={categories.find(cat => cat.value === selectedCategory)}
                            onChange={(selected) => handleFilterChange('category', selected?.value || '')}
                            isClearable
                            className="w-full"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Purpose</label>
                        <Select
                            placeholder="All Types"
                            options={purposeOptions}
                            value={purposeOptions.find(p => p.value === selectedPurpose)}
                            onChange={(selected) => handleFilterChange('purpose', selected?.value || '')}
                            isClearable
                            className="w-full"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <Select
                            placeholder="All Status"
                            options={statusOptions}
                            value={statusOptions.find(s => s.value === selectedStatus)}
                            onChange={(selected) => handleFilterChange('status', selected?.value || '')}
                            isClearable
                            className="w-full"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Agent</label>
                        <Select
                            placeholder="All Agents"
                            options={agents}
                            value={agents.find(a => a.value === selectedAgent)}
                            onChange={(selected) => handleFilterChange('agent', selected?.value || '')}
                            isClearable
                            className="w-full"
                        />
                    </div>
                </div>
                
                <div className="flex justify-end">
                    <button 
                        onClick={clearFilters}
                        className="btn btn-outline-secondary btn-sm"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="datatables mt-6">
                <Table 
                    title="Property Listings"
                    columns={columns}
                    rows={tableData}
                    totalRecords={total}
                    currentPage={currentPage}
                    recordsPerPage={perPage}
                    onPageChange={handlePageChange}
                    onRecordsPerPageChange={handlePerPageChange}
                    onSortChange={handleSortChange}
                    sortStatus={sortStatus}
                    isLoading={loading}
                    onSearchChange={onSearchChange}
                    searchValue={searchTerm}
                    noRecordsText="No listings found matching your criteria"
                />
            </div>

            {/* Listing Detail Modal */}
            {detailModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDetailModalOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200 shrink-0">
                            <h3 className="text-lg font-semibold text-gray-800">Listing Detail</h3>
                            <button type="button" className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors" onClick={() => setDetailModalOpen(false)} aria-label="Close">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-5">
                            {detailLoading && (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <div className="animate-spin rounded-full h-11 w-11 border-2 border-primary border-t-transparent" />
                                    <p className="text-sm text-gray-500">Loading listing…</p>
                                </div>
                            )}
                            {!detailLoading && detailData && (
                                <div className="space-y-6">
                                    {/* Hero: image + title + price */}
                                    <div className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                        {detailData.images && detailData.images[0] ? (
                                            <div className="aspect-video w-full">
                                                <img src={detailData.images[0]} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="aspect-video w-full flex items-center justify-center text-gray-400">
                                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
                                            </div>
                                        )}
                                        <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-500">{detailData.reference_number ?? '—'}</p>
                                                <h4 className="text-xl font-semibold text-gray-900 mt-0.5 truncate">{detailData.title_en ?? '—'}</h4>
                                                {detailData.title_ar && <p className="text-sm text-gray-600 mt-1" dir="rtl">{detailData.title_ar}</p>}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold text-lg">{detailData.price != null && detailData.price !== '' ? `AED ${detailData.price}` : '—'}</span>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${detailData.purpose == 1 ? 'bg-blue-100 text-blue-800' : detailData.purpose == 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                                                    {detailData.purpose == 1 ? 'For Rent' : detailData.purpose == 2 ? 'For Sale' : '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Overview card */}
                                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                            <h5 className="text-sm font-semibold text-gray-700">Overview</h5>
                                        </div>
                                        <div className="p-4">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4">
                                                <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</p><p className="mt-0.5 font-medium text-gray-900">{detailData.category?.name ?? '—'}</p></div>
                                                <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p><p className="mt-0.5 font-medium text-gray-900">{detailData.address ?? '—'}</p></div>
                                                <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unit No.</p><p className="mt-0.5 font-medium text-gray-900">{detailData.unit_number ?? '—'}</p></div>
                                                <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Permit No.</p><p className="mt-0.5 font-medium text-gray-900">{detailData.permit_number ?? '—'}</p></div>
                                                <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Completion</p><p className="mt-0.5 font-medium text-gray-900">{detailData.completion_status == 1 ? 'Ready' : detailData.completion_status == 2 ? 'Off Plan' : detailData.completion_status == 3 ? 'Under Construction' : '—'}</p></div>
                                                <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bedrooms</p><p className="mt-0.5 font-medium text-gray-900">{detailData.bedrooms ?? '—'}</p></div>
                                                <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bathrooms</p><p className="mt-0.5 font-medium text-gray-900">{detailData.bathrooms ?? '—'}</p></div>
                                                <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Area (sqft)</p><p className="mt-0.5 font-medium text-gray-900">{detailData.area_sqft ?? '—'}</p></div>
                                                <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rent frequency</p><p className="mt-0.5 font-medium text-gray-900">{detailData.rent_frequency == 1 ? 'Yearly' : detailData.rent_frequency == 2 ? 'Monthly' : detailData.rent_frequency == 3 ? 'Weekly' : detailData.rent_frequency == 4 ? 'Daily' : '—'}</p></div>
                                                <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Agent</p><p className="mt-0.5 font-medium text-gray-900">{detailData.agents?.client_user_name ?? '—'}</p></div>
                                                <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p><p className="mt-0.5"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${detailData.status == 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{detailData.status == 1 ? 'Active' : detailData.status == 2 ? 'Inactive' : '—'}</span></p></div>
                                            </div>
                                            {detailData.virtual_tour_url && (
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                <a href={detailData.virtual_tour_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    Virtual Tour
                                                </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Descriptions */}
                                    {(detailData.description_en || detailData.description_ar) && (
                                        <div className="rounded-xl border border-gray-200 overflow-hidden">
                                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                                <h5 className="text-sm font-semibold text-gray-700">Description</h5>
                                            </div>
                                            <div className="p-4 space-y-4">
                                                {detailData.description_en && <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">English</p><div className="text-sm text-gray-700 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: detailData.description_en }} /></div>}
                                                {detailData.description_ar && <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Arabic</p><div className="text-sm text-gray-700 prose prose-sm max-w-none" dir="rtl" dangerouslySetInnerHTML={{ __html: detailData.description_ar }} /></div>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Amenities */}
                                    {detailData.amenities && (Array.isArray(detailData.amenities) ? detailData.amenities : []).length > 0 && (
                                        <div className="rounded-xl border border-gray-200 overflow-hidden">
                                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                                <h5 className="text-sm font-semibold text-gray-700">Amenities</h5>
                                            </div>
                                            <div className="p-4 flex flex-wrap gap-2">
                                                {(Array.isArray(detailData.amenities) ? detailData.amenities : []).map((id: number) => (
                                                    <span key={id} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">{AMENITIES_LABELS[Number(id)] ?? id}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Media: images + floor plan & video */}
                                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                            <h5 className="text-sm font-semibold text-gray-700">Media</h5>
                                            {(detailData.floor_plan_url || detailData.video_url) && (
                                                <div className="flex flex-wrap gap-2">
                                                    {detailData.floor_plan_url && <a href={detailData.floor_plan_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">Floor Plan</a>}
                                                    {detailData.video_url && <a href={detailData.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">Video</a>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            {detailData.images && detailData.images.length > 0 ? (
                                                <>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                        {detailData.images.map((url: string, i: number) => (
                                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-gray-200 hover:border-primary/50 transition-colors focus:ring-2 focus:ring-primary/20">
                                                                <img src={url} alt="" className="w-full aspect-[4/3] object-cover" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">{detailData.images.length} image(s)</p>
                                                </>
                                            ) : (
                                                <p className="text-sm text-gray-500 py-4">No images uploaded.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewListing;