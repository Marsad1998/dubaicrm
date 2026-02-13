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
import IconSend from '../../components/Icon/IconSend';

const endpoints = {
    listApi: `${getBaseUrl()}/listing/list`,
    deleteApi: `${getBaseUrl()}/listing/destroy`,
    statusApi: `${getBaseUrl()}/listing/status`,
    bayutSendApi: `${getBaseUrl()}/listing/bayut/send`,
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
        setCurrentPage(1); 
        setSelectedRecords([]);
        setDisable(true);
    };

    const handleSortChange = (status: DataTableSortStatus) => {
        setSortStatus(status);
        setCurrentPage(1); 
        setSelectedRecords([]);
        setDisable(true);
    };

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        setCurrentPage(1); 
        setSelectedRecords([]);
        setDisable(true);
    };

    const handleFilterChange = (filterType: string, value: string) => {
        setCurrentPage(1); 
        
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

    const viewListing = (id: number) => {
        // Navigate to listing detail page or open modal
        window.open(`/listing/view/${id}`, '_blank');
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
                let badgeClass = 'bg-secondary';
                switch (record.status) {
                    case 'active': badgeClass = 'bg-success'; break;
                    case 'inactive': badgeClass = 'bg-danger'; break;
                }
                return <span className={`badge ${badgeClass}`}>{record.status}</span>;
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

                     <button 
                        type="button" 
                        className={`btn btn-sm ${record.actions.bayut_sync_status === 'synced' ? 'btn-success' : 'btn-warning'}`}
                        onClick={() => sendToBayut(record.actions.id)}
                        title={record.actions.bayut_sync_status === 'synced' ? 'Republish to Bayut' : 'Publish to Bayut'}>
                        <IconSend />
                        {/* {bayutSyncInProgress.includes(record.actions.id) ? ( <span className="animate-spin">⏳</span> ) : ( <IconSend /> )} */}
                    </button>

                       

                </div>
            ),
        },
    ];


     const sendToBayut = async (listingId: number) => {
        try {
            // setBayutSyncInProgress(prev => [...prev, listingId]);
            
            const result = await Swal.fire({
                title: 'Publish to Bayut?',
                text: 'This property will be published on Bayut portal. Continue?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, publish!',
                cancelButtonText: 'Cancel',
            });

            if (result.isConfirmed) {
                const response = await apiClient.post(`${endpoints.bayutSendApi}/${listingId}`);
                
                if (response.data.success) {
                    toast.success('Property published to Bayut successfully!');
                    fetchData(); // Refresh the list
                } else {
                    toast.error(response.data.message || 'Failed to publish to Bayut');
                }
            }
        } catch (error: any) {
            console.error('Error sending to Bayut:', error);
            toast.error(error.response?.data?.message || 'Failed to publish to Bayut');
        } finally {
            // setBayutSyncInProgress(prev => prev.filter(id => id !== listingId));
        }
    };

    return (
        <div>
            <div className="panel flex items-center justify-between overflow-visible whitespace-nowrap p-3 text-dark relative">
                <div className="flex items-center">
                    <div className="rounded-full bg-primary p-1.5 text-white ring-2 ring-primary/30 ltr:mr-3 rtl:ml-3"> <IconEye /></div>
                    <span className="ltr:mr-3 rtl:ml-3">Property Listings</span>
                    <a href="/pages/listing/create-listing" className="btn btn-success btn-sm ml-3"> Add New Listing</a>
                </div>
                
                <div className="flex items-center space-x-2">
                    <button onClick={handleDelete} type="button" className="btn btn-danger btn-sm" disabled={disable}>
                        <IconTrash /> Delete Selected
                    </button>
                    <Select placeholder="Change Status" options={statusOptions} isDisabled={disable} className="w-40" onChange={(selected) => selected && handleStatusChange(selected.value)}
                    />
                </div>
            </div>
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
        </div>
    );
};

export default ViewListing;