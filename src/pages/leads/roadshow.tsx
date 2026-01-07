import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState, AppDispatch } from '../../store';
import Table from '../../components/Table';
import IconBell from '../../components/Icon/IconBell';
import IconTrash from '../../components/Icon/IconTrash';
import IconPlus from '../../components/Icon/IconPlus';
import { useNavigate } from 'react-router-dom';
import Toast from '../../services/toast';
import { setPageTitle } from '../../slices/themeConfigSlice';
import { roadshowleads, destoryLeads, download } from '../../slices/leadsSlice';
import Select from 'react-select';
import LeadModal from '../../components/LeadModal';
import { CountryList } from '../../services/status';
import { DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import "jspdf-autotable";
import autoTable from 'jspdf-autotable';


const RoadShow = () => {
    const dispatch = useDispatch<AppDispatch>();
    const toast = Toast();
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const [disable, setDisable] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'lead_id',
        direction: 'desc',
    });
    const { leads, loading, total, current_page, per_page } = useSelector((state: IRootState) => state.leadslices);
    useEffect(() => {
        dispatch(setPageTitle('RoadShow Leads'));
        const fetchData = () => {
            dispatch(roadshowleads({
                page: searchTerm ? 1 : current_page,
                perPage: per_page,
                sortField: sortStatus.columnAccessor === 'date' ? 'updated_at' : sortStatus.columnAccessor,
                sortOrder: sortStatus.direction,
                search: searchTerm,
                cityname: selectedCity
            }));
        };
        fetchData();
    }, [dispatch, current_page, per_page, sortStatus, searchTerm, selectedCity]);

    const openLeadModal = () => {
        setIsModalOpen(true);
    };

    const SelectCity = (value: any) => {
        setSelectedCity(value?.value || '');
        setSelectedRecords([]);
        setDisable(true);
    };

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
                    dispatch(roadshowleads({ 
                        page: current_page,
                        perPage: per_page,
                        sortField: sortStatus.columnAccessor,
                        sortOrder: sortStatus.direction,
                        search: searchTerm,
                        cityname: selectedCity
                    }));
                } else {
                    toast.error('Failed to remove leads. Please try again.');
                }
            } catch (error) {
                toast.error('An error occurred while removing leads.');
            }
        }
    };

    const handlePageChange = (page: number) => {
        dispatch(roadshowleads({ 
            page,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: searchTerm,
            cityname: selectedCity  
        }));
        setSelectedRecords([]);
        setDisable(true);
    };

    const handlePerPageChange = (pageSize: number) => {
        dispatch(roadshowleads({ 
            perPage: pageSize,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: searchTerm,
            cityname: selectedCity 
        }));
        setSelectedRecords([]);
        setDisable(true);
    };

    const handleSortChange = (status: DataTableSortStatus) => {
        setSortStatus(status);
        dispatch(roadshowleads({ 
            page: 1,
            sortField: status.columnAccessor,
            sortOrder: status.direction,
            search: searchTerm,
            cityname: selectedCity  
        }));
    };

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        dispatch(roadshowleads({ 
            page: 1,
            sortField: sortStatus.columnAccessor,
            sortOrder: sortStatus.direction,
            search: newSearchTerm,
            cityname: selectedCity  
        }));
    };

    const tableData = useMemo(() => {
        return (Array.isArray(leads) ? leads : []).map((lead: any) => ({
            id: lead.lead_id || 'Unknown',
            title: lead.lead_title || 'Unknown',
            name: lead.customer_name || 'Unknown',
            phone: lead.customer_phone || 'Unknown',
            email: lead.customer_email || 'Unknown',
            date: lead.created_at ? new Date(lead.created_at).toLocaleString() : 'Unknown',
        }));
    }, [leads]);

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
            accessor: 'email',
            title: 'Email',
            sortable: true,
            render: (record: any) => (
                <span 
                    className="badge bg-secondary cursor-pointer" 
                    onClick={() => {
                        navigator.clipboard.writeText(record.email)
                            .then(() => toast.success('Email copied to clipboard!'))
                            .catch(() => toast.error('Failed to copy email'));
                    }}
                >
                    {record.email}
                </span>
            ),
        },
        { accessor: 'date', title: 'Date', sortable: true },
    ];

    // const handleDownloadPdf = async () => {
    //     const formData = new FormData();
    //     if (selectedCity) formData.append('cityname', selectedCity);
    //     await dispatch(download({ formData, cityname: selectedCity }) as any);
    // };


    const handleDownloadPdf = async () => {
    try {
        const formData = new FormData();
        if (selectedCity) formData.append("cityname", selectedCity);

        const response = await dispatch(download({ formData, cityname: selectedCity }) as any);
        const data = response?.payload?.data || [];

        if (!data || data.length === 0) {
            toast.error("No data available to export.");
            return;
        }

        // ✅ Create jsPDF instance
        const doc = new jsPDF("p", "pt", "a4");
        doc.setFontSize(14);
        doc.text(`Roadshow Leads - ${selectedCity}`, 40, 40);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 60);

        // ✅ Define table headers & rows
        const tableColumn = ["#", "Lead Title", "Name", "Phone", "Email"];
        const tableRows = data.map((lead: any, index: number) => [
            index + 1,
            lead.lead_title || "-",
            lead.customer_name || "-",
            lead.customer_phone || "-",
            lead.customer_email || "-",
        ]);

        // ✅ Create table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 80,
            styles: { fontSize: 9, cellPadding: 4 },
            headStyles: { fillColor: [139, 93, 59], textColor: 255 }, // your theme brown
        });

        // ✅ Save PDF
        doc.save(`Roadshow-Leads-${selectedCity}.pdf`);
        toast.success("PDF downloaded successfully!");
    } catch (error) {
        toast.error("Failed to generate PDF.");
        console.error(error);
    }
};

    return (
        <div>
            <div className="panel flex items-center justify-between overflow-visible whitespace-nowrap p-3 text-dark relative">
                <div className="flex items-center">
                    <div className="rounded-full bg-primary p-1.5 text-white ring-2 ring-primary/30 ltr:mr-3 rtl:ml-3"> 
                        <IconBell /> 
                    </div>
                    <span className="ltr:mr-3 rtl:ml-3">Details of Your RoadShow Leads: </span>
                    <button onClick={openLeadModal} className="btn btn-success btn-sm"> 
                        <IconPlus /> Add Lead  
                    </button>
                </div> 
                <div className="flex items-center space-x-2">
                    <Select 
                        placeholder="Choose City.." 
                        options={CountryList.map(item => ({ value: item.value, label: item.name }))} 
                        onChange={SelectCity}
                        className="cursor-pointer custom-multiselect z-10 w-[300px]" 
                        isClearable
                    />
                    {selectedCity && (
                    <button onClick={handleDownloadPdf} type="button" className="btn btn-secondary btn-sm">
                        Download PDF
                    </button>
                    )}                    
                    <button 
                        onClick={RemoveLead} 
                        type="button" 
                        className="btn btn-default btn-sm" 
                        style={{ background: "#d33", color: '#fff' }} 
                        disabled={disable}
                    > 
                        <IconTrash/> 
                    </button>
                </div>
            </div>
            <div className="datatables mt-6">
                <Table 
                    title="RoadShow Leads"  
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

export default RoadShow;