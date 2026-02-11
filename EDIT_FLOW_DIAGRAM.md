# Edit Listing Flow Diagram

## User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                      View Listing Page                          │
│                  /pages/listing/view-listing                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Click Edit Button (IconEdit)
                                │ editListing(record.actions.id)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Navigate to Edit Route                        │
│                     /listing/edit/{id}                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Route matches
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CreateListing Component                      │
│                   (Same as Create Page)                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ useParams() detects 'id'
                                ▼
                    ┌───────────────────────┐
                    │   isEditMode = true   │
                    │   listingId = {id}    │
                    └───────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Fetch Combined Data (Users, Categories)        │
│                  GET /listing/get_combine_data                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Fetch Listing Data                             │
│            GET /listing/get_single_listing/{id}                 │
│                                                                 │
│  Response: { status: 'success', signlelist: {...} }           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Populate Form Fields                            │
│  ┌───────────────────────────────────────────────────────┐     │
│  │ • Map backend fields to frontend state                │     │
│  │ • Set formData (category, price, bedrooms, etc.)      │     │
│  │ • Set descriptions (English & Arabic)                 │     │
│  │ • Set selected amenities                              │     │
│  │ • Fetch subcategories for selected category           │     │
│  └───────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Display Form (3 Steps)                       │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  Step 1: Details (pre-filled)                         │     │
│  │  Step 2: Amenities (pre-selected)                     │     │
│  │  Step 3: Uploads (new files can be added)             │     │
│  └───────────────────────────────────────────────────────┘     │
│                                                                 │
│  Button Text: "Update Listing" (instead of "Submit")           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ User modifies data
                                │ and clicks "Update Listing"
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Submit Form Data                             │
│              POST /listing/update_listing                       │
│                                                                 │
│  FormData includes:                                             │
│  • listing_id: {id}                                            │
│  • All form fields                                              │
│  • Descriptions                                                 │
│  • Amenities[]                                                  │
│  • New files (if any)                                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Success Response    │
                    └───────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Show Success Toast Message                         │
│          "Listing updated successfully"                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ After 1.5 seconds
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Navigate Back to View Page                     │
│                  /pages/listing/view-listing                    │
└─────────────────────────────────────────────────────────────────┘
```

## Code Flow

### 1. Route Detection
```typescript
const { id } = useParams<{ id: string }>();

useEffect(() => {
    if (id) {
        setIsEditMode(true);
        setListingId(id);
        dispatch(setPageTitle('Edit Listing'));
    } else {
        dispatch(setPageTitle('Create Listing'));
    }
}, [dispatch, id]);
```

### 2. Data Fetching (Edit Mode Only)
```typescript
useEffect(() => {
    if (isEditMode && listingId && users.length > 0 && categories.length > 0) {
        fetchListingData(listingId);
    }
}, [isEditMode, listingId, users, categories]);
```

### 3. Form Submission
```typescript
const submitFinalForm = async () => {
    const finalFormData = new FormData();
    
    // Add listing_id for edit mode
    if (isEditMode && listingId) {
        finalFormData.append('listing_id', listingId);
    }
    
    // ... append all other fields
    
    // Use different endpoint
    const endpoint = isEditMode ? endpoints.updateApi : endpoints.storeApi;
    const response = await apiClient.post(endpoint, finalFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    // Success handling
    if (response.data.status) {
        toast.success(
            isEditMode ? 'Listing updated successfully' : 'Listing created successfully'
        );
        
        // Redirect to view page
        setTimeout(() => {
            navigate('/pages/listing/view-listing');
        }, 1500);
    }
};
```

## Key Differences: Create vs Edit

| Feature | Create Mode | Edit Mode |
|---------|-------------|-----------|
| **Route** | `/pages/listing/create-listing` | `/listing/edit/{id}` |
| **Page Title** | "Create Listing" | "Edit Listing" |
| **Initial State** | Empty form | Pre-populated form |
| **Data Loading** | None | Fetches from API |
| **API Endpoint** | `/listing/store` | `/listing/update_listing` |
| **FormData** | Only new data | Includes `listing_id` |
| **Button Text** | "Submit Listing" | "Update Listing" |
| **On Success** | Form reset | Redirect to view page |
| **Loading Indicator** | No | Yes (during data fetch) |

## Component State Management

```typescript
// Edit-specific states
const [isEditMode, setIsEditMode] = useState(false);
const [listingId, setListingId] = useState<string | null>(null);
const [isLoadingData, setIsLoadingData] = useState(false);

// Shared states (used in both modes)
const [formData, setFormData] = useState({...});
const [englishDescription, setEnglishDescription] = useState('');
const [arabicDescription, setArabicDescription] = useState('');
const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
const [uploadedImages, setUploadedImages] = useState<File[]>([]);
```

## Error Handling

```typescript
// In fetchListingData
try {
    const response = await apiClient.get(`${endpoints.getSingleListing}/${listingId}`);
    
    if (response.data.status === 'success' && response.data.signlelist) {
        // Populate form...
        toast.success('Listing data loaded successfully');
    } else {
        toast.error('Failed to load listing data');
        navigate('/pages/listing/view-listing');
    }
} catch (error) {
    toast.error('Failed to load listing data');
    navigate('/pages/listing/view-listing');
} finally {
    setIsLoadingData(false);
}
```
