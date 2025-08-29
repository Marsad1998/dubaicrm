import PerfectScrollbar from 'react-perfect-scrollbar';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../slices/themeConfigSlice';
import IconNotes from '../../components/Icon/IconNotes';
import IconNotesEdit from '../../components/Icon/IconNotesEdit';
import IconSquareRotated from '../../components/Icon/IconSquareRotated';
import IconPlus from '../../components/Icon/IconPlus';
import IconMenu from '../../components/Icon/IconMenu';
import IconUser from '../../components/Icon/IconUser';
import IconHorizontalDots from '../../components/Icon/IconHorizontalDots';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconX from '../../components/Icon/IconX';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import IconCalendar from '../../components/Icon/IconCalendar';
import ApprovalModal from '../../components/ApprovalModal';
import { useNavigate } from 'react-router-dom';
import Toast from '../../services/toast';

const endpoints = {
    listApi   : `${getBaseUrl()}/activities/agents_activities`,
    deleteApi : `${getBaseUrl()}/activities/delete_activities`,
    aprovalActivitesApi: `${getBaseUrl()}/activities/aproval_activities`,
};

const ActivitiesRequest = () => {
    const dispatch = useDispatch();
    const [activitiesList, setActivitiesList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const useReff = useRef(false);
    const [isDeleteNoteModal, setIsDeleteNoteModal] = useState<any>(false);
    const [isShowNoteMenu, setIsShowNoteMenu] = useState<any>(false);
    const [isViewNoteModal, setIsViewNoteModal] = useState<any>(false);
    const [selectedTab, setSelectedTab] = useState<any>('all');
    const [selectedActivies, setSelectedActivies] = useState<any>(null);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [selectedActivites, setselectedActivites] = useState<any>(null);
    const loginuser = useSelector((state: IRootState) => state.auth.user || {});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();
    const toast = Toast();
    
    useEffect(() => {
        if(!useReff.current){
            dispatch(setPageTitle('Activities Request'));
            fetchActivities(selectedTab);
        }
        useReff.current = true
    }, []);
    useEffect(() => {
        if (useReff.current) {
            fetchActivities(selectedTab);
        }
    }, [selectedTab]);

    const fetchActivities = async (filter = 'all') => {
        setIsLoading(true);
        try {
            const response = await apiClient.get(endpoints.listApi, {
                params: { filter }
            });
            if(response.status == 200 || response.status === 201){  
                const data = response.data;
                setActivitiesList(data);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            toast.error('Failed to fetch activities');
        } finally {
            setIsLoading(false);
        }
    }

    const deleteNoteConfirm = (activites: any) => {
        setSelectedActivies(activites);
        setIsDeleteNoteModal(true);
    };

    
    const deleteNote = async () => {
         setIsLoading(true);
          try {
            const response = await apiClient.delete(`${endpoints.deleteApi}/${selectedActivies.id}`);
            if(response.status == 200 || response.status === 201){  
                fetchActivities(selectedTab);
                showMessage('Activity has been deleted successfully.');
                setIsDeleteNoteModal(false);
            }
        } catch (error:any) {
            if(error.status === 404){
                Swal.fire({ 
                    icon: 'warning', 
                    title: 'Incomplete Activity Request', 
                    text: `` + error.response.data.message+``,
                });
                setIsDeleteNoteModal(false);
                return
            }
        } finally {
            setIsLoading(false);
        }

    };

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({ 
            toast: true, 
            position: 'top', 
            showConfirmButton: false, 
            timer: 3000, 
            customClass: { container: 'toast' }, 
        });
        toast.fire({ icon: type, title: msg, padding: '10px 20px', });
    };

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const Approve = (activites:any) => {
        if(activites.status == 2){
            toast.warning('This request has already been approved');
            return;
        } else if(activites.status == 3){
             toast.warning('This request has already been rejected');
              return;
        }
        setselectedActivites(activites);
        setIsApprovalModalOpen(true);
    }

    const handleApprovalSubmit = async (formValues: { 
            action: string; 
            approved_start_date?: string; 
            approved_end_date?: string; 
            response: string 
        }) => {
            try {
                const formData = new FormData();
                formData.append('id', selectedActivites.id);
                formData.append('approved_by', loginuser.client_user_id);
                formData.append('action', formValues.action);
                if (formValues.action === 'approve') {
                    if (formValues.approved_start_date) {
                        formData.append('approved_start_date', formValues.approved_start_date);
                    }
                    if (formValues.approved_end_date) {
                        formData.append('approved_end_date', formValues.approved_end_date);
                    }
                }
                formData.append('response', formValues.response);
                
                const response = await apiClient.post(endpoints.aprovalActivitesApi, formData);
                if (response.status === 200 || response.status === 201) {
                    fetchActivities(selectedTab);
                    setErrors({});
                    Swal.fire('Success!', response.data.message, 'success');
                    setIsApprovalModalOpen(false); 
                }
            } catch (error: any) {
                if (error.response?.status === 422) {
                    Swal.fire('Error', error.response.data.message || 'Validation failed.', 'error');
                } else {
                    Swal.fire('Error', 'Something went wrong.', 'error');
                }
                setIsApprovalModalOpen(false);
            }
    };

    const handleAddActivites = () => {
         navigate('/pages/activities/activities');
    }

    const handleTabChange = (tab: string) => {
        setSelectedTab(tab);
        // No need to call fetchActivities here because useEffect will handle it
    }

    return (
        <div>
            <div className="flex gap-5 relative sm:h-[calc(100vh_-_150px)] h-full">
                <div className={`bg-black/60 z-10 w-full h-full rounded-md absolute hidden ${isShowNoteMenu ? '!block xl:!hidden' : ''}`} onClick={() => setIsShowNoteMenu(!isShowNoteMenu)}></div>
                <div className={`panel p-4 flex-none w-[240px] absolute xl:relative z-10 space-y-4 h-full xl:h-auto hidden xl:block ltr:lg:rounded-r-md ltr:rounded-r-none rtl:lg:rounded-l-md rtl:rounded-l-none overflow-hidden ${isShowNoteMenu ? '!block h-full ltr:left-0 rtl:right-0' : 'hidden shadow'}`}>
                    <div className="flex flex-col h-full pb-16">
                        <div className="flex text-center items-center">
                            <div className="shrink-0">
                                <IconNotes />
                            </div>
                            <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Request</h3>
                        </div>
                        <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b] my-4"></div>
                        <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                            <div className="space-y-1">
                                <button type="button" className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${selectedTab === 'all' && 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]'}`}
                                    onClick={() => handleTabChange('all')}>
                                    <div className="flex items-center">
                                        <IconNotesEdit className="shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">All Requests</div>
                                    </div>
                                </button>
                                 <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                                <div className="px-1 py-3 text-white-dark">Filters</div>
                                <button type="button" className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-info ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${selectedTab === 'nextweek' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'}`}
                                    onClick={() => handleTabChange('nextweek')}>
                                    <IconSquareRotated className="fill-info shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Next Week</div>
                                </button>

                                <button type="button" className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-danger ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${selectedTab === 'nextmonth' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'}`}
                                    onClick={() => handleTabChange('nextmonth')}
                                >
                                    <IconSquareRotated className="fill-danger shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Next Month</div>
                                </button>
                                  <div className='pt-3 border-t'></div>
                                <button 
                                    type="button" 
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-primary ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${selectedTab === 'today' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'}`} 
                                    onClick={() => handleTabChange('today')}
                                >
                                    <IconSquareRotated className="fill-primary shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Today Request</div>
                                </button>
                                <button 
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-warning ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${selectedTab === 'yesterday' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'}`}
                                    onClick={() => handleTabChange('yesterday')}
                                >
                                    <IconSquareRotated className="fill-warning shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Yesterday Request</div>
                                </button>
                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-info ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${selectedTab === 'week' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'}`}
                                    onClick={() => handleTabChange('week')}
                                >
                                    <IconSquareRotated className="fill-info shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Last 1 Week Requests</div>
                                </button>

                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-danger ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${selectedTab === 'month' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'}`}
                                    onClick={() => handleTabChange('month')}
                                >
                                    <IconSquareRotated className="fill-danger shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Last Month Requests</div>
                                </button> 

                                <button 
                                    type="button" 
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-primary ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${selectedTab === '3months' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'}`}
                                    onClick={() => handleTabChange('3months')}
                                >
                                    <IconSquareRotated className="fill-primary shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Last 3 Month Requests</div>
                                </button>
                                <button type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-danger ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${selectedTab === '6months' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'}`}
                                    onClick={() => handleTabChange('6months')}
                                >
                                    <IconSquareRotated className="fill-danger shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Last 6 Month Requests</div>
                                </button>
                            </div>
                        </PerfectScrollbar>
                    </div>
                    <div className="ltr:left-0 rtl:right-0 absolute bottom-0 p-4 w-full">
                        <button className="btn btn-primary w-full" type="button" onClick={handleAddActivites}>
                            <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2 shrink-0" /> Add New Request
                        </button>
                    </div>
                </div>
                <div className="panel flex-1 overflow-auto h-full">
                    <div className="pb-5">
                        <button type="button" className="xl:hidden hover:text-primary" onClick={() => setIsShowNoteMenu(!isShowNoteMenu)}>
                            <IconMenu />
                        </button>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center sm:min-h-[300px] min-h-[400px]">
                             <span className="animate-[spin_2s_linear_infinite] border-4 border-[#f1f2f3] border-l-primary border-r-primary rounded-full w-10 h-10 inline-block align-middle m-auto mb-10"></span>
                        </div>
                    ) : activitiesList.length ? (
                        <div className="sm:min-h-[300px] min-h-[400px]">
                            <div className="grid 2xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
                                {activitiesList.map((activities: any) => {
                                    return (
                                        <div className={`panel pb-5 ${activities.tag === 'personal' ? 'bg-primary-light shadow-primary' : activities.tag === 'work'
                                                    ? 'bg-warning-light shadow-warning'
                                                    : activities.tag === 'social'
                                                    ? 'bg-info-light shadow-info'
                                                    : activities.tag === 'important'
                                                    ? 'bg-danger-light shadow-danger'
                                                    : 'dark:shadow-dark'
                                            }`} key={activities.id}>
                                            <div className="flex flex-col h-full">
                                                <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center space-x-3">
                                                  {activities.thumb ? (
                                                    <div className="p-1 bg-white rounded-full shadow-sm">
                                                        <img className="h-10 w-10 rounded-full object-cover border-2 border-white" alt="User thumbnail" src={`/assets/images/${activities.thumb}`} />
                                                    </div>
                                                    ) : activities.user ? (
                                                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold shadow-sm">
                                                        {activities.user.charAt(0) + activities.user.split(' ')[1]?.charAt(0) || ''}
                                                    </div>
                                                    ) : (
                                                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                                                        <IconUser className="w-5 h-5" />
                                                    </div>
                                                    )}
                                                    <div>
                                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{activities.title}</h3>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {activities.agents.length === 1 ? (
                                                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                            {activities.agents[0].client_user_name}
                                                        </span>
                                                        ) : (
                                                        activities.agents.map((agent: any) => (
                                                        <span key={agent.client_user_id} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                                            > {agent.client_user_name} </span> ))
                                                        )}
                                                    </div>
                                                    </div>
                                                </div>
                                                 {loginuser?.roles[0].name === 'super admin' && (
                                                    <div className="dropdown">
                                                        <button onClick={() => Approve(activities)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600">
                                                            <IconHorizontalDots className="w-5 h-5 opacity-70 hover:opacity-100" />
                                                        </button>
                                                    </div>
                                                 )} 
                                                </div>
                                                <div className="flex-grow mb-6">
                                                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{activities.title}</h4>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                                    {activities.description}
                                                </p>
                                                </div>
                                               <div className="flex items-center justify-end mt-auto mb-2">
                                                    <span
                                                        className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                                                        activities.status === 1
                                                            ? 'bg-secondary text-white'
                                                            : activities.status === 2
                                                            ? 'bg-success text-white'
                                                            : activities.status === 3
                                                            ? 'bg-danger text-white'
                                                            : ''
                                                        }`}
                                                    >
                                                        {activities.status === 1
                                                        ? 'Pending to Approve'
                                                        : activities.status === 2
                                                        ? 'Approved'
                                                        : activities.status === 3
                                                        ? 'Rejected'
                                                        : ''}
                                                    </span>
                                                    </div>
                                                <div className="flex items-center justify-between mt-auto pt-3 border-t">
                                                <div className="flex items-center text-sm">
                                                    <IconCalendar className="w-4 h-4 mr-1 text-primary" />
                                                    <span className='text-primary ml-2'>{activities.start_date}</span>
                                                </div>
                                                <button type="button" onClick={() => deleteNoteConfirm(activities)} className="p-1 text-red-500 hover:text-red dark:hover:text-red-400 transition-colors">
                                                    <IconTrashLines className="w-5 h-5" />
                                                </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col justify-center items-center sm:min-h-[300px] min-h-[400px] font-semibold text-lg h-full">
                            <IconNotesEdit className="w-16 h-16 text-gray-400 mb-4" />
                            <div>No Request found</div>
                            <div className="text-sm text-gray-500 mt-2">Try changing your filters</div>
                        </div>
                    )}

                    <Transition appear show={isDeleteNoteModal} as={Fragment}>
                        <Dialog as="div" open={isDeleteNoteModal} onClose={() => setIsDeleteNoteModal(false)} className="relative z-[51]">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="fixed inset-0 bg-[black]/60" />
                            </Transition.Child>

                            <div className="fixed inset-0 overflow-y-auto">
                                <div className="flex min-h-full items-center justify-center px-4 py-8">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-out duration-300"
                                        enterFrom="opacity-0 scale-95"
                                        enterTo="opacity-100 scale-100"
                                        leave="ease-in duration-200"
                                        leaveFrom="opacity-100 scale-100"
                                        leaveTo="opacity-0 scale-95"
                                    >
                                        <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                            <button type="button" onClick={() => setIsDeleteNoteModal(false)}
                                                className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                            >
                                                <IconX />
                                            </button>
                                            <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Delete Activity</div>
                                            <div className="p-5 text-center">
                                                <div className="text-white bg-danger ring-4 ring-danger/30 p-4 rounded-full w-fit mx-auto">
                                                    <IconTrashLines className="w-7 h-7 mx-auto" />
                                                </div>
                                                <div className="sm:w-3/4 mx-auto mt-5">Are you sure you want to delete this activity?</div>
                                                <div className="flex justify-center items-center mt-8">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setIsDeleteNoteModal(false)}>
                                                        Cancel
                                                    </button>
                                                    <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={deleteNote}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </Dialog.Panel>
                                    </Transition.Child>
                                </div>
                            </div>
                        </Dialog>
                    </Transition>
                </div>
            </div>
            {selectedActivites && (
                <ApprovalModal 
                    request={selectedActivites}
                    isOpen={isApprovalModalOpen}
                    onClose={() => setIsApprovalModalOpen(false)}
                    onSubmit={handleApprovalSubmit}
                    modalType="activities"
                    title="Process Activity Request"
                    descriptionField="description"
                    requireDateRange={true}
                />
            )}
        </div>
    );
};

export default ActivitiesRequest;