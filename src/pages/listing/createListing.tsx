import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../slices/themeConfigSlice';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import Loader from '../../services/loader';
import Select from 'react-select';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './listing.css';

const endpoints = {
    getCombineData: `${getBaseUrl()}/listing/get_combine_data`,
    getSubCategories: `${getBaseUrl()}/listing/get_subcategories`,
    storeApi: `${getBaseUrl()}/listing/store`,
};



const purposeOptions = [
    { value: 1, label: 'For Rent' },
    { value: 2, label: 'For Sale' }
];

const completionStatusOptions = [
    { value: 1, label: 'Ready' },
    { value: 2, label: 'Off Plan' },
    { value: 3, label: 'Under Construction' }
];

const bedroomsOptions = [
    { value: 0, label: 'Studio' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6+' }
];

const bathroomsOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6+' }
];

const occupancyStatusOptions = [
    { value: 1, label: 'Vacant' },
    { value: 2, label: 'Occupied' }
];

const ownershipStatusOptions = [
    { value: 1, label: 'Freehold' },
    { value: 2, label: 'Leasehold' }
];

const rentFrequencyOptions = [
    { value: 1, label: 'Yearly' },
    { value: 2, label: 'Monthly' },
    { value: 3, label: 'Weekly' },
    { value: 4, label: 'Daily' }
];

