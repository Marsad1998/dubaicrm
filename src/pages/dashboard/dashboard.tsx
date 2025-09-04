import { useEffect } from 'react';
import { useDashboardStates } from '../../hooks/useDashboardStates';
import { DashboardLeadslist, setLoading, updateSingleLead, createLeads, uploadFiles, getFiles } from '../../slices/dashboardSlice';
import { setPageTitle } from '../../slices/themeConfigSlice';
import PerfectScrollbar from 'react-perfect-scrollbar';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconMenu from '../../components/Icon/IconMenu';
import IconRefresh from '../../components/Icon/IconRefresh';
import Tippy from '@tippyjs/react';
import IconVideo from '../../components/Icon/IconVideo';
import { Link } from 'react-router-dom';
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
import FileViewerModal from '../../components/FileViewerModal';
import CustomSideNav from '../../components/CustomSideNav';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import IconThumbUp from '../../components/Icon/IconThumbUp';
import { IconOption } from '../../components/Icon';

  const DashboardBox = () => {
    const {
        dispatch, navigate, dashboardType, TopbarStatuses, HrTopBarStatus, uniqueDropdownList, hrSidebarStatus,
        Statues, loader2, SidebarStatuses, colorsarray, hrdropdownOption, toast,
        loginuser, leads, currentStatus, loading, meta, counters, isRtl, combinedRef, fileInputRef,
        AllLeadList, setAllLeadList, selectedLead, setSelectedLead, selectedTab, setSelectedTab,
        isShowMailMenu, setIsShowMailMenu, isEdit, setIsEdit, searchText, setSearchText, isModalOpen, setIsModalOpen,
        errors, setErrors, date, setDate, IsDisable, setIsDisable, IsColor, setsColor, IsRemarkData, SetIsRemarkData,
        isMemark, setIsMemark, isOpen, setIsOpen, files, setFiles, isFileViewerOpen, setIsFileViewerOpen,
        isCustomizerOpen, setIsCustomizerOpen
    } = useDashboardStates();

    //   useEffect(() => {
    //     const queryParams = new URLSearchParams(location.search);
    //     const error = queryParams.get('error');
    //     const googletoken = queryParams.get('token');
    //     if(googletoken){
    //         const googleuserData = queryParams.get('user');
    //         if (googleuserData) {
    //         try {
    //             const decodedString = atob(googleuserData);
    //             const userObj = JSON.parse(decodedString);
    //             localStorage.setItem('authToken', googletoken);
    //             localStorage.setItem('authUser', JSON.stringify(userObj));
    //             localStorage.setItem('permissions', JSON.stringify(userObj.permissions));
    //             localStorage.setItem('role', userObj.roles);
    //             dispatch({
    //                 type: 'auth/loginSuccess',
    //                 payload: {
    //                     token: googletoken,
    //                     user: userObj, 
    //                     permissions :  JSON.stringify(userObj.permissions),
    //                     roles : userObj.roles
    //                 }
    //             });
    //             //  navigate('/', { replace: true });
    //             return;
    //         } catch (e) {
    //             console.error('Failed to decode user data:', e);
    //         }
    //      }
    //     }
    // }, []);


    useEffect(() => {        
        dispatch(setPageTitle('Dashboard'));
        if (loginuser?.client_user_id && !combinedRef.current.fetched) {
            dispatch(DashboardLeadslist({search: searchText, type: dashboardType || 'all'}));
            combinedRef.current.fetched = true;
        }
    }, [loginuser?.client_user_id, dispatch]);
    
    useEffect(() => {
        if (loginuser?.client_user_id) {
            const delayDebounceFn = setTimeout(() => {
                dispatch(DashboardLeadslist({search: searchText, type: dashboardType || 'all'}));
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchText, loginuser?.client_user_id]);

    useEffect(() => {
        if(currentStatus > 0){         
            getLeads(currentStatus);
        }else{
            setAllLeadList(leads || []);
        }
    }, [leads]);

    const getNotesByLeadStatus = (leadStatus:number) => { 
        const option = Statues.find((opt) => opt.value == leadStatus);
        return option && typeof option.notes === "string" ? option.notes : "Unknown Status1";
    };
    
    const getNotes2ByLeadStatus = (leadStatus:number) => {
        const option = Statues.find((opt) => opt.value == leadStatus);
        return option && typeof option.notes2 === 'string' ? option.notes2 : 'Unknown Statu2s';
    }

    const LeadsTabs = async (status: number) => {
        combinedRef.current.ishideshow = true;
        const response = await dispatch(DashboardLeadslist({ page_number : meta.current_page , lead_status : status, type: dashboardType || 'all', search: searchText  }) as any);
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
            await dispatch(DashboardLeadslist({ page_number : page_number, lead_status : currentStatus, type: dashboardType || 'all', search: searchText  }) as any);
            setSelectedTab(currentStatus);
        }
    };
    const openLeadModal = () => {
        setIsModalOpen(true);
    } 
    const handleSelectChange = (e:any) => {
        if((e.value == 7 || e.value === 7) || (e.value == 19 || e.value === 19)){
            setIsDisable(false);
            setsColor('');
        }else{
            setIsDisable(true);
            setsColor('hsl(0, 0%, 95%)');
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
            const response = await dispatch(DashboardLeadslist({ page_number: meta.current_page,  lead_status: selectedTab,  type: 'csv' }) as any);
            if (response.payload?.leadsdata?.data) {
                const link = document.createElement('a');
                link.href = response.payload.leadsdata.data;
                link.target = '_blank';
                link.click();
                Refresh();
                // dispatch(DashboardLeadslist({search: searchText, type: dashboardType || 'all'}));
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
                <div className={`overlay bg-black/60 z-[5] w-full h-full rounded-md absolute hidden ${isShowMailMenu ? '!block xl:!hidden' : ''}`} onClick={() => setIsShowMailMenu(!isShowMailMenu)}
                ></div>
                <div className={`panel xl:block p-4 dark:gray-50 w-[250px] max-w-full flex-none space-y-3 xl:relative absolute z-10 xl:h-auto h-full hidden ltr:xl:rounded-r-md ltr:rounded-r-none rtl:xl:rounded-l-md rtl:rounded-l-none overflow-hidden ${isShowMailMenu ? '!block' : '' }`}>
                    <div className="flex flex-col h-full">
                            <div className="pb-5"> 
                                <button className="btn btn-success w-full btn-sm" type="button" onClick={openLeadModal}> Add Lead </button> 
                                <br/>
                                <Link to="/">
                                    <button className="btn btn-info w-full btn-sm" type="button"> Leads Analytics </button> 
                                </Link>
                            </div> 
                            <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                            <div className="space-y-1">
                                {(loginuser?.roles[0].name === 'HR' || dashboardType == 'hr' ? hrSidebarStatus : SidebarStatuses).map((sidebarstatus:any) => { 
                                    const counterKey = sidebarstatus.id || '';
                                    const sidebarcount = counters[counterKey] || 0;
                                    return (
                                        <button key={sidebarstatus?.id} onClick={() => LeadsTabs(sidebarstatus?.id)} 
                                            type="button" className={`w-full flex justify-between items-center p-2 font-medium h-10 rounded-md text-secondary ${
                                                selectedTab == sidebarstatus.id ? 'bg-[#eaf1ff] text-secondary' 
                                                    : `hover:bg-white-dark/10 dark:hover:bg-[#181F32] ${sidebarstatus.outlineColor}`
                                            }`}
                                        >  
                                            <div className="flex items-center">
                                                <span className="w-5 h-5 ltr:mr-2 rtl:ml-2">  
                                                    {IconOption.find((icon) => icon.value == sidebarstatus.icon)?.label}
                                                </span>

                                                <div className="ltr:ml-3 rtl:mr-3">{sidebarstatus?.name}</div>
                                            </div>
                                            <div className={`text-secondary ${ selectedTab == sidebarstatus.id ? 'bg-white/20 text-secondary':'bg-primary-light dark:bg-[#060818]'
                                                } rounded-md py-0.5 px-2 font-semibold whitespace-nowrap`}
                                            >
                                                {sidebarcount}
                                            </div>
                                        </button>
                                    );
                                })}
                                <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>
                                <button type="button" className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10`}>
                                    <div className="flex items-center">
                                        <IconVideo className="shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">
                                            <Link to="https://meet.google.com/landing" target="_blank"> New meeting </Link>
                                        </div>    
                                    </div>
                                </button>
                            </div>
                         </PerfectScrollbar>
                    </div>
                </div>
                <div className="panel p-0 flex-1 overflow-x-hidden h-full">
                    {!selectedLead && !isEdit && (
                        <div className="flex flex-col h-full">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-3 sm:p-4">
                                <div className="flex items-center w-full sm:w-auto">
                                    <div className="mr-2 sm:mr-4">
                                        <Tippy content="Refresh">
                                            <button type="button" onClick={Refresh} className="hover:text-primary flex items-center p-1">
                                                <IconRefresh className="w-5 h-5"/>
                                            </button>
                                        </Tippy>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                    <div className="flex items-center w-full sm:w-auto">
                                        <button type="button" className="xl:hidden hover:text-primary mr-3 p-1" onClick={() => setIsShowMailMenu(!isShowMailMenu)}>
                                            <IconMenu className="w-5 h-5"/>
                                        </button> 
                                        <div className="gap-1">
                                            {combinedRef.current.ishideshow && (
                                               <button className='btn btn-success btn-sm' onClick={() => exportCSV()}>Export Csv</button>
                                            )}
                                        </div>
                                         &nbsp; &nbsp;
                                        <div className="relative flex-1 sm:flex-none">
                                            <input type="text" className="form-input w-full sm:w-[200px] pr-8" placeholder="Search Lead" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
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
                            <div className="flex flex-wrap flex-col md:flex-row xl:w-auto justify-between items-center px-2 sm:px-4 pb-4">
                            <div className="w-full grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-7 gap-1.5 sm:gap-2 mt-4">
                                {(loginuser?.roles[0].name === 'HR' || dashboardType == 'hr' ? HrTopBarStatus : TopbarStatuses).map((status: any) => { 
                                const counterKey = status.id || '';
                                const topcounter = counters[counterKey] || 0;
                                return (
                                <button key={status.id} onClick={() => LeadsTabs(status.id)} type="button" 
                                    className={`btn shadow-none flex items-start justify-start text-sm sm:text-xs lg:text-sm md:text-sm xl:text-sm px-1 sm:px-2 lg:px-3 relative duration-300 whitespace-nowrap overflow-hidden ${selectedTab === status.id ? 'text-white' : 'border'}`}
                                    style={{
                                        borderColor: selectedTab === status.id ? status.color : status.color,
                                        backgroundColor: selectedTab === status.id ? status.color : 'transparent',
                                        color: selectedTab === status.id ? '#fff' : status.color
                                    }}
                                    > 
                                    <span className="flex items-center space-x-0"> 
                                        <span className="w-5 h-5 ltr:mr-2 rtl:ml-2">  
                                            {IconOption.find((icon) => icon.value == status.icon)?.label}
                                        </span>
                                        <span className="sm:inline text-sm" style={{ fontSize: '13px' }}>{status.name}</span>
                                    </span>
                                    <span 
                                        className="badge absolute -top-2 -right-1 text-x p-0.5 px-1.5 rounded-full text-white"
                                        style={{ backgroundColor: status.color }}
                                    > 
                                        {topcounter} 
                                    </span>
                                    </button>
                                )
                                })}
                            </div>
                            </div>
                            <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>
                                {loading ? (
                                    <Loader3 />
                                ) : Array.isArray(AllLeadList) && AllLeadList.length ? (
                                    <div className="table-responsive grow overflow-y-auto sm:min-h-[300px] min-h-[400px]">
                                        <table className="table-hover">
                                            <tbody>
                                              { AllLeadList.map((lead: any) => {
                                                    return (
                                                        <tr key={lead.lead_id} className="cursor-pointer" onClick={() => setSelectedLead(lead)}>
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
                                <div>
                                    { selectedLead.lead_source == "Facebook"  ||  selectedLead.lead_source == "Instagram" && (
                                    <Tippy content="Print">
                                        <button type="button" onClick={() => RemarkHistory(selectedLead?.field_data)} className='btn btn-success btn-sm'> Remarks </button>
                                    </Tippy>
                                    )}
                                </div>
                            </div>
                            <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>
                            <div className="p-4 relative">
                                {loading && loader2}
                                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-5">
                                    <div className="panel xl:col-span-2 md:col-span-2">
                                        <div className="flex items-center mb-5">
                                            {loginuser?.roles[0].name === 'HR' ? (
                                                <>
                                                    <h5 className="font-semibold text-lg dark:text-white-light">Job Seeker Detail</h5>
                                                    &nbsp; &nbsp;
                                                    <button type="button" className="btn btn-success" onClick={triggerFileInput}>
                                                        <IconFile className="w-4 h-4" />
                                                        <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.png,.jpeg,.webp,.txt"
                                                        />
                                                    </button>
                                                    &nbsp; &nbsp;
                                                    <button type="button" className="btn btn-secondary" onClick={() => selectedLead && viewFiles(selectedLead?.lead_id)}
                                                    > <IconEye className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <h5 className="font-semibold text-lg dark:text-white-light">Client Detail</h5>
                                                    &nbsp; &nbsp;
                                                    {loginuser?.roles[0].name === 'super admin' && (
                                                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => selectedLead && AssignToAgent(selectedLead?.lead_id)}> Transfer Lead </button>
                                                    )}
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
                                                    <IconPhone />
                                                    <span className="whitespace-nowrap text-secondary" dir="ltr">
                                                    {selectedLead?.customer_phone || 'Not-Found'}
                                                    </span>
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
                                                        <div className="mt-3 items-center">
                                                        <Select placeholder="Move Lead...." options={ 
                                                        loginuser?.roles[0].name === 'HR' ? Object.values(hrdropdownOption) : uniqueDropdownList }  name="lead_status" className="cursor-pointer" onChange={handleSelectChange} />
                                                        <input type="hidden" name="lead_id" className="form-input" defaultValue={selectedLead?.lead_id} />
                                                        <input type="hidden" name="agent_id" className="form-input" defaultValue={selectedLead?.agent_id} />
                                                        <input type="hidden" name="login_user_id" className="form-input" defaultValue={loginuser?.client_user_id}/>
                                                        {errors?.lead_status && <p className="text-danger error">{errors.lead_status[0]}</p>}
                                                        </div>
                                                        {loginuser?.roles[0].name !== 'HR' && (
                                                            <div className={`mt-4`}>
                                                                <Flatpickr value={date} disabled={IsDisable} name="meeting_date" options={{ enableTime:true, dateFormat: 'Y-m-d H:i'}} className="form-input" placeholder='Confrimed Meeting Date'  style={{ background: IsColor }}/> 
                                                                {errors?.meeting_date && <p className="text-danger error">{errors.meeting_date[0]}</p>}
                                                            </div>
                                                        )}
                                                        <div className="mt-3 items-center cursor-pointer">
                                                        <textarea id="description" className="form-textarea min-h-[130px]" name="lead_comment" placeholder="Comments"></textarea>
                                                        {errors?.lead_comment && <p className="text-danger error">{errors.lead_comment[0]}</p>}
                                                        </div>   
                                                        <div className="mt-4">
                                                            <button className="btn btn-success w-full">Save</button>
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
                                            <div className="table-responsive text-[#515365] dark:text-white-light font-semibold  overflow-y-hidden">
                                                <div className="max-w-[900px] mx-auto">
                                                    {selectedLead?.comments?.map((comment: any, i: any) => (
                                                        <div className="flex" key={i}>
                                                            <p className="text-[#3b3f5c] dark:text-white-light min-w-[180px] max-w-[150px] text-sm font-semibold py-2.5">
                                                                {comment?.created_at || 'Invalid Time'}
                                                            </p>
                                                            <div className={`
                                                                relative
                                                                before:absolute before:left-1/2 before:-translate-x-1/2 before:top-[15px] 
                                                                before:w-2.5 before:h-2.5 before:border-2 before:rounded-full
                                                                after:absolute after:left-1/2 after:-translate-x-1/2 after:top-[25px] 
                                                                after:-bottom-[15px] after:w-0 after:h-auto after:border-l-2 
                                                                after:rounded-full
                                                                ${i % 5 === 0 ? 'before:border-primary after:border-primary' : 
                                                                i % 5 === 1 ? 'before:border-dark after:border-dark' :
                                                                i % 5 === 2 ? 'before:border-success after:border-success' :
                                                                i % 5 === 3 ? 'before:border-danger after:border-danger' :
                                                                                'before:border-warning after:border-warning'}
                                                            `}></div>
                                                            <div className="p-2.5 self-center ltr:ml-2.5 rtl:mr-2.5 w-full">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-[#3b3f5c] dark:text-white-light font-semibold text-[13px]">
                                                                        {comment?.user_id !== null  ? comment?.user_name : i > 0  ? selectedLead.comments[i - 1]?.user_name  : ''
                                                                        }
                                                                    </span>
                                                                    
                                                                    <span 
                                                                        className="text-gray-500 dark:text-gray-400 text-[13px]"
                                                                        dangerouslySetInnerHTML={{ 
                                                                            __html: getNotesByLeadStatus(comment.lead_status || '') 
                                                                        }}
                                                                    />
                                                                    {comment.lead_status == 2 && (
                                                                        <span className="text-blue-500 dark:text-blue-400 text-[13px]">
                                                                            {comment?.agent_name}
                                                                        </span>
                                                                    )}
                                                                {i > 0 && (
                                                                    <div 
                                                                        className="text-gray-500 dark:text-gray-400 text-[13px]"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: getNotes2ByLeadStatus(selectedLead.comments[i - 1]?.lead_status || '')
                                                                        }}
                                                                    />
                                                                )}
                                                                </div>
                                                                {comment.lead_comment && (
                                                                    <div className="bg-gray-50 dark:bg-gray-800 p-1 border-l-4 border">
                                                                        <p className="text-[#3b3f5c] dark:text-white-light text-sm italic">
                                                                            {comment?.lead_comment}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
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
            <FileViewerModal isOpen={isFileViewerOpen} onClose={() => setIsFileViewerOpen(false)} files={files} />    
            <CustomSideNav
                isOpen={isCustomizerOpen}
                leadId={selectedLead?.lead_id}
                onClose={() => setIsCustomizerOpen(false)}
                onSuccess={() => {
                    setSelectedLead(null);
                    Refresh();
                }}
                onFilterUpdate={() => {}}
                initialFilters={{ agents: [], statuses: [] }}
            />
    </div>
    );
}

export default DashboardBox;
