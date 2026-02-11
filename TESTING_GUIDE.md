# Testing Guide - Edit Listing Feature

## Quick Test Steps

### 1. Test Edit Mode Access
1. Navigate to View Listing page: `/pages/listing/view-listing`
2. Find any listing in the table
3. Click the **Edit button** (pencil icon)
4. Should redirect to: `/listing/edit/{id}`

**Expected Results:**
- ✅ Page title shows "Edit Listing"
- ✅ Loading spinner appears briefly
- ✅ Form fields populate with existing data
- ✅ All 3 steps show in the stepper (Details, Amenities, Uploads)

### 2. Test Data Population

**Step 1 - Details:**
- ✅ Category dropdown shows selected category
- ✅ Subcategory dropdown shows selected subcategory
- ✅ Purpose shows correct value (For Rent/For Sale)
- ✅ All text fields (address, unit number, permit number, etc.) are filled
- ✅ Reference number is populated
- ✅ Numeric fields (area, bedrooms, bathrooms) show values
- ✅ Price and rent frequency are populated
- ✅ English and Arabic descriptions show in rich text editors
- ✅ Agent dropdown shows selected agent
- ✅ Status dropdown shows current status

**Step 2 - Amenities:**
- ✅ Previously selected amenities are highlighted/checked
- ✅ Amenity count shows correct number
- ✅ Can add/remove amenities

**Step 3 - Uploads:**
- ✅ Can upload new images
- ✅ Can upload new floor plan
- ✅ Can upload new video
- ✅ Virtual tour URL is populated

### 3. Test Form Validation

**Navigate through steps:**
1. Click "Next" on Step 1
   - Should validate and move to Step 2
2. Click "Next" on Step 2
   - Should validate and move to Step 3
3. Click "Previous"
   - Should go back without validation

**Expected Results:**
- ✅ Validation works same as create mode
- ✅ Error messages appear for invalid fields
- ✅ Can navigate back and forth

### 4. Test Update Submission

1. Make some changes to the listing:
   - Change title
   - Modify price
   - Add/remove amenities
   - Update description
2. Navigate to Step 3
3. Click "Update Listing" button

**Expected Results:**
- ✅ Button text shows "Updating..." during submission
- ✅ Success toast message appears: "Listing updated successfully"
- ✅ Redirects to `/pages/listing/view-listing` after 1.5 seconds
- ✅ Updated data appears in the listing table

### 5. Test Error Handling

**Test 1: Invalid Listing ID**
1. Navigate to: `/listing/edit/99999` (non-existent ID)

**Expected Results:**
- ✅ Error toast appears: "Failed to load listing data"
- ✅ Redirects to view listing page

**Test 2: Network Error**
1. Turn off backend server
2. Try to edit a listing

**Expected Results:**
- ✅ Error toast appears
- ✅ Graceful handling without crash

### 6. Test Create Mode Still Works

1. Navigate to: `/pages/listing/create-listing`

**Expected Results:**
- ✅ Page title shows "Create Listing"
- ✅ Form is empty
- ✅ Submit button says "Submit Listing"
- ✅ Form resets after successful submission (doesn't redirect)

## Browser Console Checks

### Check for Errors
```javascript
// Open browser console (F12)
// Look for:
// - No console errors
// - No React warnings
// - Network requests succeed (200 status)
```

### Network Requests to Monitor

**On Edit Page Load:**
1. `GET /listing/get_combine_data` - Should return users and categories
2. `GET /listing/get_single_listing/{id}` - Should return listing data
3. `GET /listing/get_subcategories/{categoryId}` - Should return subcategories

**On Form Submission:**
1. `POST /listing/update_listing` - Should return success response

## Common Issues & Solutions

### Issue 1: Form Not Populating
**Symptoms:** Edit page loads but fields are empty

**Check:**
- Browser console for API errors
- Network tab - did `/listing/get_single_listing/{id}` return 200?
- Response data structure matches expected format

**Solution:**
- Verify listing ID exists in database
- Check API endpoint is accessible
- Verify field mapping matches backend response

### Issue 2: Amenities Not Showing
**Symptoms:** Amenities count shows 0 even though listing has amenities

**Check:**
- Console for "Error parsing amenities" message
- Backend returns amenities as JSON string: `"[\"1\",\"2\",\"8\"]"`

**Solution:**
- Verify amenities field format in API response
- Check JSON.parse() is working correctly

### Issue 3: Subcategories Not Loading
**Symptoms:** Subcategory dropdown is empty

**Check:**
- Network request to `/listing/get_subcategories/{categoryId}`
- Category ID is correctly extracted from listing data

**Solution:**
- Verify category_id field in API response
- Check subcategories exist for the category

### Issue 4: Update Not Saving
**Symptoms:** Success message shows but data doesn't update

**Check:**
- Network request to `/listing/update_listing`
- FormData includes `listing_id`
- Backend receives and processes the ID correctly

**Solution:**
- Verify `listing_id` is appended to FormData
- Check backend controller handles update logic

## Test Data Examples

### Sample Edit URL
```
http://localhost:5173/listing/edit/2
```

### Sample Form Values to Test
```
Title (EN): "Updated Luxury Apartment in Dubai Marina"
Price: 150000
Bedrooms: 3
Bathrooms: 2
Amenities: Swimming Pool, Gym, Parking
```

## API Testing with Postman/Curl

### Get Single Listing
```bash
GET http://your-api-url/api/listing/get_single_listing/2
Authorization: Bearer {token}
```

### Update Listing
```bash
POST http://your-api-url/api/listing/update_listing
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- listing_id: 2
- title_en: Updated Title
- price: 150000
- ... (other fields)
```

## Success Criteria

✅ All test steps pass
✅ No console errors
✅ Data loads correctly
✅ Form submits successfully
✅ Updates reflect in database
✅ User experience is smooth
✅ Error handling works
✅ Create mode still works

## Regression Testing

After confirming edit works, verify these existing features:
- ✅ Create new listing still works
- ✅ View listing table still displays correctly
- ✅ Delete listing still works
- ✅ Status change still works
- ✅ Filters still work
- ✅ Search still works
