import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../slices/themeConfigSlice';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './listing.css';
import Toast from '../../services/toast';
import { options } from '../../services/status';
import { Select } from '@mantine/core';

const endpoints = {
    getCombineData: `${getBaseUrl()}/listing/get_combine_data`,
    getSubCategories: `${getBaseUrl()}/listing/get_subcategories`,
    storeApi: `${getBaseUrl()}/listing/store`,
    getSingleListing: `${getBaseUrl()}/listing/get_single_listing`,
    updateApi: `${getBaseUrl()}/listing/update_listing`,
};

const amenitiesList = [
    { id: 1, label: 'Swimming Pool' },
    { id: 2, label: 'Gym' },
    { id: 3, label: 'Parking' },
    { id: 4, label: '24/7 Security' },
    { id: 5, label: 'Balcony' },
    { id: 6, label: 'Garden' },
    { id: 7, label: 'Elevator' },
    { id: 8, label: 'Central A/C' },
    { id: 9, label: "Maid's Room" },
    { id: 10, label: 'Storage Room' },
    { id: 11, label: 'Pets Allowed' },
    { id: 12, label: 'Concierge' },
    { id: 13, label: 'Spa' },
    { id: 14, label: 'Jacuzzi' },
    { id: 15, label: 'BBQ Area' },
    { id: 16, label: 'Kids Play Area' },
    { id: 17, label: 'Lobby' },
    { id: 18, label: 'Study Room' },
];

