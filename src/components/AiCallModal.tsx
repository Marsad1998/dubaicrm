import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface AiCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: Array<{
        decision: string;
        answers?: Record<string, any>;
        created_at?: string;
    }>;
}

const AiCallModal: React.FC<AiCallModalProps> = ({ isOpen, onClose, data }) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" open={isOpen} onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto" />
                </Transition.Child>
                <div className="fixed inset-0 z-[1000] flex items-start justify-center min-h-screen px-4">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden my-8 w-full max-w-4xl text-black dark:text-white-dark">
                            <div className="p-5">
                                <h2 className="text-lg font-semibold mb-4 text-center"> AI Call Qualification Details </h2>
                                <table className="table-responsive w-full">
                                    <tbody>
                                        {data && data.length > 0 ? (
                                            data.map((item, index) => (
                                                <tr key={index} className="border-b border-gray-300">
                                                    <td className="px-4 py-2 font-semibold w-1/3">
                                                        Decision
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {item.decision || 'N/A'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td className="px-4 py-2 text-center" colSpan={2}>
                                                    No data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {data?.map((item, index) =>
                                    item.answers ? (
                                        <div key={`answers-${index}`} className="mt-4 border-gray-300">
                                            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 ml-3"> Client Answers </h3>
                                            <table className="table-auto w-full border-collapse">
                                                <tbody>
                                                    {Object.entries(item.answers).map(
                                                        ([key, value], idx) => (
                                                            <tr key={idx} className="border-b border-gray-200">
                                                                <td className="px-4 py-2 font-semibold capitalize"> {key.replace(/_/g, ' ')} </td>
                                                                <td className="px-4 py-2">
                                                                    {typeof value === 'object'
                                                                        ? value.raw ||
                                                                          value.value ||
                                                                          'N/A'
                                                                        : value || 'N/A'}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {item.created_at || ''}
                                            </p>
                                        </div>
                                    ) : null
                                )}

                                {/* Close button */}
                                <div className="flex justify-end items-center mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={onClose}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AiCallModal;
