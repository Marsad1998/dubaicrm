import { useState, useEffect, useRef, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import IconX from './Icon/IconX';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import Toast from '../services/toast';
import apiClient from '../utils/apiClient';
import { getBaseUrl } from './BaseUrl';
import Select from 'react-select';

const endpoints = {
  createApi: `${getBaseUrl()}/subscriber/store`,
};

interface SubscriberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SubscriberModal: React.FC<SubscriberModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const combinedRef = useRef<any>({ subscriberform: null });
  const toast = Toast();
  const [permissions, setPermissions] = useState<any>([]);
  const [role, setRoles] = useState<string>();
  const [subscriberType, setSubscriberType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const subscriberOptions = [
    { value: '', label: '-- Select Option --' },
    { value: 'required', label: 'Required (No Import)' },
    { value: '1', label: 'Hiring Candidate' },
    { value: '2', label: 'Clients' },
    { value: '3', label: 'Retargeting Clients' },
    { value: '4', label: 'Roadshow Clients' },
  ];

  useEffect(() => {
    if (isOpen) setErrors({});
    const storedPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const userrole = localStorage.getItem('role') || '';
    setPermissions(storedPermissions);
    setRoles(userrole);
  }, [isOpen]);

  const saveSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberType) {
      toast.error('Please select an import type');
      return;
    }

    if (combinedRef.current.subscriberform) {
      const formData = new FormData(combinedRef.current.subscriberform);
      formData.append('subscriber_type', subscriberType); 

      try {
        setSending(true);
        const response = await apiClient.post(endpoints.createApi, formData);
        if (response.status === 200 || response.status === 201) {
          toast.success('Subscriber created successfully');
          onClose();
          setErrors({});
          setSubscriberType('');
          combinedRef.current.subscriberform.reset();
          onSuccess();
        }
      } catch (error: any) {
        console.log(error);
        if (error?.status === 422) {
            console.log(error.response);
          setErrors(error.response.data || {});
        } else {
          toast.error('An error occurred while saving subscriber');
        }
      } finally {
        setSending(false);
      }
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" open={isOpen} onClose={onClose} className="relative z-[51]">
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
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                >
                  <IconX />
                </button>

                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                  Add Subscriber Information...
                </div>

                <div className="p-5">
                  <form
                    className="SubscriberForm"
                    ref={(el) => (combinedRef.current.subscriberform = el)}
                    onSubmit={saveSubscriber}
                  >
                    <div className="mb-3">
                      <label htmlFor="name">Name</label>
                      <input id="name" type="text" placeholder="Full Name" name="name" className="form-input" />
                      {errors?.name && <p className="text-danger error">{errors.name[0]}</p>}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="email">Email</label>
                      <input id="email" type="text" name="email" placeholder="john@gmail.com" className="form-input" />
                      {errors?.email && <p className="text-danger error">{errors.email[0]}</p>}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="phone">Phone</label>
                      <input id="phone" type="text" name="phone" placeholder="Phone" className="form-input" />
                      {errors?.phone && <p className="text-danger error">{errors.phone[0]}</p>}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="subscriber_type">Select Import Type</label>
                     <Select
                        id="subscriber_type"
                        isDisabled={sending}
                        value={subscriberOptions.find((opt) => opt.value === subscriberType)}
                        onChange={(option) => setSubscriberType(option?.value || '')}
                        options={subscriberOptions}
                        placeholder="Select Import Type..."
                        menuPortalTarget={document.body} 
                        styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }), 
                            control: (base) => ({
                            ...base,
                            borderColor: errors?.subscriber_type ? '#dc2626' : base.borderColor, 
                            boxShadow: 'none',
                            '&:hover': { borderColor: '#0d6efd' },
                            }),
                        }}
                        />
                      {errors?.subscriber_type && (
                        <p className="text-danger error">{errors.subscriber_type[0]}</p>
                      )}

                    </div>

                    <div className="flex justify-end items-center mt-8">
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={onClose}
                        disabled={sending}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary ltr:ml-4 rtl:mr-4"
                        disabled={sending}
                      >
                        {sending ? 'Saving...' : 'Save'}
                      </button>
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

export default SubscriberModal;