const maintenanceFeePayerOptions = [
    { value: 1, label: 'Tenant' },
    { value: 2, label: 'Owner' }
];

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
    const loader = Loader();
    const combinedRef = useRef<any>({ userformRef: null });
    const [users, setUsers] = useState([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const requestMade = useRef(false);
    const [currentStep, setCurrentStep] = useState(1);


    const [isSubCategoryDisabled, setIsSubCategoryDisabled] = useState(true);

    const [selectedPurpose, setSelectedPurpose] = useState<any>(null);
    const [selectedCompletionStatus, setSelectedCompletionStatus] = useState<any>(null);
    const [selectedBedrooms, setSelectedBedrooms] = useState<any>(null);
    const [selectedBathrooms, setSelectedBathrooms] = useState<any>(null);
    const [selectedOccupancyStatus, setSelectedOccupancyStatus] = useState<any>(null);
    const [selectedOwnershipStatus, setSelectedOwnershipStatus] = useState<any>(null);
    const [selectedRentFrequency, setSelectedRentFrequency] = useState<any>(null);
    const [selectedMaintenanceFeePayer, setSelectedMaintenanceFeePayer] = useState<any>(null);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);
    const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);

    // Text states
    const [englishTitle, setEnglishTitle] = useState('');
    const [arabicTitle, setArabicTitle] = useState('');
    const [englishDescription, setEnglishDescription] = useState('');
    const [arabicDescription, setArabicDescription] = useState('');
    const [selectedAgentData, setSelectedAgentData] = useState(null);
    const [referenceNumber, setReferenceNumber] = useState('');

    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [uploadedFloorPlan, setUploadedFloorPlan] = useState<File | null>(null);
    const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
    
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [areaSqft, setAreaSqft] = useState('');
    const [price, setPrice] = useState('');



    const steps = [
        { number: 1, title: 'Details' },
        { number: 2, title: 'Amenities' },
        { number: 3, title: 'Uploads' }
    ];

    useEffect(() => {
        if (!requestMade.current) {
            dispatch(setPageTitle('Create Listing'));
            fetchCombineData();
            requestMade.current = true;
        }
    }, [dispatch]);

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
    
    const handleAgentChange = (selectedOption: any) => {
        setSelectedAgent(selectedOption);
        if (selectedOption) {
            setSelectedAgentData(selectedOption.data);
        } else {
            setSelectedAgentData(null);
        }
    };

    const handleAmenityToggle = (amenityId: number) => {
        setSelectedAmenities(prev => 
            prev.includes(amenityId) 
                ? prev.filter(id => id !== amenityId)
                : [...prev, amenityId]
        );
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

    const handlePriceChange = (value:any) => {
        const clean = value.replace(/,/g, '');
        if (!/^\d*$/.test(clean)) return;
        const formatted = clean.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        setPrice(formatted);
    }
    const formatPriceShort = (val:any) => {
    const num = Number(val.replace(/,/g, ''));

    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';

    return num;
};


    





    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();

        const listingData = {
            category_id: combinedRef.current.userformRef?.category_id?.value,
            subcategory_id: combinedRef.current.userformRef?.subcategory_id?.value,
            purpose: selectedPurpose?.value,
            completion_status: selectedCompletionStatus?.value,
            bedrooms: selectedBedrooms?.value,
            bathrooms: selectedBathrooms?.value,
            occupancy_status: selectedOccupancyStatus?.value,
            ownership_status: selectedOwnershipStatus?.value,
            reference_number: referenceNumber,
            address: combinedRef.current.userformRef?.address?.value,
            unit_number: combinedRef.current.userformRef?.unit_number?.value,
            permit_number: combinedRef.current.userformRef?.permit_number?.value,
            // area_sqft: combinedRef.current.userformRef?.area_sqft?.value,
            area_sqft: areaSqft,
            english_title: englishTitle,
            arabic_title: arabicTitle,
            english_description: englishDescription,
            arabic_description: arabicDescription,
            rent_price: combinedRef.current.userformRef?.rentPrice?.value,
            rent_frequency: selectedRentFrequency?.value,
            min_contract_period: combinedRef.current.userformRef?.min_contractperiod?.value,
            notice_period: combinedRef.current.userformRef?.notice_period?.value,
            maintenance_fee: combinedRef.current.userformRef?.maintenance_fee?.value,
            maintenance_fee_payer: selectedMaintenanceFeePayer?.value,
            agent_id: selectedAgent?.value,
            amenities: selectedAmenities,
            virtual_tour_url: combinedRef.current.userformRef?.virtualTourUrl?.value
        };
        
        // 2. Add JSON data as a field
        formData.append('listing_data', JSON.stringify(listingData));
        
        // 3. Add files
        uploadedImages.forEach((file, index) => {
            formData.append(`images[${index}]`, file);
        });
        
        if (uploadedFloorPlan) {
            formData.append('floor_plan', uploadedFloorPlan);
        }

        if (uploadedVideo) {
            formData.append('video', uploadedVideo);
        }
        try {
            const response = await apiClient.post(endpoints.storeApi, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            console.log('Form submitted successfully:', response.data);
        } catch (error) {
            console.error('Error submitting form:', error);
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

    const generateReferenceNumber = () => {
        const prefix = 'REF';
        const timestamp = Date.now().toString(36);
        const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
        const generatedRef = `${prefix}-${timestamp}-${randomChars}`;
        setReferenceNumber(generatedRef);
    };

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleCategory = async (selectedOption: any) => {
    if (selectedOption) {
        try {
            const response = await apiClient.get(`${endpoints.getSubCategories}/${selectedOption.value}`);
            setSubCategories(response.data); 
            setIsSubCategoryDisabled(false); 
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            setSubCategories([]);
            setIsSubCategoryDisabled(true); 
        }
    } else {
        setSubCategories([]);
        setIsSubCategoryDisabled(true);
    }
};

    
    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-6">
            {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                    <div className="flex items-center">
                        <div 
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                currentStep >= step.number  ? 'bg-green-600 text-white'  : 'bg-gray-200 text-gray-500' }`}>
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
            <div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="form-group">
                        <label className="block mb-1 text-xs text-gray-600">Category *</label>
                        <Select options={categories} onChange={handleCategory} placeholder="Select Category" className="react-select-container" classNamePrefix="react-select rounderd-sm" name="category_id"/>
                    </div>
                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Sub Category *</label>
                        <Select options={subCategories} placeholder="Sub Category" className="react-select-container" classNamePrefix="react-select rounderd-sm" name="subcategory_id" isDisabled={isSubCategoryDisabled}/>
                    </div>
                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Purpose *</label>
                        <Select options={purposeOptions} value={selectedPurpose} onChange={setSelectedPurpose} placeholder="Select Purpose" className="react-select-container" classNamePrefix="react-select"/>
                    </div>
                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Location *</label>
                        <Select options={[]} placeholder="Choose Area..." className="react-select-container" classNamePrefix="react-select" isSearchable/>
                    </div>
                </div>
            </div>
            <div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Address</label>
                        <input
                            type="text"
                            name="address"
                            className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter address"
                        />
                    </div>
                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Unit No.</label>
                        <input
                            type="text"
                            name="unit_number"
                            className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter unit number"
                        />
                    </div>
                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Permit Number</label>
                        <input
                            type="text"
                            name="permit_number"
                            className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter permit number"
                        />
                    </div>
                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Completion Status *</label>
                        <Select options={completionStatusOptions} value={selectedCompletionStatus} onChange={setSelectedCompletionStatus} placeholder="Select status" className="react-select-container" classNamePrefix="react-select" name="completion_status" />
                    </div>
                </div>
            </div>
            <div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Reference Number *</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                                className="form-input flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                placeholder="Enter reference" name="reference_number"
                            />
                            <button type="button"  className="px-3 py-2 text-xs font-medium border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors whitespace-nowrap bg-secondary text-white" onClick={generateReferenceNumber}> Generate </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Area (Square Feet) *</label>
                        <input type="number" name="area_sqft" min="0" value={areaSqft} onChange={(e) => setAreaSqft(e.target.value)} className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500" placeholder="Enter area"/>
                        {areaSqft && (
                            <p className="text-xs text-gray-500 mt-1">
                                {(Number(areaSqft) * 0.092903).toFixed(2)} Square Meters / {(Number(areaSqft) * 0.111111).toFixed(2)} Square Yards
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Bedrooms *</label>
                        <Select
                            options={bedroomsOptions}
                            value={selectedBedrooms}
                            onChange={setSelectedBedrooms}
                            placeholder="Select"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            name="bedrooms"
                        />
                    </div>

                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Bathrooms *</label>
                        <Select
                            options={bathroomsOptions}
                            value={selectedBathrooms}
                            onChange={setSelectedBathrooms}
                            placeholder="Select"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            name="bathrooms"
                        />
                    </div>

                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Occupancy Status</label>
                        <Select
                            options={occupancyStatusOptions}
                            value={selectedOccupancyStatus}
                            onChange={setSelectedOccupancyStatus}
                            placeholder="Select"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            name="occupancy_status"
                        />
                    </div>

                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Ownership Status</label>
                        <Select
                            options={ownershipStatusOptions}
                            value={selectedOwnershipStatus}
                            onChange={setSelectedOwnershipStatus}
                            placeholder="Select"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            name="ownership_status"
                        />
                    </div>
                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Title (English) *</label>
                        <input
                            type="text"
                            value={englishTitle}
                            onChange={(e) => setEnglishTitle(e.target.value)}
                            className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            placeholder="Please enter title"
                            maxLength={150}
                            dir="ltr"
                            name="title_en"
                        />
                        <div className="text-xs text-gray-500 mt-1">{englishTitle.length}/150</div>
                    </div>
                    <div className="form-group">
                        <label className="block mb-1 text-xs text-gray-600">Title (Arabic)</label>
                        <input
                            type="text"
                            value={arabicTitle}
                            onChange={(e) => setArabicTitle(e.target.value)}
                            className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            placeholder="آدخل العنوان هنا"
                            maxLength={150}
                            dir="rtl"
                            name="title_ar"
                        />
                        <div className="text-xs text-gray-500 mt-1">{arabicTitle.length}/150</div>
                    </div>

                    <div className="form-group lg:col-span-2">
                        <label className="block mb-1 text-xs  text-gray-600">Description (English) *</label>
                        <ReactQuill
                            theme="snow"
                            value={englishDescription}
                            onChange={setEnglishDescription}
                            placeholder="Description will come here"
                            modules={quillModules}
                            className="mb-10"
                        />
                        <input type="hidden" name="description_en" value={englishDescription} />
                    </div>
                    <div className="form-group lg:col-span-2">
                        <label className="block mb-1 text-xs  text-gray-600">Description (Arabic)</label>
                        <ReactQuill
                            theme="snow"
                            value={arabicDescription}
                            onChange={setArabicDescription}
                            placeholder="الوصف سيأتي هنا"
                            modules={quillModules}
                            className="mb-10"
                        />
                        <input type="hidden" name="description_ar" value={arabicDescription} />
                    </div>
                </div>
            </div>
            <div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="form-group">
                        <label className="block mb-1 text-xs text-gray-600">Rent (AED) *</label>
                        <input
                            type="text"
                            name="rentPrice"
                            value={price}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter price"
                        />
                        {price && (
                        <p className="text-xs text-gray-500 mt-1">
                            {formatPriceShort(price)}
                        </p>
                    )}
                        
                    </div>

                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Rent Frequency *</label>
                        <Select
                            options={rentFrequencyOptions}
                            value={selectedRentFrequency}
                            onChange={setSelectedRentFrequency}
                            placeholder="Select"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            name="rent_frequency"
                        />
                    </div>

                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Min. Contract Period</label>
                        <input
                            type="number"
                            name="min_contractperiod"
                            className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            placeholder="Months"

                        />
                    </div>

                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Notice Period</label>
                        <input
                            type="number"
                            name="notice_period"
                            className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            placeholder="Months"
                        />
                    </div>

                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Maintenance Fee</label>
                        <input
                            type="number"
                            name="maintenance_fee"
                            className="form-input w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            placeholder="AED"
                        />
                    </div>

                    <div className="form-group">
                        <label className="block mb-1 text-xs  text-gray-600">Paid By</label>
                        <Select
                            options={maintenanceFeePayerOptions}
                            value={selectedMaintenanceFeePayer}
                            onChange={setSelectedMaintenanceFeePayer}
                            placeholder="Select"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            name='paid_by'
                        />
                    </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="form-group lg:col-span-3">
                        <label className="block mb-1 text-xs text-gray-600">Listing Owner</label>
                        <Select
                            options={users}
                            value={selectedAgent}
                            onChange={handleAgentChange}
                            placeholder="Select agent"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isSearchable
                            name="agent_id"
                        />
                    </div>
                    {selectedAgentData && (
                        <div className="lg:col-span-3">
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                <div className="text-sm text-blue-900 font-medium mb-2">
                                    Owner Information
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                    <div><span className="text-gray-600">Name:</span> <span className="font-medium">{(selectedAgentData as any)?.client_user_name || 'N/A'}</span></div>
                                    <div><span className="text-gray-600">Email:</span> <span className="font-medium">{(selectedAgentData as any)?.email || 'N/A'}</span></div>
                                    <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{(selectedAgentData as any)?.phone || 'N/A'}</span></div>
                                    <div><span className="text-gray-600">Mobile:</span> <span className="font-medium">{(selectedAgentData as any)?.mobile || 'N/A'}</span></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div> 
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <div>
                <h5 className="text-base font-semibold mb-2 text-gray-700">Choose Amenities</h5>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {amenitiesList.map((amenity) => (
                    <div
                        key={amenity.id}
                        onClick={() => handleAmenityToggle(amenity.id)}
                        className={`p-3 rounded-md border cursor-pointer transition-all text-center ${
                            selectedAmenities.includes(amenity.id)
                                ? 'border-green-600 bg-green-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    >
                        <div className={`w-7 h-7 mx-auto mb-1.5 rounded-full flex items-center justify-center ${
                            selectedAmenities.includes(amenity.id)
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-400'
                        }`}>
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
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-5">
            <div>
                <h5 className="text-base font-semibold mb-2 text-gray-700">Property Images</h5>
                <p className="text-sm text-gray-500 mb-3">Upload property images (max 20)</p>
                <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 text-center hover:border-green-500 transition-colors bg-gray-50">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                    />
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
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-md border border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
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
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => e.target.files && setUploadedFloorPlan(e.target.files[0])}
                            className="hidden"
                            id="floorplan-upload"
                        />
                        <label htmlFor="floorplan-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">
                                    {uploadedFloorPlan ? uploadedFloorPlan.name : 'Upload floor plan'}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">PDF, PNG, JPG</span>
                            </div>
                        </label>
                    </div>
                </div>
                <div>
                    <h5 className="text-base font-semibold mb-2 text-gray-700">Video Tour</h5>
                    <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 text-center hover:border-green-500 transition-colors bg-gray-50">
                        <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => e.target.files && setUploadedVideo(e.target.files[0])}
                            className="hidden"
                            id="video-upload"
                        />
                        <label htmlFor="video-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">
                                    {uploadedVideo ? uploadedVideo.name : 'Upload video'}
                                </span>
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
                        <label className="block mb-1 text-xs  text-gray-600">Virtual Tour URL</label>
                        <input
                            type="url"
                            name="virtualTourUrl"
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
        <form ref={(el) => (combinedRef.current.userformRef = el)} onSubmit={handleSubmit}>
            <div className="panel bg-white rounded-lg shadow-sm">
                {renderStepIndicator()}
                <div className="min-h-[450px] py-4">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                </div>
                <div className="border-t pt-4 mt-5">
                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={`px-3 py-2 text-sm font-medium border rounded-md transition-colors flex items-center gap-1.5 ${
                                currentStep === 1
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </button>
                        {currentStep < 3 ? (
                            <button type="button" onClick={nextStep}
                                className="px-3 py-2 text-sm font-medium bg-secondary text-white border border-secondary-600 rounded-md hover:bg-secondary-700 transition-colors flex items-center gap-1.5">
                                Next
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="px-6 py-2 text-sm font-medium bg-green-600 text-white border border-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center gap-1.5"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Submit Listing
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
};

export default CreateListing;