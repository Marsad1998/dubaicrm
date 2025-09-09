import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { setPageTitle } from '../../slices/themeConfigSlice';
import { useDispatch, useSelector } from 'react-redux';
import IconSettings from '../../components/Icon/IconSettings';
import IconMail from '../../components/Icon/IconMail';
import IconBrandWhatsapp from '../../components/Icon/IconMessage';
import IconBrandGoogle from '../../components/Icon/IconGoogle';
import IconServer from '../../components/Icon/IconServer';
import apiClient from '../../utils/apiClient';
import { getBaseUrl } from '../../components/BaseUrl';
import Toast from '../../services/toast';
import { debounce } from "lodash";

const endpoints = {
    getConfig: `${getBaseUrl()}/config`,
    updateConfig: `${getBaseUrl()}/config/update`,
};

const ConfigSettings = () => {
    const dispatch = useDispatch();
    const toast = Toast();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const requestMade = useRef(false);
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        if (!requestMade.current) {
            dispatch(setPageTitle("Configuration Settings"));
            fetchConfigData();
            requestMade.current = true;
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
    });

    const fetchConfigData = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(endpoints.getConfig);
            if (response.data && response.data.config) {
                setFormData(prev => ({
                    ...prev,
                    ...response.data.config
                }));
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
                                            <input 
                                                id="smtp_username" 
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
                            
                            <div className="flex justify-end mt-8">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={saveLoading}
                                >
                                    {saveLoading ? (
                                        <>
                                            <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4 ltr:mr-2 rtl:ml-2 inline-block"></span>
                                            Saving...
                                        </>
                                    ) : 'Save Changes'}
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