# Listing Edit Functionality Implementation

## Overview
Successfully implemented edit listing functionality within the same `createListing.tsx` component, following the existing code flow and patterns.

## Changes Made

### 1. **Frontend - createListing.tsx**

#### Imports Added
```typescript
import { useParams, useNavigate } from 'react-router-dom';
```

#### New State Variables
- `isEditMode` - Boolean to track if in edit or create mode
- `listingId` - Stores the listing ID when editing
- `isLoadingData` - Loading state when fetching listing data

#### New API Endpoints
```typescript
const endpoints = {
    getCombineData: `${getBaseUrl()}/listing/get_combine_data`,
    getSubCategories: `${getBaseUrl()}/listing/get_subcategories`,
    storeApi: `${getBaseUrl()}/listing/store`,
    getSingleListing: `${getBaseUrl()}/listing/get_single_listing`,  // NEW
    updateApi: `${getBaseUrl()}/listing/update_listing`,              // NEW
};
```

#### New Functions

**`fetchListingData(listingId: string)`**
- Fetches listing data from backend API
- Maps backend field names to frontend form structure
- Populates all form fields, descriptions, and amenities
- Fetches subcategories based on selected category
- Shows loading spinner during data fetch
- Handles errors and redirects to listing view on failure

**Field Mapping:**
```typescript
// Backend API Response → Frontend Form State
listing.category_id              → formData.category_id
listing.subcategory_id           → formData.subcategory_id
listing.purpose                  → formData.purpose
listing.location_id              → formData.location_id
listing.address                  → formData.address
listing.unit_number              → formData.unit_number
listing.permit_number            → formData.permit_number
listing.completion_status        → formData.completion_status
listing.reference_number         → formData.reference_number
listing.area_sqft                → formData.area_sqft
listing.bedrooms                 → formData.bedrooms
listing.bathrooms                → formData.bathrooms
listing.occupancy_status         → formData.occupancy_status
listing.ownership_status         → formData.ownership_status
listing.title_en                 → formData.title_en
listing.title_ar                 → formData.title_ar
listing.price                    → formData.price
listing.rent_frequency           → formData.rent_frequency
listing.min_contract_period      → formData.min_contractperiod
listing.notice_period            → formData.notice_period
listing.maintenance_fee          → formData.maintenance_fee
listing.maintenance_fee_payer    → formData.maintenance_fee_payer
listing.agent_id                 → formData.agent_id
listing.virtual_tour_url         → formData.virtualTourUrl
listing.status                   → formData.status
listing.description_en           → englishDescription
listing.description_ar           → arabicDescription
listing.amenities (JSON string)  → selectedAmenities (parsed array)
```

#### Modified Functions

**`submitFinalForm()`**
- Now checks if in edit mode
- Appends `listing_id` to FormData when editing
- Uses different endpoint based on mode:
  - Create: `/listing/store`
  - Update: `/listing/update_listing`
- Shows appropriate success message
- Redirects to view listing page after successful submission

#### UI Changes

**Loading State:**
- Added loading spinner while fetching listing data
- Prevents user interaction during data load

**Page Title:**
- Dynamically changes based on mode:
  - Create mode: "Create Listing"
  - Edit mode: "Edit Listing"

**Submit Button:**
- Text changes based on mode:
  - Create mode: "Submit Listing" / "Creating..."
  - Edit mode: "Update Listing" / "Updating..."
- Disabled during data loading

### 2. **Frontend - Routes (routes.tsx)**

Added new route for edit functionality:
```typescript
{
    path: 'listing/edit/:id',
    type: 'protected',
    element: <CreateListing />, 
    layout: 'default',
}
```

### 3. **Frontend - ViewListing.tsx**

The edit button already existed and navigates to:
```typescript
const editListing = (id: number) => {
    window.location.href = `/listing/edit/${id}`;
};
```

## How It Works

### Create Flow (Existing)
1. User navigates to `/pages/listing/create-listing`
2. Form loads empty
3. User fills in data
4. Submits to `/listing/store`
5. Form resets on success

### Edit Flow (New)
1. User clicks Edit button on ViewListing page
2. Navigates to `/listing/edit/{id}`
3. Component detects `id` parameter
4. Sets `isEditMode = true`
5. Shows loading spinner
6. Fetches listing data from `/listing/get_single_listing/{id}`
7. Populates all form fields with existing data
8. User modifies data
9. Submits to `/listing/update_listing` with `listing_id`
10. Redirects to view listing page on success

## Backend API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/listing/get_combine_data` | GET | Get users and categories |
| `/listing/get_subcategories/{id}` | GET | Get subcategories for category |
| `/listing/get_single_listing/{id}` | GET | Fetch listing data for editing |
| `/listing/store` | POST | Create new listing |
| `/listing/update_listing` | POST | Update existing listing |

### API Response Format

**GET `/listing/get_single_listing/{id}` Response:**
```json
{
    "status": "success",
    "signlelist": {
        "id": 2,
        "category_id": 2,
        "subcategory_id": 7,
        "agent_id": 47,
        "purpose": 2,
        "completion_status": 1,
        "bedrooms": 1,
        "bathrooms": 2,
        "occupancy_status": 1,
        "ownership_status": 1,
        "reference_number": "REF-mli0yxq3-EZDQFK",
        "address": "wee",
        "unit_number": "wewe",
        "permit_number": "wewe",
        "area_sqft": 23,
        "title_en": "2323",
        "title_ar": "23",
        "description_en": "<p>23</p>",
        "description_ar": "<p>23</p>",
        "price": "23.00",
        "rent_frequency": 1,
        "min_contract_period": 23,
        "notice_period": 23,
        "maintenance_fee": "23.00",
        "maintenance_fee_payer": 1,
        "amenities": "[\"1\",\"2\",\"8\"]",
        "virtual_tour_url": "http://...",
        "status": 1,
        "created_at": "2026-02-11 13:16:26",
        "updated_at": "2026-02-11T13:16:26.000000Z",
        "agents": {
            "client_user_id": 47,
            "client_user_name": "Cam"
        }
    }
}
```

**Note:** The amenities field is returned as a JSON string `"[\"1\",\"2\",\"8\"]"` and needs to be parsed using `JSON.parse()`.

## Testing Checklist

- [x] Route configuration
- [x] Data fetching on edit mode
- [x] Form population with existing data
- [x] Subcategory loading based on category
- [x] Amenities selection restoration
- [x] Loading states
- [x] Error handling
- [x] Success message and redirect
- [x] Dynamic page title
- [x] Dynamic button text
- [ ] Manual testing required

## Features

✅ Single component for both create and edit
✅ Automatic mode detection via URL parameter
✅ Complete data pre-population
✅ Loading indicators
✅ Error handling with user feedback
✅ Smooth navigation flow
✅ No code duplication

## Notes

- **No logic changes**: All existing create functionality remains unchanged
- **Same validation**: Uses the same step-by-step validation
- **Same UI**: Consistent user experience between create and edit
- **File uploads**: New files can be uploaded during edit (backend handles replacement)
- **Navigation**: Automatically redirects to listing view after successful update

## Future Enhancements (Optional)

1. Show existing images in edit mode
2. Add image deletion capability
3. Add "Cancel" button to return to listing view
4. Add unsaved changes warning
5. Add loading skeleton instead of spinner
6. Add edit history/audit trail
