# Edit Modal Test Guide

## Testing the Start Dialysis Edit Modal

### Prerequisites
1. Ensure the API server is running
2. Ensure the frontend is running
3. Have some Start Dialysis records in the database

### Test Steps

#### 1. Navigate to HDflow Records Page
- Go to the HDflow Records page
- Select "Start Dialysis" step (step 1)

#### 2. Verify Dropdown Options Loading
- Check browser console for any errors
- Verify that the form options are loaded:
  ```javascript
  // In browser console, check if options are loaded:
  console.log('Form options loaded:', window.formOptions);
  ```

#### 3. Test Edit Functionality
- Click the "Edit" button on any Start Dialysis record
- Verify the modal opens with:
  - ✅ Schedule ID (disabled)
  - ✅ Patient ID (disabled) 
  - ✅ Patient Name (disabled)
  - ✅ Date (disabled)
  - ✅ Time (disabled)
  - ✅ Dialysis Unit (dropdown with options)
  - ✅ Start Time (text input with current value)
  - ✅ Vascular Access (dropdown with options)
  - ✅ Dialyzer Type (dropdown with options)
  - ✅ Notes (textarea with current value)

#### 4. Test Form Validation
- Try to submit with empty required fields
- Verify validation messages appear

#### 5. Test Update Functionality
- Change some values in the form
- Click "Save"
- Verify success message appears
- Verify the record is updated in the table

#### 6. Test Soft Delete
- Click the "Delete" button on any record
- Verify confirmation dialog appears
- Confirm deletion
- Verify success message appears
- Verify the record disappears from the table

### Expected Dropdown Options

#### Dialysis Unit Options
Should load from `/data/units_management` endpoint:
```json
[
  { "value": "Unit A", "label": "Unit A" },
  { "value": "Unit B", "label": "Unit B" }
]
```

#### Vascular Access Options
Should load from `/data/vascular_access_lookup` endpoint:
```json
[
  { "value": "AV Fistula", "label": "AV Fistula" },
  { "value": "AV Graft", "label": "AV Graft" },
  { "value": "Central Catheter", "label": "Central Catheter" }
]
```

#### Dialyzer Type Options
Should load from `/data/dialyzer_type_lookup` endpoint:
```json
[
  { "value": "High Flux", "label": "High Flux" },
  { "value": "Low Flux", "label": "Low Flux" }
]
```

### Troubleshooting

#### If Dropdowns Are Empty
1. Check browser console for API errors
2. Verify the lookup endpoints are working:
   - `GET /data/units_management`
   - `GET /data/vascular_access_lookup`
   - `GET /data/dialyzer_type_lookup`
3. Check if the data is being mapped correctly in the `useEffect`

#### If Edit Modal Doesn't Open
1. Check browser console for JavaScript errors
2. Verify the `handleEdit` function is being called
3. Check if `editRow` state is being set correctly

#### If Update Fails
1. Check browser console for API errors
2. Verify the PUT endpoint is working: `PUT /data/start_dialysis_record`
3. Check the request payload in Network tab

### API Endpoints Used

- `GET /data/units_management` - Load unit options
- `GET /data/vascular_access_lookup` - Load vascular access options  
- `GET /data/dialyzer_type_lookup` - Load dialyzer type options
- `PUT /data/start_dialysis_record` - Update record
- `GET /data/start_dialysis_records` - Refresh data after update

### Form Configuration

The Start Dialysis form uses `startDialysisFormConfig` from `formConfigs.ts` with the following fields:

```typescript
{
  name: 'SDR_Dialysis_Unit',
  label: 'Dialysis Unit', 
  type: 'select',
  required: true,
  options: [] // Populated dynamically
}
```

The options are populated in `getFormConfigForStep()` function based on the loaded `formOptions`.