const CreateListing = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const formRef = useRef<HTMLFormElement>(null);
    const toast = Toast();
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const requestMade = useRef(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [listingId, setListingId] = useState<string | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [selectedAgentData, setSelectedAgentData] = useState<any>(null);
    
    const [englishDescription, setEnglishDescription] = useState('');
    const [arabicDescription, setArabicDescription] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [uploadedFloorPlan, setUploadedFloorPlan] = useState<File | null>(null);
    const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
    const [status, setStatus] = useState<any | null>(null);

    const [formData, setFormData] = useState({
        category_id: '',
        subcategory_id: '',
        purpose: '',
        location_id: '',
        address: '',
        unit_number: '',
        permit_number: '',
        completion_status: '',
        reference_number: '',
        area_sqft: '',
        bedrooms: '',
        bathrooms: '',
        occupancy_status: '',
        ownership_status: '',
        title_en: '',
        title_ar: '',
        price: '',
        rent_frequency: '',
        min_contractperiod: '',
        notice_period: '',
        maintenance_fee: '',
        maintenance_fee_payer: '',
        agent_id: '',
        virtualTourUrl: '',
        status : ''
    });

    const steps = [
        { number: 1, title: 'Details' },
        { number: 2, title: 'Amenities' },
        { number: 3, title: 'Uploads' }
    ];

    const statusList = [
        { number: 1, title: 'Active' },
        { number: 2, title: 'Inactive' },
    ]

    useEffect(() => {
        if (!requestMade.current) {
            // Check if we're in edit mode
            if (id) {
                setIsEditMode(true);
                setListingId(id);
                dispatch(setPageTitle('Edit Listing'));
            } else {
                dispatch(setPageTitle('Create Listing'));
            }
            fetchCombineData();
            requestMade.current = true;
        }
    }, [dispatch, id]);

    useEffect(() => {
        // Fetch listing data if in edit mode
        if (isEditMode && listingId && users.length > 0 && categories.length > 0) {
            fetchListingData(listingId);
        }
    }, [isEditMode, listingId, users, categories]);

    const fetchCombineData = async () => {
        try {
            const response = await apiClient.get(endpoints.getCombineData);
            setUsers(response.data.users || []);
            setCategories(response.data.categories || []);
        } catch (error: any) {
            if (error.response?.status === 403) {
                window.location.href = '/error';
            }
        }
    };

    const fetchListingData = async (listingId: string) => {
        setIsLoadingData(true);
        try {
            const response = await apiClient.get(`${endpoints.getSingleListing}/${listingId}`);
            
            if (response.data.status === 'success' && response.data.signlelist) {
                const listing = response.data.signlelist;
                
                // Populate form data
                setFormData({
                    category_id: listing.category_id?.toString() || '',
                    subcategory_id: listing.subcategory_id?.toString() || '',
                    purpose: listing.purpose?.toString() || '',
                    location_id: listing.location_id?.toString() || '',
                    address: listing.address || '',
                    unit_number: listing.unit_number || '',
                    permit_number: listing.permit_number || '',
                    completion_status: listing.completion_status?.toString() || '',
                    reference_number: listing.reference_number || '',
                    area_sqft: listing.area_sqft?.toString() || '',
                    bedrooms: listing.bedrooms?.toString() || '',
                    bathrooms: listing.bathrooms?.toString() || '',
                    occupancy_status: listing.occupancy_status?.toString() || '',
                    ownership_status: listing.ownership_status?.toString() || '',
                    title_en: listing.title_en || '',
                    title_ar: listing.title_ar || '',
                    price: listing.price?.toString() || '',
                    rent_frequency: listing.rent_frequency?.toString() || '',
                    min_contractperiod: listing.min_contract_period?.toString() || '',
                    notice_period: listing.notice_period?.toString() || '',
                    maintenance_fee: listing.maintenance_fee?.toString() || '',
                    maintenance_fee_payer: listing.maintenance_fee_payer?.toString() || '',
                    agent_id: listing.agent_id?.toString() || '',
                    virtualTourUrl: listing.virtual_tour_url || '',
                    status: listing.status?.toString() || ''
                });

                // Set descriptions
                setEnglishDescription(listing.description_en || '');
                setArabicDescription(listing.description_ar || '');

                // Set amenities if available
                if (listing.amenities) {
                    // The amenities come as a JSON string like "[\"1\",\"2\",\"8\"]"
                    try {
                        const amenityIds = JSON.parse(listing.amenities).map((id: string) => parseInt(id)).filter((id: number) => !isNaN(id));
                        setSelectedAmenities(amenityIds);
                    } catch (error) {
                        console.error('Error parsing amenities:', error);
                    }
                }

                // Fetch subcategories for the selected category
                if (listing.category_id) {
                    try {
                        const subCatResponse = await apiClient.get(`${endpoints.getSubCategories}/${listing.category_id}`);
                        setSubCategories(subCatResponse.data);
                    } catch (error) {
                        console.error('Error fetching subcategories:', error);
                    }
                }

                toast.success('Listing data loaded successfully');
            } else {
                toast.error('Failed to load listing data');
                navigate('/pages/listing/view-listing');
            }
        } catch (error: any) {
            console.error('Error fetching listing data:', error);
            toast.error(error.response?.data?.message || 'Failed to load listing data');
            navigate('/pages/listing/view-listing');
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryId = e.target.value;
        setFormData({...formData, category_id: categoryId});
        setSubCategories([]);
        setFormData(prev => ({...prev, subcategory_id: ''}));
        
        if (categoryId) {
            try {
                const response = await apiClient.get(`${endpoints.getSubCategories}/${categoryId}`);
                setSubCategories(response.data);
            } catch (error) {
                console.error('Error fetching subcategories:', error);
                setSubCategories([]);
            }
        }
    };

    const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const agentId = e.target.value;
        setFormData({...formData, agent_id: agentId});
        
        if (agentId) {
            const agent = users.find((u: any) => u.value === agentId);
            // setSelectedAgentData(agent?.data || null);
        } else {
            setSelectedAgentData(null);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleAmenityToggle = (amenityId: number) => {
        setSelectedAmenities(prev => 
            prev.includes(amenityId) 
                ? prev.filter(id => id !== amenityId)
                : [...prev, amenityId]
        );
        
        // Clear amenities error when user selects at least one
        if (errors.amenities && selectedAmenities.length >= 0) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors.amenities;
                return newErrors;
            });
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setUploadedImages(prev => [...prev, ...newFiles]);
        }
    };

    const removeImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const generateReferenceNumber = () => {
        const prefix = 'REF';
        const timestamp = Date.now().toString(36);
        const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
        const generatedRef = `${prefix}-${timestamp}-${randomChars}`;
        
        setFormData({...formData, reference_number: generatedRef});
        
        if (formRef.current) {
            const referenceInput = formRef.current.querySelector('input[name="reference_number"]') as HTMLInputElement;
            if (referenceInput) {
                referenceInput.value = generatedRef;
            }
        }
    };

    const validateStep = async (step: number): Promise<boolean> => {
        const formDataToValidate = new FormData();
        formDataToValidate.append('step', step.toString());

        if (step === 1) {
            Object.keys(formData).forEach(key => {
                formDataToValidate.append(key, formData[key as keyof typeof formData]);
            });
            formDataToValidate.append('description_en', englishDescription);
            formDataToValidate.append('description_ar', arabicDescription);
        } else if (step === 2) {
            selectedAmenities.forEach(id => {
                formDataToValidate.append('amenities[]', String(id));
            });
        } else if (step === 3) {
            // Uploads step validation (if needed)
            return true;
        }
        
        try {
            const response = await apiClient.post(endpoints.storeApi, formDataToValidate, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.status) {
                setErrors({});
                return true;
            }
            return false;
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                return false;
            }
            toast.error('Validation failed');
            return false;
        }
    };

    const submitStep = async (step: number) => {
        setIsSubmitting(true);
        try {
            const isValid = await validateStep(step);
            if (isValid) {
                if (step < 3) {
                    setCurrentStep(step + 1);
                    toast.success(`Step ${step} completed successfully`);
                } else {
                    // Submit final form
                    await submitFinalForm();
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitFinalForm = async () => {
        const finalFormData = new FormData();
        
        // If in edit mode, append the listing ID
        if (isEditMode && listingId) {
            finalFormData.append('listing_id', listingId);
        }
        
        // Append all form data
        Object.keys(formData).forEach(key => {
            finalFormData.append(key, formData[key as keyof typeof formData]);
        });
        
        // Append descriptions
        finalFormData.append('description_en', englishDescription);
        finalFormData.append('description_ar', arabicDescription);
        
        // Append amenities
        selectedAmenities.forEach(id => {
            finalFormData.append('amenities[]', String(id));
        });
        
        // Append files (only if new files are uploaded)
        uploadedImages.forEach((file, i) => {
            finalFormData.append(`images[${i}]`, file);
        });

        if (uploadedFloorPlan) {
            finalFormData.append('floor_plan', uploadedFloorPlan);
        }

        if (uploadedVideo) {
            finalFormData.append('video', uploadedVideo);
        }

        try {
            // Use update endpoint if in edit mode, otherwise use store endpoint
            const endpoint = isEditMode ? endpoints.updateApi : endpoints.storeApi;
            const response = await apiClient.post(endpoint, finalFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.status) {
                toast.success(response.data.message || (isEditMode ? 'Listing updated successfully' : 'Listing created successfully'));
                
                // Navigate back to view listing page after success
                setTimeout(() => {
                    navigate('/pages/listing/view-listing');
                }, 1500);
            }
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                toast.error('Please fix the validation errors');
            } else {
                toast.error(error.response?.data?.message || 'Something went wrong');
            }
        }
    };

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ]
    };

    const nextStep = async () => {
        await submitStep(currentStep);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-6">
            {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                    <div className="flex items-center">
                        <div 
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                currentStep >= step.number ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                            {currentStep > step.number ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : step.number}
                        </div>
                        <span className={`ml-2 text-sm font-medium ${currentStep >= step.number ? 'text-green-600' : 'text-gray-500'}`}>
                            {step.title}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`w-16 h-0.5 mx-3 transition-all ${
                            currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                        }`} />
                    )}
                </div>
            ))}
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Category *</label>
                    <select 
                        name="category_id" 
                        value={formData.category_id}
                        onChange={handleCategoryChange}
                        className="form-select"
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat: any) => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                    {errors.category_id && <p className="text-xs text-red-600 mt-1">{errors.category_id[0]}</p>}
                </div>
                
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Sub Category *</label>
                    <select 
                        name="subcategory_id" 
                        value={formData.subcategory_id}
                        onChange={handleInputChange}
                        className="form-select" 
                        disabled={subCategories.length === 0}
                    >
                        <option value="">Sub Category</option>
                        {subCategories.map((sub: any) => (
                            <option key={sub.value} value={sub.value}>{sub.label}</option>
                        ))}
                    </select>
                    {errors.subcategory_id && <p className="text-xs text-red-600 mt-1">{errors.subcategory_id[0]}</p>}
                </div>
                
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Purpose *</label>
                    <select 
                        name="purpose" 
                        value={formData.purpose}
                        onChange={handleInputChange}
                        className="form-select"
                    >
                        <option value="">Select Purpose</option>
                        <option value="1">For Rent</option>
                        <option value="2">For Sale</option>
                    </select>
                    {errors.purpose && <p className="text-xs text-red-600 mt-1">{errors.purpose[0]}</p>}
                </div>
                
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Location *</label>
                    <select 
                        name="location_id" 
                        value={formData.location_id}
                        onChange={handleInputChange}
                        className="form-select"
                    >
                        <option value="">Choose Area...</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Address *</label>
                    <input 
                        type="text" 
                        name="address" 
                        value={formData.address}
                        onChange={handleInputChange}
                        className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                        placeholder="Enter address" 
                    />
                    {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address[0]}</p>}
                </div>
                
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Unit No. *</label>
                    <input 
                        type="text" 
                        name="unit_number" 
                        value={formData.unit_number}
                        onChange={handleInputChange}
                        className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                        placeholder="Enter unit number" 
                    />
                    {errors.unit_number && <p className="text-xs text-red-600 mt-1">{errors.unit_number[0]}</p>}
                </div>
                
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Permit Number *</label>
                    <input 
                        type="text" 
                        name="permit_number" 
                        value={formData.permit_number}
                        onChange={handleInputChange}
                        className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                        placeholder="Enter permit number" 
                    />
                    {errors.permit_number && <p className="text-xs text-red-600 mt-1">{errors.permit_number[0]}</p>}
                </div>
                
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Completion Status *</label>
                    <select 
                        name="completion_status" 
                        value={formData.completion_status}
                        onChange={handleInputChange}
                        className="form-select"
                    >
                        <option value="">Select status</option>
                        <option value="1">Ready</option>
                        <option value="2">Off Plan</option>
                        <option value="3">Under Construction</option>
                    </select>
                    {errors.completion_status && <p className="text-xs text-red-600 mt-1">{errors.completion_status[0]}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Reference Number *</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            name="reference_number" 
                            value={formData.reference_number}
                            onChange={handleInputChange}
                            className="form-input flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                            placeholder="Enter reference" 
                        />
                        <button 
                            type="button" 
                            className="px-3 py-2 text-xs font-medium border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors whitespace-nowrap bg-secondary text-white" 
                            onClick={generateReferenceNumber}
                        >
                            Generate
                        </button>
                    </div>
                    {errors.reference_number && <p className="text-xs text-red-600 mt-1">{errors.reference_number[0]}</p>}
                </div>
                
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Area (Square Feet)</label>
                    <input 
                        type="number" 
                        name="area_sqft" 
                        value={formData.area_sqft}
                        onChange={handleInputChange}
                        min="0" 
                        className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                        placeholder="Enter area" 
                    />
                </div>
                
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Bedrooms *</label>
                    <select 
                        name="bedrooms" 
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        className="form-select"
                    >
                        <option value="">Select</option>
                        <option value="0">Studio</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6+</option>
                    </select>
                    {errors.bedrooms && <p className="text-xs text-red-600 mt-1">{errors.bedrooms[0]}</p>}
                </div>
                
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Bathrooms *</label>
                    <select 
                        name="bathrooms" 
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        className="form-select"
                    >
                        <option value="">Select</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6+</option>
                    </select>
                    {errors.bathrooms && <p className="text-xs text-red-600 mt-1">{errors.bathrooms[0]}</p>}
                </div>
                
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Occupancy Status</label>
                    <select name="occupancy_status" value={formData.occupancy_status}onChange={handleInputChange} className="form-select">
                        <option value="">Select</option>
                        <option value="1">Vacant</option>
                        <option value="2">Occupied</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Ownership Status</label>
                    <select name="ownership_status" value={formData.ownership_status} onChange={handleInputChange} className="form-select">
                        <option value="">Select</option>
                        <option value="1">Freehold</option>
                        <option value="2">Leasehold</option>
                    </select>
                </div>
                
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Title (EN) *</label>
                    <input 
                        type="text" 
                        name="title_en" 
                        value={formData.title_en}
                        onChange={handleInputChange}
                        className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                        placeholder="Please enter title" 
                        maxLength={150} 
                        dir="ltr" 
                    />
                    {errors.title_en && <p className="text-xs text-red-600 mt-1">{errors.title_en[0]}</p>}
                </div>
                
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Title (AR)</label>
                    <input 
                        type="text" 
                        name="title_ar" 
                        value={formData.title_ar}
                        onChange={handleInputChange}
                        className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                        placeholder="آدخل العنوان هنا" 
                        maxLength={150} 
                        dir="rtl" 
                    />
                    {errors.title_ar && <p className="text-xs text-red-600 mt-1">{errors.title_ar[0]}</p>}
                </div>
                
                <div className="form-group lg:col-span-2">
                    <label className="block mb-1 text-xs text-gray-600">Description (EN) *</label>
                    <ReactQuill 
                        theme="snow" 
                        value={englishDescription} 
                        onChange={(value) => {
                            setEnglishDescription(value);
                            if (errors.description_en) {
                                setErrors(prev => {
                                    const newErrors = {...prev};
                                    delete newErrors.description_en;
                                    return newErrors;
                                });
                            }
                        }} 
                        placeholder="Description will come here" 
                        modules={quillModules} 
                        className="mb-10" 
                    />
                    {errors.description_en && <p className="text-xs text-red-600 mt-1">{errors.description_en[0]}</p>}
                </div>
                
                <div className="form-group lg:col-span-2">
                    <label className="block mb-1 text-xs text-gray-600">Description (AR)</label>
                    <ReactQuill 
                        theme="snow" 
                        value={arabicDescription} 
                        onChange={setArabicDescription} 
                        placeholder="الوصف سيأتي هنا" 
                        modules={quillModules} 
                        className="mb-10" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Price (AED) *</label>
                    <input 
                        type="text" 
                        name="price" 
                        value={formData.price}
                        onChange={handleInputChange}
                        className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                        placeholder="Enter price" 
                    />
                    {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price[0]}</p>}
                </div>
                
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Rent Frequency *</label>
                    <select 
                        name="rent_frequency" 
                        value={formData.rent_frequency}
                        onChange={handleInputChange}
                        className="form-select"
                    >
                        <option value="">Select</option>
                        <option value="1">Yearly</option>
                        <option value="2">Monthly</option>
                        <option value="3">Weekly</option>
                        <option value="4">Daily</option>
                    </select>
                    {errors.rent_frequency && <p className="text-xs text-red-600 mt-1">{errors.rent_frequency[0]}</p>}
                </div>
                
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Min. Contract Period</label>
                    <input 
                        type="number" 
                        name="min_contractperiod" 
                        value={formData.min_contractperiod}
                        onChange={handleInputChange}
                        className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                        placeholder="Months" 
                    />
                    {errors.min_contractperiod && <p className="text-xs text-red-600 mt-1">{errors.min_contractperiod[0]}</p>}
                </div>
                
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Notice Period</label>
                    <input 
                        type="number" 
                        name="notice_period" 
                        value={formData.notice_period}
                        onChange={handleInputChange}
                        className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                        placeholder="Months" 
                    />
                    {errors.notice_period && <p className="text-xs text-red-600 mt-1">{errors.notice_period[0]}</p>}
                </div>
                
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Maintenance Fee</label>
                    <input 
                        type="number" 
                        name="maintenance_fee" 
                        value={formData.maintenance_fee}
                        onChange={handleInputChange}
                        className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                        placeholder="AED" 
                    />
                </div>
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Paid By</label>
                    <select name="maintenance_fee_payer" value={formData.maintenance_fee_payer} onChange={handleInputChange} className="form-select">
                        <option value="">Select</option>
                        <option value="1">Tenant</option>
                        <option value="2">Owner</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="block mb-1 text-xs text-gray-600">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="form-select">
                        <option value="">Select</option>
                        {statusList.map((option) => (
                            <option key={option.number} value={option.number}>{option.title}</option>
                        ))}
                    </select>
                    {errors?.status && <p className="text-danger error">{errors.status[0]}</p>}
                </div>
                <div className="form-group lg:col-span-3">
                    <label className="block mb-1 text-xs text-gray-600">Listing Owner *</label>
                    <select 
                        name="agent_id" 
                        value={formData.agent_id}
                        onChange={handleAgentChange}
                        className="form-select"
                    >
                        <option value="">Select agent</option>
                        {users.map((user: any) => (
                            <option key={user.value} value={user.value}>{user.label}</option>
                        ))}
                    </select>
                    {errors.agent_id && <p className="text-xs text-red-600 mt-1">{errors.agent_id[0]}</p>}
                </div>
                
                {selectedAgentData && (
                    <div className="lg:col-span-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <div className="text-sm text-blue-900 font-medium mb-2">Owner Information</div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                <div><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedAgentData?.client_user_name || 'N/A'}</span></div>
                                <div><span className="text-gray-600">Email:</span> <span className="font-medium">{selectedAgentData?.email || 'N/A'}</span></div>
                                <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{selectedAgentData?.phone || 'N/A'}</span></div>
                                <div><span className="text-gray-600">Mobile:</span> <span className="font-medium">{selectedAgentData?.mobile || 'N/A'}</span></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <div>
                <h5 className="text-base font-semibold mb-2 text-gray-700">Choose Amenities *</h5>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {amenitiesList.map((amenity) => (
                    <div key={amenity.id} onClick={() => handleAmenityToggle(amenity.id)} className={`p-3 rounded-md border cursor-pointer transition-all text-center ${selectedAmenities.includes(amenity.id) ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                        <div className={`w-7 h-7 mx-auto mb-1.5 rounded-full flex items-center justify-center ${selectedAmenities.includes(amenity.id) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {selectedAmenities.includes(amenity.id) ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            )}
                        </div>
                        <span className="text-xs font-medium text-gray-700">{amenity.label}</span>
                    </div>
                ))}
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-xs text-gray-600">
                    <span className="font-medium">{selectedAmenities.length}</span> amenities selected
                </p>
            </div>
            {errors.amenities && <p className="text-xs text-red-600 mt-1">{errors.amenities[0]}</p>}
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-5">
            <div>
                <h5 className="text-base font-semibold mb-2 text-gray-700">Property Images</h5>
                <p className="text-sm text-gray-500 mb-3">Upload property images (max 20)</p>
                <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 text-center hover:border-green-500 transition-colors bg-gray-50">
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                    <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center">
                            <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Click to upload images</span>
                            <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB each</span>
                        </div>
                    </label>
                </div>
                {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-3">
                        {uploadedImages.map((file, index) => (
                            <div key={index} className="relative group">
                                <img src={URL.createObjectURL(file)} alt={`Upload ${index + 1}`} className="w-full h-20 object-cover rounded-md border border-gray-200" />
                                <button type="button" onClick={() => removeImage(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <h5 className="text-base font-semibold mb-2 text-gray-700">Floor Plan</h5>
                    <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 text-center hover:border-green-500 transition-colors bg-gray-50">
                        <input type="file" accept="image/*,.pdf" onChange={(e) => e.target.files && setUploadedFloorPlan(e.target.files[0])} className="hidden" id="floorplan-upload" />
                        <label htmlFor="floorplan-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">{uploadedFloorPlan ? uploadedFloorPlan.name : 'Upload floor plan'}</span>
                                <span className="text-xs text-gray-500 mt-1">PDF, PNG, JPG</span>
                            </div>
                        </label>
                    </div>
                </div>
                
                <div>
                    <h5 className="text-base font-semibold mb-2 text-gray-700">Video Tour</h5>
                    <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 text-center hover:border-green-500 transition-colors bg-gray-50">
                        <input type="file" accept="video/*" onChange={(e) => e.target.files && setUploadedVideo(e.target.files[0])} className="hidden" id="video-upload" />
                        <label htmlFor="video-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">{uploadedVideo ? uploadedVideo.name : 'Upload video'}</span>
                                <span className="text-xs text-gray-500 mt-1">MP4, MOV</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
            
            <div>
                <h5 className="text-base font-semibold mb-2 text-gray-700">Virtual Tour</h5>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-3">
                        <label className="block mb-1 text-xs text-gray-600">Virtual Tour URL</label>
                        <input 
                            type="url" 
                            name="virtualTourUrl" 
                            value={formData.virtualTourUrl}
                            onChange={handleInputChange}
                            className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                            placeholder="https://example.com/virtual-tour" 
                        />
                        <p className="text-xs text-gray-500 mt-1">Add a link to your 360° virtual tour</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <form ref={formRef}>
            <div className="panel bg-white rounded-lg shadow-sm">
                {isLoadingData ? (
                    <div className="flex items-center justify-center min-h-[450px]">
                        <div className="text-center">
                            <svg className="animate-spin h-10 w-10 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-600">Loading listing data...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {renderStepIndicator()}
                        <div className="min-h-[450px] py-4">
                            {currentStep === 1 && renderStep1()}
                            {currentStep === 2 && renderStep2()}
                            {currentStep === 3 && renderStep3()}
                        </div>
                    </>
                )}
                <div className="border-t pt-4 mt-5">
                    <div className="flex justify-between items-center">
                        <button 
                            type="button" 
                            onClick={prevStep} 
                            disabled={currentStep === 1 || isSubmitting} 
                            className={`px-3 py-2 text-sm font-medium border rounded-md transition-colors flex items-center gap-1.5 ${currentStep === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </button>
                        {currentStep < 3 ? (
                            <button 
                                type="button" 
                                onClick={nextStep} 
                                disabled={isSubmitting}
                                className="px-3 py-2 text-sm font-medium bg-secondary text-white border border-secondary-600 rounded-md hover:bg-secondary-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Validating...
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        ) : (
                            <button 
                                type="button" 
                                onClick={() => submitStep(3)} 
                                disabled={isSubmitting || isLoadingData}
                                className="px-6 py-2 text-sm font-medium bg-green-600 text-white border border-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {isEditMode ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {isEditMode ? 'Update Listing' : 'Submit Listing'}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
};

export default CreateListing;