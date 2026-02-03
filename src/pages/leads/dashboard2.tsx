import { useEffect, useState } from 'react';
import { useDashboardStates } from '../../hooks/useDashboardStates';
import { DashboardLeadslist, setLoading, updateSingleLead, createLeads, uploadFiles, getFiles, voiceCall, voiceCallLogs } from '../../slices/dashboardSlice';
import { setPageTitle } from '../../slices/themeConfigSlice';
import PerfectScrollbar from 'react-perfect-scrollbar';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconMenu from '../../components/Icon/IconMenu';
import IconRefresh from '../../components/Icon/IconRefresh';
import Tippy from '@tippyjs/react';
import IconVideo from '../../components/Icon/IconVideo';
import { Link, useParams } from 'react-router-dom';
import IconSearch from '../../components/Icon/IconSearch';
import Loader3 from '../../services/loader3';
import IconBookmark from '../../components/Icon/IconBookmark';
import IconUser from '../../components/Icon/IconUser';
import IconPhone from '../../components/Icon/IconPhone';
import IconArrowLeft from '../../components/Icon/IconArrowLeft';
import IconFile from '../../components/Icon/IconFile';
import IconEye from '../../components/Icon/IconEye';
import IconMail from '../../components/Icon/IconMail';
import Select from 'react-select';
import LeadModal from '../../components/LeadModal';
import RemarkModal from '../../components/RemarkModal';
import CallLogModal from '../../components/CallLogModal';
import FileViewerModal from '../../components/FileViewerModal';
import CustomSideNav from '../../components/CustomSideNav';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { IconOption } from '../../components/Icon';
import { useTwilioDevice } from '../../hooks/useTwilioDevice';
import Dialer from '../../components/Dialer';
import AiCallModal from '../../components/AiCallModal';
import { set } from 'date-fns';

