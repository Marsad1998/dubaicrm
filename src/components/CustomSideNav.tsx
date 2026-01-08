import { useSelector } from 'react-redux';
import IconSettings from './Icon/IconSettings';
import IconX from './Icon/IconX';
import { IRootState } from '../store';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { statues } from '../services/status';
import apiClient from '../utils/apiClient';
import Toast from '../services/toast';

interface CustomSideNavProps {
    isOpen: boolean;
    onClose: () => void;
    onFilterUpdate: (filters: { agents: string[]; statuses: string[] }) => void;
    initialFilters: { agents: string[]; statuses: string[] };
    leadId : any | null;
    onSuccess: () => void;
}

const CustomSideNav: React.FC<CustomSideNavProps> = ({ isOpen, onClose, onFilterUpdate, initialFilters, leadId, onSuccess  }) => {
    const [selectedAgents, setSelectedAgents] = useState<string[]>(initialFilters.agents);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialFilters.statuses);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [agents, setAgents] = useState([]);
    const toast = Toast();
    useEffect(() => {
        if (isOpen) {
        fetchAgents();
        }
    }, [isOpen]);

    const fetchAgents = async () => {
        try {
        const response = await apiClient.get('/users/user_list?for_select=1');
        setAgents(response.data);
        } catch (error) {
        toast.error('Failed to fetch agents');
        }
    };

    const agentOptions = agents?.map((agent: any) => ({
        value: agent.client_user_id,
        label: agent.client_user_name
    })) || [    { value: '', label: 'No agents available' }
    ];

    const statusOptions = statues()?.map(status => ({
            value: status.value.toString(),
            label: status.label
        }));

    const handleApplyFilters = async () => {
        if (selectedAgents.length === 0 && selectedStatuses.length === 0) {
            toast.error('Please select at least one agent or status');
            return;
        }

        if (selectedAgents.length > 0 && selectedStatuses.length === 0 && leadId) {
            try { const response = await apiClient.post('/leads/direct_assignlead_agent', { lead_id: leadId, agent_id: selectedAgents });
            if (response.status === 200) {
                toast.success('Lead assigned successfully');
                onClose();
                if (onSuccess) onSuccess();
            } else {
                 toast.error('Failed to assign lead');
            }
        } catch (error) {
            toast.error('Failed to assign lead');
        }
        }else{
            onFilterUpdate({ agents: selectedAgents, statuses: selectedStatuses });
        }
    };

    const handleResetFilters = () => {
        setSelectedAgents([]);
        setSelectedStatuses([]);
        onFilterUpdate({ agents: [], statuses: [] });
        onClose();

    };

    return (
        <div className="relative">
            {isOpen && ( <div className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300" onClick={onClose} /> )}
            <nav className={`fixed top-0 bottom-0 w-full max-w-md shadow-xl transition-all duration-300 z-[51] dark:bg-gray-900 bg-white ${isOpen ? 'right-0' : '-right-full'}`} >
                <button type="button" className="absolute -left-12 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-l-full flex justify-center items-center text-white cursor-pointer transition-colors duration-200" onClick={onClose}>
                    <IconSettings className="w-5 h-5" />
                </button>
                <div className="h-full flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h4 className="text-xl font-semibold text-gray-800 dark:text-white"> Filter Leads Analysis ...</h4>
                        <button type="button" className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400" onClick={onClose}> <IconX className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> Select Agents </label>
                            <Select isMulti={false}   options={agentOptions} value={agentOptions.find(option => selectedAgents[0] === option.value)}  onChange={(selected) => setSelectedAgents(selected ? [selected.value] : [])}  className="react-select-container" classNamePrefix="react-select"
                            />
                        </div>
                        { !leadId && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> Select Statuses </label>
                                <Select isMulti options={statusOptions} value={statusOptions.filter(option => selectedStatuses.includes(option.value))}
                                    onChange={(selected) => setSelectedStatuses(selected.map(item => item.value))} className="react-select-container" classNamePrefix="react-select" />
                            </div>
                        )}
                    </div>
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                        <div className="flex justify-between w-full">
                            <div
                                className="inline-block p-[1px] rounded-md"
                                style={{
                                backgroundColor: '#6b7280', 
                                clipPath:
                                    'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)'
                                }}
                            >
                                <button
                                onClick={handleResetFilters}
                                className="
                                    px-4 py-2
                                    text-white font-medium btn-sm
                                    bg-gray-500 hover:bg-gray-600
                                    transition-colors duration-200
                                    rounded
                                "
                                style={{
                                    clipPath:
                                    'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)'
                                }}
                                >
                                Reset Changes
                                </button>
                            </div>
                            <div
                                className="inline-block p-[1px] rounded-md"
                                style={{
                                backgroundColor: '#2563eb', 
                                clipPath:
                                    'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)'
                                }}
                            >
                                <button
                                onClick={handleApplyFilters}
                                className="
                                    px-4 py-2
                                    text-white font-medium btn-sm
                                    bg-blue-600 hover:bg-blue-700
                                    transition-colors duration-200
                                    rounded
                                "
                                style={{
                                    clipPath:
                                    'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)'
                                }}
                                >
                                Apply Changes
                                </button>
                            </div>
                            </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default CustomSideNav;
