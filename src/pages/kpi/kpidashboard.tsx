import PerfectScrollbar from 'react-perfect-scrollbar';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../slices/themeConfigSlice';
import IconNotes from '../../components/Icon/IconNotes';
import IconNotesEdit from '../../components/Icon/IconNotesEdit';
import IconStar from '../../components/Icon/IconStar';
import IconSquareRotated from '../../components/Icon/IconSquareRotated';
import IconMenu from '../../components/Icon/IconMenu';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import IconCalendar from '../../components/Icon/IconCalendar';
import { useNavigate } from 'react-router-dom';
import Toast from '../../services/toast';

const endpoints = {
    listApi   : `${getBaseUrl()}/kpi/show`,
    markDoneApi: `${getBaseUrl()}/kpi/mark_done`,
};

const KPIDashboard = () => {
    const dispatch = useDispatch();
    const [kpiList, setkpiList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const useReff = useRef(false);
    const [isShowNoteMenu, setIsShowNoteMenu] = useState<any>(false);
    const [selectedTab, setSelectedTab] = useState<any>('all');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();
    const toast = Toast();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState("");
    
    useEffect(() => {
        if(!useReff.current){
            dispatch(setPageTitle('KPI Request'));
            fetchKpis(selectedTab);
        }
        useReff.current = true;
    }, []);

    useEffect(() => {
        if (useReff.current) {
            fetchKpis(selectedTab);
        }
    }, [selectedTab]);

    const fetchKpis = async (filter = 'all') => {
        setIsLoading(true);
        try {
            const response = await apiClient.get(endpoints.listApi, { params: { filter } });
            if(response.status === 200 || response.status === 201){  
                const data = response.data;
                setkpiList(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            toast.error('Failed to fetch activities');
            setkpiList([]);
        } finally {
            setIsLoading(false);
        }
    }
    const getAgentsForActivity = (activity: any) => {
        if (activity.agent) { return [activity.agent]; }
        return [];
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


    const MarkDone = async (kpis:any) => {
        const response = await apiClient.post(endpoints.markDoneApi + `/${kpis.id}`);
        if (response.status === 200 || response.status === 201) {
            fetchKpis(selectedTab);
            setErrors({});
            Swal.fire('Success!', response.data.message, 'success');
            
        }
    }
    const handleTabChange = (tab: string) => { setSelectedTab(tab); }

    const truncateText = (text: string, wordLimit = 20) => {
        const words = text.split(" ");
        return words.length > wordLimit ? words.slice(0, wordLimit).join(" ") + "..." : text;
    };

    const openModal = (description: string) => {
        setSelectedDescription(description);
        setModalOpen(true);
    };

    return (
        <div>
            <div className="flex gap-5 relative sm:h-[calc(100vh_-_150px)] h-full">
                <div className={`panel p-4 flex-none w-[240px] absolute xl:relative z-10 space-y-4 h-full xl:h-auto hidden xl:block ltr:lg:rounded-r-md ltr:rounded-r-none rtl:lg:rounded-l-md rtl:rounded-l-none overflow-hidden ${isShowNoteMenu ? '!block h-full ltr:left-0 rtl:right-0' : 'hidden shadow'}`}>
                    <div className="flex flex-col h-full pb-16">
                        <div className="flex text-center items-center">
                            <div className="shrink-0">
                                <IconNotes />
                            </div>
                            <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Kpi Task</h3>
                        </div>
                        <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b] my-4"></div>
                        <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                            <div className="space-y-1">
                                <button type="button" className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${selectedTab === 'all' && 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]'}`}
                                    onClick={() => handleTabChange('all')}>
                                    <div className="flex items-center">
                                        <IconNotesEdit className="shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">All Kpi Task</div>
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
                    ) : kpiList && kpiList.length > 0 ? (
                        <div className="sm:min-h-[300px] min-h-[400px]">
                            <div className="grid 2xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
                                {kpiList.map((activity: any) => {
                                    const shortDescription = truncateText(activity.description, 20);
                                    const activityAgents = getAgentsForActivity(activity);
                                    return (
                                        <div className={`panel pb-5 ${'dark:shadow-dark'}`} key={activity.id}>
                                            <div className="flex flex-col h-full">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div>
                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                {activityAgents.length === 1 ? (
                                                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                                        {activityAgents[0]?.client_user_name || 'Unknown Agent'}
                                                                    </span>
                                                                ) : (
                                                                    activityAgents.map((agent: any) => (
                                                                        <span key={agent.client_user_id} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                                            {agent.client_user_name}
                                                                        </span>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>                                                  
                                                </div>
                                                 <div className="flex-grow mb-6">
                                                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{activity.title}</h4>
                                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                                            {shortDescription}
                                                            {activity.description.split(" ").length > 20 && (
                                                                <button onClick={() => openModal(activity.description)} className="text-info ml-2">
                                                                    Read more
                                                                </button>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col gap-3 mt-auto pt-3 border-t">
                                                    <div className="flex items-center text-sm">
                                                        <IconCalendar className="w-4 h-4 text-primary" />
                                                        <span className='text-primary ml-2'>
                                                            {activity.start_date} - {activity.end_date}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-end items-center space-x-2">
                                                        {activity.status === 1 && (
                                                            <>
                                                            <span className="text-[12px] text-gray-500">
                                                                Mark done after Complate task.
                                                            </span>
                                                            <button onClick={() => MarkDone(activity)} className="btn btn-info btn-sm flex items-center space-x-1">
                                                                <IconStar className="w-4 h-4" />
                                                                <span>Mark Done</span>
                                                            </button>
                                                            </>
                                                        )}
                                                        </div>
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
                </div>
            </div>
            <Transition appear show={modalOpen} as={Fragment}>
                <Dialog as="div" open={modalOpen} onClose={() => setModalOpen(false)}>
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                        </Transition.Child>
                        <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                            <div className="flex items-start justify-center min-h-screen px-4">
                                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                    <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden my-8 w-full max-w-lg text-black dark:text-white-dark">
                                        <div className="p-5">
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line"> {selectedDescription} </p>
                                            <div className="flex justify-end items-center">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setModalOpen(false)}> Close </button>
                                            </div>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                </Dialog>
            </Transition>

        </div>
    );
};

export default KPIDashboard;