const DashboardBox2 = () => {
    const { dashboardType } = useParams();
    const {
        dispatch, navigate, TopbarStatuses, HrTopBarStatus, uniqueDropdownList, hrSidebarStatus,
        Statues, loader2, SidebarStatuses, colorsarray, hrdropdownOption, toast, all_statuses,
        loginuser, leads, currentStatus, loading, meta, counters, isRtl, combinedRef, fileInputRef,
        AllLeadList, setAllLeadList, selectedLead, setSelectedLead, selectedTab, setSelectedTab,
        isShowMailMenu, setIsShowMailMenu, isEdit, setIsEdit, searchText, setSearchText, isModalOpen, setIsModalOpen,
        errors, setErrors, date, setDate, IsDisable, setIsDisable, IsColor, setsColor, IsRemarkData, SetIsRemarkData,
        IsCallLogData, SetIsCallLogData, isCallLog, setCallLog,
        isMemark, setIsMemark, isOpen, setIsOpen, files, setFiles, isFileViewerOpen, setIsFileViewerOpen,
        isCustomizerOpen, setIsCustomizerOpen, overall_leads
    } = useDashboardStates();

     const { makeCall, isInitialized } = useTwilioDevice(`${loginuser?.client_user_id || 'guest'}`);

     const [showDialer, setShowDialer] = useState(false);
     const [isAiCallModal, setIsAiCallModal] = useState(false);
     const [aiCallData, setAiCallData] = useState<any[]>([]);
     const [selectedOption, setSelectedOption] = useState<any>(null);
     const [showComments, setShowComments] = useState(false);

    useEffect(() => {    

        console.log('Dashboard Type:', hrdropdownOption);

        dispatch(setPageTitle('Dashboard'));
        if (loginuser?.client_user_id && !combinedRef.current.fetched) {
            dispatch(DashboardLeadslist({search: searchText, dashboardType: dashboardType || 'all'}));
            combinedRef.current.fetched = true;
        }
    }, [loginuser?.client_user_id, dispatch, dashboardType]);
    useEffect(() => {
        if (loginuser?.client_user_id) {
            const delayDebounceFn = setTimeout(() => {
                dispatch(DashboardLeadslist({search: searchText, dashboardType: dashboardType || 'all'}));
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchText, loginuser?.client_user_id, dashboardType]);
    
    useEffect(() => {
        if(currentStatus > 0){         
            getLeads(currentStatus);
        }else{
            setAllLeadList(leads || []);
        }
    }, [leads]);

    const getStatusById = (id: number): any => {
        return (all_statuses as any[]).find(
            (s: any) => Number(s.value) === Number(id)
        );
    };


    const LeadsTabs = async (status: number) => {
        combinedRef.current.ishideshow = true;
        const response = await dispatch(DashboardLeadslist({ page_number : meta.current_page , lead_status : status, dashboardType: dashboardType || 'all', search: searchText  }) as any);
        if(response.payload.status === 200 || response.payload.status === 201){
             setSelectedTab(status);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (combinedRef.current.form) {
            const formData = new FormData(combinedRef.current.form);
            const selectedStatus = formData.get('lead_status');
            formData.append('current_status', currentStatus.toString());
            try {
                dispatch(setLoading(true));
                const response = await dispatch(updateSingleLead({ formData }) as any);
                if (response.payload.status === 200 || response.payload.status === 201){
                    toast.success('Lead Updated Successfully');
                    LeadsTabs(Number(selectedStatus));
                    setSelectedLead(null);
                }else{
                    setErrors(response.payload.errors);
                    return
                }
            } catch (error: any) { console.error('Error creating/updating news:', error); 
            } finally{
                dispatch(setLoading(false));
            }
        }
    }
    
    const getLeads = (status: number) => {
        const filterLead = leads.filter((lead: any) => lead.lead_status == status);        
        setAllLeadList(filterLead);
        setSelectedTab(status);
    };
    
    const handlePageChange = async (page_number: number) => {
        if (page_number >= 1 && page_number <= meta.total) {
            await dispatch(DashboardLeadslist({ page_number : page_number, lead_status : currentStatus, dashboardType: dashboardType || 'all', search: searchText  }) as any);
            setSelectedTab(currentStatus);
        }
    };
    const openLeadModal = () => {
        setIsModalOpen(true);
    } 
    const handleSelectChange = (e:any) => {
         setDate(null);
        setSelectedOption(e);
        if((e.value == 7 || e.value === 7) || (e.value == 19 || e.value === 19)){
            setIsDisable(false);
            setsColor('');
        }else{
            setIsDisable(true);
            setsColor('hsl(0, 0%, 95%)');
            // setDate('');
        }
    }
    const Refresh = () => {
        window.location.reload();
    }
    const RemarkHistory = (data:any) => {
        const $data  =JSON.parse(data);
        SetIsRemarkData($data)
        setIsMemark(true);
    }

    async function callLogHistory(data: any) {
        const response = await dispatch(voiceCallLogs(data));
        setCallLog(true);
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files.length > 0 && selectedLead) {
         const formData = new FormData();
            Array.from(e.target.files).forEach((file) => { formData.append('lead_files[]', file); });
        try {
                dispatch(setLoading(true));
                await dispatch(uploadFiles({ leadId: selectedLead.lead_id, files: formData }) as any);
                toast.success('Files uploaded successfully');
                await dispatch(DashboardLeadslist({ page_number: meta.current_page, lead_status: currentStatus }) as any);
            } catch (error) {
                toast.error('Failed to upload files');
            } finally {
                dispatch(setLoading(false));
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
    }
   };
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

     const viewFiles = async (leadId: any) => {
        try {
            dispatch(setLoading(true));
            const resultAction = await dispatch(getFiles(leadId));
            const fetchedFiles = getFiles.fulfilled.match(resultAction) ? resultAction.payload : [];
            setFiles(fetchedFiles);
            setIsFileViewerOpen(true);
        } catch (error) {
            toast.error('Failed to load files');
            console.error("Error viewing files:", error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const exportCSV = async () => {
        if (!selectedTab) {
            toast.error('Please select any leads status first, Like Cold,Warm, Hot Lead');
            return;
        }
        try {
            dispatch(setLoading(true));
            const response = await dispatch(DashboardLeadslist({ page_number: meta.current_page,  lead_status: selectedTab,  dashboardType: 'csv' }) as any);
             if (response.payload.leadsdata) {
                const link = document.createElement('a');
                link.href = response.payload.leadsdata;
                link.target = '_blank';
                link.click();
                Refresh();
            
            } else {
                toast.error('Failed to export CSV');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong while exporting CSV');
        } finally {
            dispatch(setLoading(false));
        }
    };

    const AssignToAgent = async (leadId: any) => {
        try {
            // dispatch(setLoading(true));
            // alert(leadId);
            setIsCustomizerOpen(true);
            // const resultAction = await dispatch(getFiles(leadId));
            // const fetchedFiles = getFiles.fulfilled.match(resultAction) ? resultAction.payload : [];
            // setFiles(fetchedFiles);
            // setIsFileViewerOpen(true);
        } catch (error) {
            // toast.error('Failed to load files');
            // console.error("Error viewing files:", error);
        } finally {
            // dispatch(setLoading(false));
        }
    };
    
    return (
        <div>
            <div className="flex gap-5 relative sm:h-[calc(100vh_-_150px)] h-full">
                <div className={`overlay bg-black/60 z-[5] w-full h-full rounded-md absolute hidden ${isShowMailMenu ? '!block xl:!hidden' : ''}`}
                onClick={() => setIsShowMailMenu(!isShowMailMenu)}></div>

                <div className="panel p-0 flex-1 overflow-x-hidden h-full">
                    {!selectedLead && !isEdit && (
                        <div className="flex flex-col h-full">
                             <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-3 sm:p-4">
                                <div className="flex w-full sm:w-auto items-center gap-[0.5]">
                                    <div>
                                        <Tippy content="Refresh">
                                            <button type="button" onClick={Refresh} className="hover:text-primary flex items-center p-2">
                                                <IconRefresh className="w-5 h-5" />  
                                                {loginuser?.roles[0]?.name === 'super admin' && (
                                                    <span className="badge bg-dark text-white ml-2">Overall Leads: {overall_leads}</span>
                                                )}
                                            </button>
                                        </Tippy>
                                    </div>
                                    <div>
                                        <Tippy content="Add Lead">
                                            <button type="button" onClick={openLeadModal} className="hover:text-primary flex items-center p-2">
                                                <span className="badge bg-success text-white">Add Lead</span>
                                            </button>
                                        </Tippy>
                                    </div>
                                     <div>
                                        <Link to={'/'}>
                                            <button type="button" className="hover:text-primary flex items-center p-2">
                                                <span className="badge bg-info text-white">Leads Analytics</span>
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                    <div className="flex items-center w-full sm:w-auto">
                                        <button type="button" className="xl:hidden hover:text-primary mr-3 p-1" onClick={() => setIsShowMailMenu(!isShowMailMenu)}>
                                            <IconMenu className="w-5 h-5"/>
                                        </button> 
                                        {/* <div className="gap-1">
                                            {combinedRef.current.ishideshow && (
                                                <div className="relative inline-block">
                                               
                                                <div
                                                    className="inline-block"
                                                    style={{
                                                    backgroundColor: '#146c43', 
                                                    padding: '1px',
                                                    borderRadius: '6px',
                                                    clipPath:
                                                        'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)'
                                                    }}
                                                 >
                                                    <button
                                                    onClick={() => exportCSV()}
                                                    type="button"
                                                    className="flex items-center justify-center px-4 py-1.5 text-[12px] font-medium transition-all duration-200 select-none rounded"
                                                    style={{
                                                        backgroundColor: '#198754', 
                                                        color: '#fff',
                                                        clipPath:
                                                        'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)'
                                                    }}
                                                    >
                                                    Export CSV
                                                    </button>
                                                </div>
                                            </div>
                                            )}
                                        </div> */}

                                         &nbsp; &nbsp;
                                        <div className="relative flex-1 sm:flex-none">
                                            <input type="text" className="form-input w-full sm:w-[200px] pr-8 rounded-sm" placeholder="Search Lead" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 peer-focus:text-primary"> <IconSearch className="w-4 h-4"/> </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                                        <div className="text-sm whitespace-nowrap"> {meta.from + '-' + (meta.to) + ' of ' + meta.total} </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handlePageChange(meta.current_page - 1)} type="button" disabled={meta.current_page === 1}className="bg-[#f4f4f4] rounded-md p-1.5 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30 disabled:opacity-60 disabled:cursor-not-allowed"
                                            > <IconCaretDown className="w-4 h-4 rtl:-rotate-90 rotate-90" /> </button>
                                            <button onClick={() => handlePageChange(meta.current_page + 1)} type="button" disabled={meta.current_page === meta.total} className="bg-[#f4f4f4] rounded-md p-1.5 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30 disabled:opacity-60 disabled:cursor-not-allowed"> <IconCaretDown className="w-4 h-4 rtl:rotate-90 -rotate-90" /> </button>
                                        </div>
                                    </div>
                                </div>
                            </div> 
                            <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>
                            <div className="flex flex-wrap flex-col md:flex-row xl:w-auto justify-between items-center px-2 sm:px-4">
                             <div className="w-full">
                                <div className="flex flex-wrap items-center gap-2">
                                    {(loginuser?.roles[0].name === 'HR' || dashboardType === 'hr'
                                        ? HrTopBarStatus
                                        : TopbarStatuses
                                    ).map((status: any) => {
                                        const topcounter = counters[status.id] || 0;
                                        const isActive = selectedTab === status.id;

                                        return (
                                            <button
                                                key={status.id}
                                                onClick={() => LeadsTabs(status.id)}
                                                type="button"
                                                className="hover:text-primary flex items-center p-1"
                                            >
                                                <span 
                                                    className={`badge rounded-sm ${isActive ? 'ring-2 ring-primary/30' : ''}`}
                                                    style={{
                                                        backgroundColor: isActive ? status.color : `${status.color}20`,
                                                        color: isActive ? 'white' : status.color,
                                                    }}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        <span className="w-4 h-4 flex items-center justify-center">
                                                            {IconOption.find((icon) => icon.value == status.icon)?.label}
                                                        </span>
                                                        <span className="whitespace-nowrap">{status.name}</span>
                                                        {topcounter >= 0 && (
                                                            <span className="ml-1 text-xs font-bold px-1 bg-white/20 rounded">
                                                                {topcounter}
                                                            </span>
                                                        )}
                                                    </div>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div> 
                          </div>
                            <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>
                                {loading ? (
                                    <Loader3 />
                                ) : Array.isArray(AllLeadList) && AllLeadList?.length ? (
                                    <div className="table-responsive grow overflow-y-auto sm:min-h-[300px] min-h-[400px]">
                                        <table className="table-hover">
                                            <tbody>
                                              { AllLeadList?.map((lead: any) => {
                                                    return (
                                                        <tr key={lead.lead_id} className="cursor-pointer" onClick={() => setSelectedLead(lead)}>
                                                            <td>
                                                                <div className="flex items-center whitespace-nowrap">
                                                                    <div className="ltr:mr-1 rtl:ml-1">
                                                                        <Tippy content="Important">
                                                                            <button
                                                                                type="button" className={`enabled:hover:text-primary disabled:opacity-60 flex items-center ${ 
                                                                                    lead.isImportant ? 'text-primary' : ''
                                                                                }`}>
                                                                                <IconUser/>
                                                                            </button>
                                                                        </Tippy>
                                                                    </div>
                                                                    <div className={`dark:text-gray-300 whitespace-nowrap font-semibold ${ !lead.isUnread ? 'text-gray-500 dark:text-gray-500 font-normal' : ''}`}
                                                                    > {lead?.customer_name || 'Not Found'}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="flex items-center whitespace-nowrap">
                                                                    <div className="ltr:mr-1 rtl:ml-1">
                                                                        <Tippy content="Important">
                                                                            <button
                                                                                type="button" className={`enabled:hover:text-primary disabled:opacity-60 flex items-center ${ 
                                                                                    lead.isImportant ? 'text-primary' : ''
                                                                                }`}>
                                                                                <IconPhone/>
                                                                            </button>
                                                                        </Tippy>
                                                                    </div>
                                                                    <div className={`dark:text-gray-300 whitespace-nowrap font-semibold ${ !lead.isUnread ? 'text-gray-500 dark:text-gray-500 font-normal' : ''}`}
                                                                    > {lead?.customer_phone || 'Not Found'}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="flex items-center whitespace-nowrap">
                                                                    <div className="ltr:mr-3 rtl:ml-3">
                                                                        <Tippy content="Important">
                                                                            <button type="button" className={`enabled:hover:text-primary disabled:opacity-60 rotate-90 flex items-center ${ lead.isImportant ? 'text-primary' : ''
                                                                                }`}>
                                                                                <IconBookmark bookmark={false} className={`w-4.5 h-4.5 ${lead.isImportant && 'fill-primary'}`} />
                                                                            </button>
                                                                        </Tippy>
                                                                    </div>
                                                                    <div className={`dark:text-gray-300 whitespace-nowrap font-semibold ${ !lead.isUnread ? 'text-gray-500 dark:text-gray-500 font-normal' : ''}`}
                                                                    > {lead?.lead_title || 'Not Found'}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="flex items-center whitespace-nowrap">
                                                                    <div className={`dark:text-gray-300 whitespace-nowrap font-semibold ${!lead.isUnread ? 'text-gray-500 dark:text-gray-500 font-normal' : ''}`}>
                                                                        { lead.agents?.client_user_name || 'Not Found' }
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="flex items-center">
                                                                    {colorsarray.find((data) => data.value == lead?.lead_status) && (
                                                                        <div className={`w-2 h-2 rounded-full ${
                                                                                colorsarray.find((data) => data.value == lead?.lead_status)?.bgColor
                                                                            }`}
                                                                        ></div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="whitespace-nowrap font-medium ltr:text-right rtl:text-left">{lead?.assigned_at || 'Not Found'}</td> 
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="grid place-content-center min-h-[300px] font-semibold text-lg h-full">No data available</div>
                                )}
                        </div>
                    )}
                    { selectedLead && !isEdit && (
                        <div>
                            <div className="flex items-center justify-between flex-wrap p-4">
                                <div className="flex items-center">
                                    <button type="button" className="ltr:mr-2 rtl:ml-2 hover:text-primary" onClick={() => setSelectedLead(null)}>
                                        <IconArrowLeft className="w-5 h-5 rotate-180" />
                                    </button>
                                    <h4 className="text-base md:text-lg font-medium ltr:mr-2 rtl:ml-2"> {selectedLead?.lead_title} </h4>
                                </div>
                                <div className="flex gap-2">
                                    <Tippy content="Show Call Logs">
                                        <button
                                            type="button"
                                            onClick={() => callLogHistory(selectedLead)}
                                            className="btn btn-success btn-sm rounded-sm"
                                        >
                                            Show Call Logs
                                        </button>
                                        </Tippy>

                                    {selectedLead?.qualifications && selectedLead.qualifications.length > 0 && (
                                      <Tippy content="AI Response">
                                        <button type="button" onClick={() => { setAiCallData(selectedLead.qualifications); setIsAiCallModal(true); }} className="btn btn-info btn-sm"
                                        > AI Response </button>
                                     </Tippy>
                                    )}
                                    </div>
                            </div>
                            <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>

                            <div className="p-4 relative">
                                {loading && loader2}
                                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-5">
                                    <div className="panel xl:col-span-2 md:col-span-2">
                                        <div className="flex items-center justify-between mb-5">
                                            {loginuser?.roles[0].name === 'HR' ? (
                                                <>
                                                    <h5 className="font-semibold text-lg dark:text-white-light"> Job Seeker Detail</h5>
                                                    <div className="flex items-center">
                                                        <button type="button" className="btn btn-success" onClick={triggerFileInput}>
                                                            <IconFile className="w-4 h-4" />
                                                            <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.png,.jpeg,.webp,.txt"
                                                            />
                                                        </button>
                                                        &nbsp; &nbsp;
                                                        <button type="button" className="btn btn-secondary" onClick={() => selectedLead && viewFiles(selectedLead?.lead_id)}
                                                        > <IconEye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    { (selectedLead.lead_source == "Facebook" || selectedLead.lead_source == "Instagram" || selectedLead.lead_source == "AI Chat Bot") && (
                                                        <>
                                                            <Tippy content="Lead Details">
                                                                <button type="button" onClick={() => RemarkHistory(selectedLead?.field_data)} className="btn btn-success btn-sm rounded-sm">
                                                                    Lead Details
                                                                </button>
                                                            </Tippy>
                                                        </>
                                                   )}
                                                </>
                                            ) : (
                                                <>
                                                <div className="flex items-center">
                                                       <h5 className="font-semibold text-lg dark:text-white-light">
                                                        {dashboardType === 'hr' ? 'Employee Detail' : 'Client Detail'}</h5>
                                                        &nbsp; &nbsp;
                                                        {loginuser?.roles[0].name === 'super admin' && dashboardType !== 'hr' && (
                                                            <div className="relative inline-block">
                                                                <div
                                                                style={{
                                                                    backgroundColor: '#805dca',
                                                                    padding: '1px',
                                                                    borderRadius: '6px',
                                                                    clipPath:
                                                                    'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)',
                                                                }}
                                                                >
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                    selectedLead && AssignToAgent(selectedLead?.lead_id)
                                                                    }
                                                                    className="flex items-center justify-center px-4 py-1.5 text-[12px] font-medium transition-all duration-200 select-none rounded"
                                                                    style={{
                                                                    backgroundColor: '#805dca',
                                                                    color: '#fff',
                                                                    clipPath:
                                                                        'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)',
                                                                    }}
                                                                >
                                                                    Transfer Lead
                                                                </button>
                                                                </div>
                                                            </div>
                                                            )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        { (selectedLead.lead_source == "Facebook" || selectedLead.lead_source == "Instagram" || selectedLead.lead_source == "AI Chat Bot") && (
                                                            <>
                                                                <Tippy content="Lead Details">
                                                                    <button type="button" onClick={() => RemarkHistory(selectedLead?.field_data)} className="btn btn-success btn-sm rounded-sm">
                                                                        Lead Details
                                                                    </button>
                                                                </Tippy>
                                                            </>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="data">
                                            <ul className="mt-5 m-auto space-y-4 font-semibold text-white-dark">
                                                <li className="flex items-center gap-2 text-dark">
                                                    <IconUser className="shrink-0" />
                                                    {selectedLead?.customer_name || 'Not-Found'}
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <IconPhone /> <span className="whitespace-nowrap text-secondary" dir="ltr"> {selectedLead?.customer_phone || 'Not-Found'} </span>
                                                    <button type="button" className="btn btn-secondary btn-sm ml-2 rounded-sm" disabled={!isInitialized} onClick={() => setShowDialer(true)} >
                                                        <IconPhone/>
                                                    </button> 

                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <IconPhone />
                                                    <span className="whitespace-nowrap text-secondary" dir="ltr">
                                                    {selectedLead?.customer_phone2 || 'Not-Found'}
                                                    </span>
                                                </li>
                                                <li>
                                                    <button className="flex items-center gap-2">
                                                        <IconMail className="w-5 h-5 shrink-0" />
                                                        <span className="text-info truncate">{selectedLead?.customer_email || 'Not-Found'}</span>
                                                    </button>
                                                </li>
                                                <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>
                                                <li className="flex items-center gap-2"> <IconUser className="shrink-0" />
                                                    { selectedLead?.agents?.client_user_name || 'Not-Found' }
                                                </li>
                                                <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>
                                            </ul>
                                        </div>
                                        <form encType="multipart/form-data" ref={(el) => (combinedRef.current.form = el)} onSubmit={handleSubmit}>
                                            <div className="mt-1">
                                                <div className="flex flex-col justify-between lg:flex-row">
                                                    <div className="w-full cursor-pointer">
                                                        <div className="mt-3">
                                                            <label className="block text-sm font-semibold mb-3 text-dark dark:text-white-light">Move Lead to:</label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {(loginuser?.roles[0].name == 'HR' || dashboardType == 'hr' ? Object.values(hrdropdownOption || {}) : Object.values(uniqueDropdownList || {})).filter((option: any) => option.value !== 9).map((option: any) => {
                                                                    const colorStyle = option.color || '#d1d5db';
                                                                    const isSelected = selectedOption?.value === option.value;
                                                                    return (
                                                                        <label key={option.value} className="cursor-pointer relative">
                                                                            <input 
                                                                                type="radio" 
                                                                                name="lead_status" 
                                                                                value={option.value}
                                                                                onChange={(e) => handleSelectChange(option)}
                                                                                className="sr-only"
                                                                            />
                                                                            <span 
                                                                                className="badge rounded-sm"
                                                                                style={{
                                                                                    borderColor: colorStyle,
                                                                                    backgroundColor: isSelected ? colorStyle : '#fff',
                                                                                    color: isSelected ? '#fff' : colorStyle
                                                                                }}
                                                                            >
                                                                                {option.label}
                                                                            </span>
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                            <input type="hidden" name="lead_id" className="form-input" defaultValue={selectedLead?.lead_id} />
                                                            <input type="hidden" name="agent_id" className="form-input" defaultValue={selectedLead?.agent_id} />
                                                            <input type="hidden" name="login_user_id" className="form-input" defaultValue={loginuser?.client_user_id}/>
                                                            {errors?.lead_status && <p className="text-danger error mt-2">{errors.lead_status[0]}</p>}
                                                        </div>
                                                        {loginuser?.roles[0].name !== 'HR' && (
                                                            <div className={`mt-4 ${selectedOption?.value == 7 || selectedOption?.value == 19 ? '' : 'hidden'}`}>
                                                                <Flatpickr 
                                                                    value={selectedOption?.value == 7 || selectedOption?.value == 19 ? date : ''} 
                                                                    name="meeting_date" 
                                                                    options={{ enableTime:true, dateFormat: 'Y-m-d H:i'}} 
                                                                    className="form-input" 
                                                                    placeholder='Confirmed Meeting Date'  
                                                                /> 
                                                                {errors?.meeting_date && <p className="text-danger error">{errors.meeting_date[0]}</p>}
                                                            </div>
                                                        )}

                                                        <div className="mt-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <label className="block text-sm font-semibold mb-2 text-dark dark:text-white-light">Comments:</label>
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => setShowComments(!showComments)}
                                                                    className="text-xs text-secondary hover:text-secondary flex items-center gap-1"
                                                                >
                                                                    {showComments ? '✏️ Hide comments' : '✏️ Click to add comments'}
                                                                </button>
                                                            </div>
                                                            {showComments && (
                                                                <textarea 
                                                                    id="description" 
                                                                    className="form-textarea min-h-[130px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 mt-2" 
                                                                    name="lead_comment" 
                                                                    placeholder="Type your comments here..."
                                                                    autoFocus
                                                                ></textarea>
                                                            )}
                                                            {errors?.lead_comment && <p className="text-danger error">{errors.lead_comment[0]}</p>}
                                                        </div>
                                                        <div className="mt-4">
                                                            <button className="btn btn-success w-full rounded-sm">Save</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div> 
                                        </form>
                                    </div>
                                    <div className="panel xl:col-span-3 md:col-span-3 lg:col-span-2">
                                        <div className="mb-5">
                                            <h5 className="font-semibold text-lg dark:text-white-light">History of the Leads </h5>
                                        </div>
                                            <div className="mb-5">
                                            <div className="table-responsive text-[#515365] dark:text-white-light font-semibold overflow-y-hidden">
                                                <div className="max-w-[900px] mx-auto">
                                                {selectedLead?.comments?.map((comment: any, i: number) => {
                                                    const currentStatus = getStatusById(comment.lead_status);
                                                    const prevComment = i > 0 ? selectedLead.comments[i - 1] : null;
                                                    const prevStatus = prevComment ? getStatusById(prevComment.lead_status) : null;
                                                    const fromLabel = prevStatus ? prevStatus.label : "New Lead";
                                                    const fromColor = prevStatus ? prevStatus.color : "#5dc66e";
                                                    return (
                                                    <div className="flex" key={i}>
                                                        <p className="text-[#3b3f5c] dark:text-white-light min-w-[180px] max-w-[150px] text-sm font-semibold py-2.5">
                                                        {comment?.created_at || "Invalid Time"}
                                                        </p>

                                                        {/* Timeline dot */}
                                                        <div
                                                        className={`
                                                            relative
                                                            before:absolute before:left-1/2 before:-translate-x-1/2 before:top-[15px]
                                                            before:w-2.5 before:h-2.5 before:border-2 before:rounded-full
                                                            after:absolute after:left-1/2 after:-translate-x-1/2 after:top-[25px]
                                                            after:-bottom-[15px] after:w-0 after:h-auto after:border-l-2
                                                            after:rounded-full
                                                            ${i % 5 === 0 ? "before:border-primary after:border-primary" :
                                                            i % 5 === 1 ? "before:border-dark after:border-dark" :
                                                            i % 5 === 2 ? "before:border-success after:border-success" :
                                                            i % 5 === 3 ? "before:border-danger after:border-danger" :
                                                                        "before:border-warning after:border-warning"}
                                                        `}
                                                        />
                                                        <div className="p-2.5 self-center ltr:ml-2.5 rtl:mr-2.5 w-full">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">

                                                            <span className="text-[#3b3f5c] dark:text-white-light font-semibold text-[13px]">
                                                            {comment?.user_id
                                                                ? comment.user_name
                                                                : prevComment?.user_name || ""}
                                                            </span>

                                                            {prevStatus && (
                                                                <span className="text-gray-500 text-[13px]">moved to</span>
                                                            )}

                                                            {/* TO */}
                                                            <span
                                                            className="text-[13px] font-semibold"
                                                            style={{ color: currentStatus?.color || "#6b7280" }}
                                                            >
                                                            {currentStatus?.label || "Unknown"}
                                                            </span>

                                                            
                                                            {!prevStatus && (
                                                                <span className="text-gray-500 text-[13px]">to</span>
                                                            )}

                                                            {/* Agent name (only if assignment) */}
                                                            {comment.lead_status == 2 && comment.agent_name && (
                                                            <span className="text-blue-500 text-[13px]">
                                                                {comment.agent_name}
                                                            </span>
                                                            )}
                                                            <span className="text-gray-400 text-[13px]">from</span>

                                                            {/* FROM */}
                                                            <span
                                                            className="text-[13px] font-semibold"
                                                            style={{ color: fromColor }}
                                                            >
                                                            {fromLabel}
                                                            </span>
                                                        </div>

                                                        {/* Comment */}
                                                        {comment.lead_comment && (
                                                            <div className="bg-gray-50 dark:bg-gray-800 p-1 border-l-4 border">
                                                            <p className="text-[#3b3f5c] dark:text-white-light text-sm italic">
                                                                {comment.lead_comment}
                                                            </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    </div>
                                                    );
                                                })}
                                                </div>
                                            </div>
                                            </div>
                                    </div>
                                </div> 
                            </div>

                        </div>                                                    
                    )}
                </div>
            </div>
            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}  />
            <RemarkModal isOpen={isMemark} onClose={() => setIsMemark(false)} data={IsRemarkData} />
            <CallLogModal isOpen={isCallLog}  onClose={() => setCallLog(false)} data={IsCallLogData} />
            <FileViewerModal isOpen={isFileViewerOpen} onClose={() => setIsFileViewerOpen(false)} files={files} />    
            {showDialer && ( <Dialer identity={`${loginuser?.client_user_id || 'guest'}`} lead={selectedLead} open={showDialer} onClose={() => setShowDialer(false)} /> )}
            <AiCallModal isOpen={isAiCallModal} onClose={() => setIsAiCallModal(false)} data={aiCallData} />
            <CustomSideNav
                isOpen={isCustomizerOpen}
                leadId={selectedLead?.lead_id}
                onClose={() => setIsCustomizerOpen(false)}
                onSuccess={() => { setSelectedLead(null); Refresh(); }}
                onFilterUpdate={() => {}}
                initialFilters={{ agents: [], statuses: [] }}
            />
    </div>
    );
}
export default DashboardBox2;