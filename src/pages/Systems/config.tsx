import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { setPageTitle, toggleMenu } from '../../slices/themeConfigSlice';
import { useDispatch, useSelector } from 'react-redux';
import IconSettings from '../../components/Icon/IconSettings';
import IconMail from '../../components/Icon/IconMail';
import IconBrandWhatsapp from '../../components/Icon/IconMessage';
import IconBrandGoogle from '../../components/Icon/IconGoogle';
import IconServer from '../../components/Icon/IconServer';
// import IconCamp from '../../components/Icon/IconPencilPaper;
import apiClient from '../../utils/apiClient';
import { getBaseUrl } from '../../components/BaseUrl';
import Toast from '../../services/toast';
import Select from 'react-select';

const endpoints = {
    getConfig: `${getBaseUrl()}/config`,
    updateConfig: `${getBaseUrl()}/config/update`,
    getAgents: `${getBaseUrl()}/listing/get_users`,
    saveCampaign: `${getBaseUrl()}/campaigns/save`, 
};

const ConfigSettings = () => {
    const dispatch = useDispatch();
    const toast = Toast();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const requestMade = useRef(false);
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [agents, setAgents] = useState<any[]>([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [campaigns, setCampaigns] = useState('');

    useEffect(() => {
        if (!requestMade.current) {
            dispatch(setPageTitle("Configuration Settings"));
            fetchConfigData();
            requestMade.current = true;
            const fetchAgents = async () => {
                setLoading(true);
                try {
                    const res = await apiClient.get(endpoints.getAgents);
                    if (res.data) {
                        const formattedAgents = res.data.map((agent: any) => ({
                            value: agent.client_user_id,
                            label: agent.client_user_name,
                        }));
                        setAgents(formattedAgents);
                    }
                } catch (error) {
                    toast.error('Failed to load agents');
                } finally {
                    setLoading(false);
                }
            };
            fetchAgents();
        }

    }, [dispatch]);

    const [tabs, setTabs] = useState<string>('meta');
    const [formData, setFormData] = useState({
        // Meta User Token
        meta_user_token: '',
        meta_page_token: '',
        // WhatsApp Configuration
        whatsapp_business_id: '',
        whatsapp_phone_number_id: '',
        whatsapp_access_token: '',
        
        // Google Configuration
        google_client_id: '',
        google_client_secret: '',
        google_redirect_url: '',
        
        // SMTP Configuration
        smtp_host: '',
        smtp_port: '',
        smtp_username: '',
        smtp_password: '',
        smtp_encryption: 'tls',
        smtp_from_address: '',
        smtp_from_name: '',

        // Theme Layout
        theme_layout: 1, 

        // Campaign and Agents
        campaign_names: [] as string[],
        agent_ids: [] as number[],

    });
    
    const fetchConfigData = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(endpoints.getConfig);
            if (response.data && response.data.config) {
                const configData = response.data.config;
                setFormData(prev => ({ 
                    ...prev, 
                    ...configData,
                    // Ensure arrays are properly initialized
                    campaign_names: configData.campaign_names || [],
                    agent_ids: configData.agent_ids || [],
                }));
                
                // Set campaigns and agents for display if they exist
                if (configData.campaign_names) {
                    console.log(configData.campaign_names)
                    setCampaigns(configData.campaign_names.join(', '));
                }
            }
        } catch (error: any) {
            if (error.response?.status === 403) {
                window.location.href = '/error';
            } else {
                toast.error("Failed to fetch configuration");
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleTabs = (name: string) => {
        setTabs(name);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveLoading(true);
        try {
            const response = await apiClient.post(endpoints.updateConfig, formData);
            if (response.status === 200 || response.status === 201) {

                if (formData.theme_layout !== undefined) {
                    const menuType = formData.theme_layout === 0 ? 'vertical' : 'horizontal';
                    dispatch(toggleMenu(menuType));
                }
                setErrors({});
                toast.success('Configuration updated successfully');
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response?.status === 403) {
                window.location.href = '/error';
            } else {
                toast.error("Failed to update configuration");
            }
        } finally {
            setSaveLoading(false);
        }
    };

    // Get selected agents for the multi-select
    const getSelectedAgents = () => {
        return agents.filter(agent => 
            formData.agent_ids.includes(agent.value)
        );
    };

    const handleCampaignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCampaigns(value);
        
        // Convert comma-separated string to array and update formData
        const campaignArray = value.split(',').map(item => item.trim()).filter(item => item !== '');
        setFormData(prev => ({ ...prev, campaign_names: campaignArray }));
        
        if (errors.campaign_names) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.campaign_names;
                return newErrors;
            });
        }
    };

    const handleAgentChange = (selectedOptions: any) => {
        // Extract just the values from selected options
        const agentIds = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
        setFormData(prev => ({ ...prev, agent_ids: agentIds }));
        
        if (errors.agent_ids) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.agent_ids;
                return newErrors;
            });
        }
    };

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link to="/dashboard" className="text-primary hover:underline">Dashboard</Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Configuration Settings</span>
                </li>
            </ul>
            <div className="pt-5">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        <div>
                            <ul className="sm:flex font-semibold border-b border-[#ebedf2] dark:border-[#191e3a] mb-5 whitespace-nowrap overflow-y-auto">
                                <li className="inline-block">
                                    <button
                                        onClick={() => toggleTabs('meta')}
                                        className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'meta' ? '!border-primary text-primary' : ''}`}
                                    >
                                        <IconSettings />
                                        Meta Configuration
                                    </button>
                                </li>
                                <li className="inline-block">
                                    <button
                                        onClick={() => toggleTabs('whatsapp')}
                                        className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'whatsapp' ? '!border-primary text-primary' : ''}`}
                                    >
                                        <IconBrandWhatsapp />
                                        WhatsApp
                                    </button>
                                </li>
                                <li className="inline-block">
                                    <button
                                        onClick={() => toggleTabs('google')}
                                        className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'google' ? '!border-primary text-primary' : ''}`}
                                    >
                                        <IconBrandGoogle />
                                        Google API
                                    </button>
                                </li>
                                <li className="inline-block">
                                    <button
                                        onClick={() => toggleTabs('smtp')}
                                        className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'smtp' ? '!border-primary text-primary' : ''}`}
                                    >
                                        <IconMail />
                                        SMTP Settings
                                    </button>
                                </li>
                                 <li className="inline-block">
                                    <button onClick={() => toggleTabs('ThemeLayout')}className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'smtp' ? '!border-primary text-primary' : ''}`}
                                    >
                                        <IconServer />
                                        Theme Layout
                                    </button>
                                </li>
                                 <li className="inline-block">
                                    <button onClick={() => toggleTabs('campaign_agents')}className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'smtp' ? '!border-primary text-primary' : ''}`}
                                    >
                                        <IconServer />
                                        Campaign And Agents
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <form onSubmit={handleSubmit} className="border border-[#ebedf2] dark:border-[#191e3a] rounded-md p-4 mb-5 bg-white dark:bg-black">
                            {tabs === 'meta' && (
                                <div>
                                    <h6 className="text-lg font-bold mb-5">Meta Configuration</h6>
                                    <div className="grid grid-cols-1 gap-5">
                                        <div>
                                            <label htmlFor="meta_user_token">Meta User Token</label>
                                            <input 
                                                id="meta_user_token" 
                                                name="meta_user_token" 
                                                type="text" 
                                                placeholder="Enter Meta User Token" 
                                                className="form-input" 
                                                value={formData.meta_user_token}
                                                onChange={handleInputChange} 
                                            />
                                            {errors.meta_user_token && <span className="text-red-500 text-sm">{errors.meta_user_token}</span>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-5">
                                        <div>
                                            <label htmlFor="meta_page_token">Meta Page Token</label>
                                            <input 
                                                id="meta_page_token" 
                                                name="meta_page_token" 
                                                type="text" 
                                                placeholder="Enter Meta User Token" 
                                                className="form-input" 
                                                value={formData.meta_page_token}
                                                onChange={handleInputChange} 
                                            />
                                            {errors.meta_page_token && <span className="text-red-500 text-sm">{errors.meta_page_token}</span>}
                                            <p className="text-xs text-gray-500 mt-1">These token are used to authenticate with Meta APIs</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {tabs === 'whatsapp' && (
                                <div>
                                    <h6 className="text-lg font-bold mb-5">WhatsApp Business Configuration</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="whatsapp_business_id">WhatsApp Business ID</label>
                                            <input 
                                                id="whatsapp_business_id" 
                                                name="whatsapp_business_id" 
                                                type="text" 
                                                placeholder="Business ID" 
                                                className="form-input" 
                                                value={formData.whatsapp_business_id}
                                                onChange={handleInputChange} 
                                            />
                                            {errors.whatsapp_business_id && <span className="text-red-500 text-sm">{errors.whatsapp_business_id}</span>}
                                        </div>
                                        <div>
                                            <label htmlFor="whatsapp_phone_number_id">Phone Number ID</label>
                                            <input 
                                                id="whatsapp_phone_number_id" 
                                                name="whatsapp_phone_number_id" 
                                                type="text" 
                                                placeholder="Phone Number ID" 
                                                className="form-input" 
                                                value={formData.whatsapp_phone_number_id}
                                                onChange={handleInputChange} 
                                            />
                                            {errors.whatsapp_phone_number_id && <span className="text-red-500 text-sm">{errors.whatsapp_phone_number_id}</span>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label htmlFor="whatsapp_access_token">Access Token</label>
                                            <input 
                                                id="whatsapp_access_token" 
                                                name="whatsapp_access_token" 
                                                type="password" 
                                                placeholder="Access Token" 
                                                className="form-input" 
                                                value={formData.whatsapp_access_token}
                                                onChange={handleInputChange} 
                                            />
                                            {errors.whatsapp_access_token && <span className="text-red-500 text-sm">{errors.whatsapp_access_token}</span>}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {tabs === 'google' && (
                                <div>
                                    <h6 className="text-lg font-bold mb-5">Google API Configuration</h6>
                                    <div className="grid grid-cols-1 gap-5">
                                        <div>
                                            <label htmlFor="google_client_id">Google Client ID</label>
                                            <input 
                                                id="google_client_id" 
                                                name="google_client_id" 
                                                type="text" 
                                                placeholder="Client ID" 
                                                className="form-input" 
                                                value={formData.google_client_id}
                                                onChange={handleInputChange} 
                                            />
                                            {errors.google_client_id && <span className="text-red-500 text-sm">{errors.google_client_id}</span>}
                                        </div>
                                        <div>
                                            <label htmlFor="google_client_secret">Google Client Secret</label>
                                            <input 
                                                id="google_client_secret" 
                                                name="google_client_secret" 
                                                type="password" 
                                                placeholder="Client Secret" 
                                                className="form-input" 
                                                value={formData.google_client_secret}
                                                onChange={handleInputChange} 
                                            />
                                            {errors.google_client_secret && <span className="text-red-500 text-sm">{errors.google_client_secret}</span>}
                                        </div>
                                        <div>
                                            <label htmlFor="google_redirect_url">Redirect URL</label>
                                            <input 
                                                id="google_redirect_url" 
                                                name="google_redirect_url" 
                                                type="text" 
                                                placeholder="https://yourapp.com/auth/google/callback" 
                                                className="form-input" 
                                                value={formData.google_redirect_url}
                                                onChange={handleInputChange} 
                                            />
                                            {errors.google_redirect_url && <span className="text-red-500 text-sm">{errors.google_redirect_url}</span>}
                                            <p className="text-xs text-gray-500 mt-1">Make sure this matches your Google Cloud Console configuration</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {tabs === 'smtp' && (
                                <div>
                                    <h6 className="text-lg font-bold mb-5">SMTP Email Configuration</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="smtp_host">SMTP Host</label>
                                            <input 
                                                id="smtp_host" 
                                                name="smtp_host" 
                                                type="text" 
                                                placeholder="smtp.gmail.com" 
                                                className="form-input" 
                                                value={formData.smtp_host}
                                                onChange={handleInputChange} 
                                            />
                                            {errors.smtp_host && <span className="text-red-500 text-sm">{errors.smtp_host}</span>}
                                        </div>
                                        <div>
                                            <label htmlFor="smtp_port">SMTP Port</label>
                                            <input 
                                                id="smtp_port" 
                                                name="smtp_port" 
                                                type="number" 
                                                placeholder="587" 
                                                className="form-input" 
                                                value={formData.smtp_port}
                                                onChange={handleInputChange} 
                                            />
                                            {errors.smtp_port && <span className="text-red-500 text-sm">{errors.smtp_port}</span>}
                                        </div>
                                        <div>
                                            <label htmlFor="smtp_username">SMTP Username</label>
                                            <input  id="smtp_username" 
                                                name="smtp_username" 
                                                type="text" 
                                                placeholder="your@email.com" 
                                                className="form-input" 
                                                value={formData.smtp_username}
                                                onChange={handleInputChange} 
                                            />
                                            {errors.smtp_username && <span className="text-red-500 text-sm">{errors.smtp_username}</span>}
                                        </div>
                                        <div>
                                            <label htmlFor="smtp_password">SMTP Password</label>
                                            <input 
                                                id="smtp_password" 
                                                name="smtp_password" 
                                                type="password" 
                                                placeholder="Password" 
                                                className="form-input" 
                                                value={formData.smtp_password}
                                                onChange={handleInputChange} 
                                            />
                                            {errors.smtp_password && <span className="text-red-500 text-sm">{errors.smtp_password}</span>}
                                        </div>
                                        <div>
                                            <label htmlFor="smtp_encryption">Encryption</label>
                                            <select 
                                                id="smtp_encryption" 
                                                name="smtp_encryption" 
                                                className="form-select" 
                                                value={formData.smtp_encryption}
                                                onChange={handleInputChange}
                                            >
                                                <option value="tls">TLS</option>
                                                <option value="ssl">SSL</option>
                                                <option value="">None</option>
                                            </select>
                                            {errors.smtp_encryption && <span className="text-red-500 text-sm">{errors.smtp_encryption}</span>}
                                        </div>
                                        <div>
                                            <label htmlFor="smtp_from_address">From Address</label>
                                            <input 
                                                id="smtp_from_address" 
                                                name="smtp_from_address" 
                                                type="text" 
                                                placeholder="noreply@yourdomain.com" 
                                                className="form-input" 
                                                value={formData.smtp_from_address}
                                                onChange={handleInputChange} 
                                            />
                                            {errors.smtp_from_address && <span className="text-red-500 text-sm">{errors.smtp_from_address}</span>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label htmlFor="smtp_from_name">From Name</label>
                                            <input 
                                                id="smtp_from_name" 
                                                name="smtp_from_name" 
                                                type="text" 
                                                placeholder="Your Company Name" 
                                                className="form-input" 
                                                value={formData.smtp_from_name}
                                                onChange={handleInputChange} 
                                            />
                                            {errors.smtp_from_name && <span className="text-red-500 text-sm">{errors.smtp_from_name}</span>}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {tabs === "ThemeLayout" && (
                                <div>
                                    <h6 className="text-lg font-bold mb-5">Theme Layout</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="mt-4 flex flex-col sm:flex-row gap-4">
                                            <label className={`flex items-center gap-3 cursor-pointer rounded-lg border px-5 py-5 transition 
                                                ${formData.theme_layout === 1 
                                                ? "border-primary bg-primary/10 text-primary" 
                                                : "border-gray-300 hover:border-primary/50 dark:border-gray-600"}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="theme_layout"
                                                    value={1}
                                                    checked={formData.theme_layout === 1}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, theme_layout: Number(e.target.value) }))}
                                                    className="hidden"
                                                />
                                                <span className={`h-4 w-4 rounded-full border flex items-center justify-center
                                                    ${formData.theme_layout === 1 ? "border-primary bg-primary" : "border-gray-400"}
                                                    `}>
                                                    {formData.theme_layout === 1 && <span className="h-2 w-2 rounded-full bg-white" />}
                                                </span>
                                                <span className="text-sm font-medium">Main layout</span>
                                            </label>
                                            <label
                                                className={`flex items-center gap-3 cursor-pointer rounded-lg border px-4 py-3 transition 
                                                ${formData.theme_layout === 0 
                                                ? "border-primary bg-primary/10 text-primary" 
                                                : "border-gray-300 hover:border-primary/50 dark:border-gray-600"}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="theme_layout"
                                                    value={0}
                                                    checked={formData.theme_layout === 0}
                                                     onChange={(e) => setFormData(prev => ({ ...prev, theme_layout: Number(e.target.value) }))}
                                                    className="hidden"
                                                />
                                                <span className={`h-4 w-4 rounded-full border flex items-center justify-center
                                                    ${formData.theme_layout === 0 ? "border-primary bg-primary" : "border-gray-400"}
                                                    `}>
                                                    {formData.theme_layout === 0 && <span className="h-2 w-2 rounded-full bg-white" />}
                                                </span>
                                                <span className="text-sm font-medium">Sidebar layout</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {tabs === "campaign_agents" && (
                                <div>
                                    <h6 className="text-lg font-bold mb-5">Campaign & Agents</h6>
                                    {/* Campaign names */}
                                        <div className="form-group flex flex-col gap-2">
                                            <label htmlFor="campaign_names">Campaign Names</label>
                                            <input
                                                id="campaign_names"
                                                type="text"
                                                className="form-input border rounded p-2"
                                                placeholder="Enter campaign names, comma separated"
                                                value={campaigns}
                                                onChange={handleCampaignChange}
                                            />
                                            {errors.campaign_names && (
                                                <span className="text-red-500 text-sm">{errors.campaign_names}</span>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">Enter multiple campaign names separated by commas</p>
                                        </div>

                                        {/* Agent select */}
                                        <div className="form-group flex flex-col gap-2">
                                            <label htmlFor="agent_ids">Assign Agents</label>
                                            <Select
                                                id="agent_ids"
                                                name="agent_ids"
                                                placeholder={loading ? 'Loading agents...' : 'Select agents'}
                                                options={agents}
                                                value={getSelectedAgents()}
                                                onChange={handleAgentChange}
                                                isClearable={true}
                                                isDisabled={loading}
                                                isMulti={true}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                            />
                                            {errors.agent_ids && (
                                                <span className="text-red-500 text-sm">{errors.agent_ids}</span>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">Select one or multiple agents</p>
                                        </div>
                                </div>
                            )}
                            
                        <div className="flex justify-end mt-8">
                                <button type="submit" className="btn btn-secondary btn-sm" disabled={saveLoading}>
                                    {saveLoading ? (
                                        <>
                                            <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4 ltr:mr-2 rtl:ml-2 inline-block"></span>
                                            Saving...
                                        </>
                                    ) : 'Save'}
                                </button> 
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ConfigSettings;
