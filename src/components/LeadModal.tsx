    import { useState, useEffect, useRef, Fragment } from 'react';
    import { Dialog, Transition } from '@headlessui/react';
    import IconX from './Icon/IconX';
    import { Dispatch } from 'redux';
    import { createLeads } from '../slices/dashboardSlice';
    import Toast from '../services/toast';
    import { useDispatch, useSelector } from 'react-redux';
    import { AppDispatch, IRootState } from '../store';
    import { DashboardLeadslist } from '../slices/dashboardSlice';

    interface LeadModalProps {  isOpen: boolean; onClose: () => void; }
    const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const combinedRef     = useRef<any>({ addleadform:null });
    const toast           = Toast();
    const [permissions, setPermissions] = useState<any>([]);
    const [role, setRoles] = useState<string>();
    
    useEffect(() => {
        if (isOpen) { setErrors({}); }

        const storedPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
        const userrole = localStorage.getItem('role') || '';
        setPermissions(storedPermissions);
        setRoles(userrole);
        
    }, [isOpen]);

    const saveLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (combinedRef.current.addleadform) {
            const formData = new FormData(combinedRef.current.addleadform);
            const currentstatus = formData.get('lead_status');
            try {
                const response = await dispatch(createLeads({ formData }) as any);
                if (response.payload.status === 200 || response.payload.status === 201){
                    toast.success('Lead Create Successfully');
                    onClose();
                    setErrors({}); 
                    combinedRef.current.addleadform.reset();
                    window.location.reload();
                    // dispatch(DashboardLeadslist({ page_number : response.payload.last_page , lead_status : Number(currentstatus),  }) as any);
                    // dispatch(DashboardLeadslist({ page_number : response.payload.last_page , lead_status : 0,  }) as any);
                }else{
                    setErrors(response.payload.errors);
                    return
                }
            } catch (error: any) { console.error('Error creating/updating news:', error); }
        }
    }
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" open={isOpen} onClose={onClose} className="relative z-[51]">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 py-8">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                    <button type="button" onClick={onClose} className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none">
                    <IconX />
                    </button>
                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]"> Add Lead...</div>
                    <div className="p-5">
                    <form className="leadForm" ref={(el) => (combinedRef.current.addleadform = el)} onSubmit={saveLead}>
                        <div className="mb-3">
                            <label htmlFor="lead_title">Lead Title </label>
                            <input id="lead_title" type="text" placeholder="Lead Title #XXXXXX" name="lead_title" className="form-input" />
                            {errors?.lead_title && <p className="text-danger error">{errors.lead_title[0]}</p>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="customer_name">Client Name</label>
                            <input id="customer_name" type="text" name="customer_name" placeholder="Customer Name" className="form-input" />
                            {errors?.customer_name && <p className="text-danger error">{errors.customer_name[0]}</p>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="customer_email">Client Email </label>
                            <input id="customer_email" type="text" name="customer_email" placeholder="john@gmail.com" className="form-input" />
                            {errors?.customer_email && <p className="text-danger error">{errors.customer_email[0]}</p>}
                        </div>
                        <div className="mb-3 flex justify-between gap-4">
                            <div className="flex-1">
                               <label htmlFor="customer_phone">Phone</label>
                               <input id="customer_phone" type="text" name="customer_phone" placeholder="+971623523623" className="form-input" />
                               {errors?.customer_phone && <p className="text-danger error">{errors.customer_phone[0]}</p>}
                            </div>
                            <div className="flex-1">
                                <label htmlFor="lead_status">Status</label>
                                <select id="lead_status" name="lead_status" className="form-select">
                                <option value="17">New Lead</option>
                                <option value="3">Connected Lead</option>
                                <option value="4">Cold Lead</option>
                                <option value="5">Warm Lead</option>
                                <option value="6">Hot Lead</option>
                                <option value="16">Won Lead (Close Deel)</option>
                                </select>
                                {errors?.lead_status && <p className="text-danger error">{errors.lead_status[0]}</p>}
                            </div>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="lead_comments">Comments </label>
                            <textarea name="lead_comments" id="lead_comments" className="form-input" placeholder='Please add your comments...'></textarea>
                            {errors?.lead_comments && <p className="text-danger error">{errors.lead_comments[0]}</p>}
                        </div>
                        <div className="ltr:text-right rtl:text-left flex justify-end items-center mt-8">
                          <button type="button" className="btn btn-outline-danger btn-sm rounded-sm" onClick={onClose} > Cancel </button>
                          <button type="submit" className="btn btn-success ltr:ml-2 rtl:mr-2 btn-sm rounded-sm">Save</button>
                        </div>
                    </form>
                    </div>
                </Dialog.Panel>
                </Transition.Child>
            </div>
            </div>
        </Dialog>
    </Transition>
    );
    };
    
    export default LeadModal;
