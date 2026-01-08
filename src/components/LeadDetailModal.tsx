import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import IconX from './Icon/IconX';
import { STATUSES } from '../services/status';

interface Comment {
    lead_comment_id: number;
    lead_id: string;
    agent_id: string | null;
    lead_status: number;
    lead_comment: string;
    created_at: string;
    updated_at: string;
    user_id: string | null;
    user_name?: string;
    agent_name?: string;
    agent?: {
        client_user_name: string;
    };
    user?: {
        client_user_name: string;
    };
}

interface LeadDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    comments?: Comment[];
}

const getNotesByLeadStatus = (leadStatus: number) => { 
    const option = STATUSES.find((opt) => opt.value == leadStatus);
    return option && typeof option.notes === "string" ? option.notes : "Status Changed";
};

const getNotes2ByLeadStatus = (leadStatus: number | string) => {
    const option = STATUSES.find((opt) => opt.value == leadStatus);
    return option && typeof option.notes2 === 'string' ? option.notes2 : 'Status Changed';
};

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ isOpen, onClose, comments = [] }) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" open={isOpen} onClose={onClose} className="relative z-[51]">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-6xl h-[90vh] text-black dark:text-white-dark">
                                <button type="button" onClick={onClose} className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                > <IconX className="w-6 h-6" />
                                </button>
                                <div className="text-xl font-semibold bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-6 rtl:pr-6 py-4 ltr:pr-[60px] rtl:pl-[60px]">
                                    History of the Leads
                                </div>
                                <div className="p-6 h-full flex flex-col">
                                    <div className="flex-1 overflow-y-auto">
                                        <div className="table-responsive text-[#515365] dark:text-white-light font-semibold  overflow-y-hidden">
                                            <div className="max-w-[900px] mx-auto">
                                                {comments?.map((comment: any, i: any) => (
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
                                                                    {comment?.user_id !== null  ? comment?.user_name : i > 0  ? comments[i - 1]?.user_name  : ''
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
                                                                        __html: getNotes2ByLeadStatus(comments[i - 1]?.lead_status || '')
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
                                    <div className="ltr:text-right rtl:text-left flex justify-end items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                                        <button type="button"  className="btn btn-outline-danger px-6 py-2 text-base" 
                                            onClick={onClose}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default LeadDetailModal;