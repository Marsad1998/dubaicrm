import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState, AppDispatch } from '../../store';
import Table from '../../components/Table';
import IconBell from '../../components/Icon/IconBell';
import IconPlus from '../../components/Icon/IconPlus';
import IconTrash from '../../components/Icon/IconTrash';
import Toast from '../../services/toast';
import { setPageTitle } from '../../slices/themeConfigSlice';
import { newleads, destoryLeads, assignleads } from '../../slices/leadsSlice';
import Select from 'react-select';
import LeadModal from '../../components/LeadModal';
import '../dashboard/dashboard.css'; 
import Swal from 'sweetalert2';
import { DataTableSortStatus } from 'mantine-datatable';
import { CountryList } from '../../services/status';

const Assign = () => {
    const dispatch = useDispatch<AppDispatch>();
    const toast = Toast();;
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const [disable, setDisable] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    // prevSortStatus: { columnAccessor: 'id', direction: 'desc' } 
    const combinedRef = useRef<any>({  fetched: false,  form: null, prevPage: 1, prevPerPage: 10});

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',  // Correct spelling
        direction: 'desc',
    });

    const { leads, loading, agents, total, current_page, per_page } = useSelector((state: IRootState) => state.leadslices);
    const loginuser       = useSelector((state: IRootState) => state.auth.user || {});
    const [selectedCity, setSelectedCity] = useState<string>('');
    
     useEffect(() => {
        dispatch(setPageTitle('New Leads'));
            
            if (!combinedRef.current.fetched) {
                fetchData();
                combinedRef.current.fetched = true;
                return;
            }
        }, [dispatch, current_page, per_page, sortStatus, searchTerm]);

        const fetchData = (cityName?: string) => {
            dispatch(newleads({
                page: searchTerm ? 1 : current_page,
                perPage : per_page, 
                // sortField: sortStatus.columnAccessor, 
                sortField: sortStatus.columnAccessor === 'date' ? 'created_at' : sortStatus.columnAccessor,
                sortOrder: sortStatus.direction, 
                search: searchTerm, 
                cityname: cityName 
            }));
        };

        const transformedAgents = agents?.map(agent => ({
            value: agent?.client_user_id,
            label: agent?.client_user_name, // Plain text for searching
            phone: agent?.client_user_phone,
            // Custom display component
            customLabel: (
                <>
                    {agent?.client_user_name}
                    {agent?.client_user_designation && (
                        <span style={{ marginLeft: 8 }}>
                            <span className="badge bg-success" style={{ color: '#fff' }}>
                                {agent.client_user_designation}
                            </span>
                        </span>
                    )}
                </>
            ),
        })) || [];


        const formatOptionLabel = ({ label, customLabel }: any) => {
                return customLabel || label;
            };

    const tableData = useMemo(() => {
        return (Array.isArray(leads) ? leads : []).map((lead: any) => ({
            id: lead.lead_id || 'Unknown',
            title: lead.lead_title || 'Unknown',
            name: lead.customer_name || 'Unknown',
            phone: lead.customer_phone || 'Unknown',
            source: lead.lead_source || 'Unknown',
            date: lead.created_at,
        }));
    }, [leads])

    const openLeadModal = () => {
        setIsModalOpen(true);
    };

    const SelectCity = (value: any) => {
         setSelectedRecords([]);
        setSelectedCity(value?.value || '');
        fetchData(value?.value);
        setDisable(true);
    };

    const handleCheckboxChange = (record: any, isChecked: boolean) => {
        if (isChecked) {
            setSelectedRecords((prevSelected) => [...prevSelected, record]);
            setDisable(false);
        } else {
            setSelectedRecords((prevSelected) => prevSelected.filter((selected) => selected.id !== record.id));
            if(selectedRecords.length === 1) { setDisable(true); } 
        }
    };
    const AssignLead = async (agentId: number, phone: number) => {    // basicaly agentId is just varible for number status and agent_id i get her
        if (selectedRecords.length === 0) { 
            toast.error('Please select at least one lead to assign');
            return;
        }
        const leadIds = selectedRecords.map((record) => record.id);
        const formData = new FormData();
        leadIds.forEach((id) => formData.append('lead_id[]', id));
        formData.append('agent_id', agentId.toString());
        // loginuser?.roles[0].name === 'HR' ?  formData.append('status', agentId.toString()) : formData.append('agent_id', agentId.toString());;
        formData.append('agent_phone', phone.toString());
        try {
            const response = await dispatch(assignleads({ formData }) as any);
            if (response.payload.status === 200 || response.payload.status === 201){
                toast.success('Leads Have Been Assigned Successfully');
                setSelectedRecords([]);
                setDisable(true);
                // load data again 
                 dispatch(newleads({
                    page: searchTerm ? 1 : current_page,
                    perPage : per_page, 
                    sortField: sortStatus.columnAccessor, 
                    sortOrder: sortStatus.direction, 
                    search: searchTerm 
                }));

            }
        } catch (error) {
            toast.error('Failed to assign leads');
        }
    };

    const RemoveLead = async () => {
        if (selectedRecords.length === 0) {
            toast.error('Please select at least one lead to remove');
            return;
        }
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to remove ${selectedRecords.length} selected lead(s). This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });
        if (result.isConfirmed) {
            try {
                const leadIds = selectedRecords.map((record) => record.id);
                const formData = new FormData();
                leadIds.forEach((id) => formData.append('lead_id[]', id));
                const response = await dispatch(destoryLeads({ formData }) as any);
                if (response.payload.status === 200 || response.payload.status === 201) {
                    toast.success('Lead removed successfully');
                    setSelectedRecords([]);
                    setDisable(true);
                } else { toast.error('Failed to remove leads. Please try again.'); }
            } catch (error) {
                toast.error('An error occurred while removing leads.');
            }
        }
    };

    const handlePageChange = (page: number) => {
        dispatch(newleads({ 
            page,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: searchTerm  
        }));
        setSelectedRecords([]);
        setDisable(true);
    };

    const handlePerPageChange = (pageSize: number) => {
        dispatch(newleads({ 
            perPage: pageSize,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: searchTerm  
        }));
        setSelectedRecords([]);
        setDisable(true);
    };

    const handleSortChange = (status: DataTableSortStatus) => {
        setSortStatus(status);
         dispatch(newleads({ 
            page: 1, 
            perPage: per_page,
            sortField: status.columnAccessor === 'date' ? 'created_at' : status.columnAccessor,
            sortOrder: status.direction,
            search: searchTerm  
        }));
        setSelectedRecords([]);
        setDisable(true);
    };

     const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newSearchTerm = e.target.value;
            setSearchTerm(newSearchTerm);
            dispatch(newleads({ 
                page: 1, 
                perPage: per_page,
                sortField: sortStatus.columnAccessor,
                sortOrder: sortStatus.direction,
                search: newSearchTerm  
            }));
    
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
        { accessor: 'title', title: 'Title', sortable: true },
        { accessor: 'name', title: 'Name', sortable: true },
        { accessor: 'phone', title: 'Phone', sortable: true },
        { 
            accessor: 'source', 
            title: 'Source', 
            sortable: true,
            render: (record: any) => {
                switch (record.source) {
                    case 'Facebook': return <span className="badge bg-info">Facebook</span>;
                    case 'Instagram': return <span className="badge bg-secondary">Instagram</span>;
                    case 'created own': return <span className="badge bg-success">Created own</span>;
                    case 'Website': return <span className="badge bg-warning">Website</span>;
                    case 'Reshuffle': return <span className="badge bg-primary">Reshuffle</span>;
                    case 'Walk-in': return <span className="badge bg-danger">Walk-in</span>;
                    case 'Marketing': return <span className="badge bg-success">Marketing</span>;
                    case 'Other': return <span className="badge bg-secondary">Other</span>;
                    default: return <span className="badge bg-secondary">Unknown</span>;
                }
            },
        },
        { accessor: 'date', title: 'Date', sortable: true },
    ];

    return (
        <div>
            <div className="panel flex items-center justify-between overflow-visible whitespace-nowrap p-3 text-dark relative">
                <div className="flex items-center">
                    <div className="rounded-full bg-primary p-1.5 text-white ring-2 ring-primary/30 ltr:mr-3 rtl:ml-3"> 
                        <IconBell /> 
                    </div>
                    <span className="ltr:mr-3 rtl:ml-3">Details of Your New Leads: </span>
                    <button onClick={openLeadModal} className="btn btn-success btn-sm"><IconPlus />Add Lead </button>
                </div> 
                <div className="flex items-center space-x-2">
                        <Select 
                            placeholder="Choose City.." 
                            options={CountryList.map(item => ({ value: item.value, label: item.name }))} 
                            onChange={SelectCity}
                            className="cursor-pointer custom-multiselect z-10 w-[300px]" 
                            isClearable
                        />
                        <Select 
                            placeholder="Select an option" 
                            options={transformedAgents} 
                            isDisabled={disable} 
                            className="cursor-pointer custom-multiselect z-10 w-[300px]" 
                            formatOptionLabel={formatOptionLabel}
                            getOptionLabel={option => option.label} 
                            getOptionValue={option => option.value}
                            onChange={(selectedOption) => {  
                                if (selectedOption?.value !== undefined) { 
                                    AssignLead(selectedOption.value, selectedOption.phone); 
                                } 
                            }} 
                        />
                    <button 
                        onClick={RemoveLead} 
                        type="button" 
                        className="btn btn-default btn-sm" 
                        style={{ background: "#d33", color: '#fff' }} 
                    > 
                        <IconTrash/> 
                    </button>
                </div>
            </div>
            <div className="datatables mt-6">
                <Table 
                    title="New Leads"  
                    columns={columns}  
                    rows={tableData}  
                    totalRecords={total || 0}  
                    currentPage={current_page} 
                    recordsPerPage={per_page}
                    onPageChange={handlePageChange} 
                    onRecordsPerPageChange={handlePerPageChange} 
                    onSortChange={handleSortChange} 
                    sortStatus={sortStatus} 
                    isLoading={loading}
                    onSearchChange={onSearchChange}
                    searchValue={searchTerm}
                    noRecordsText="No records found matching your search criteria"
                />
            </div>
            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default Assign;
