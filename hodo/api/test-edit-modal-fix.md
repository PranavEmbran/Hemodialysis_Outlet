# Edit Modal Fix - Testing Guide

## Issues Fixed

### 1. Dropdown Options Not Showing
**Problem**: The frontend was calling wrong API endpoints
- ❌ Was calling: `/data/units_management`, `/data/vascular_access_lookup`, `/data/dialyzer_type_lookup`
- ✅ Fixed to call: `/data/units`, `/data/vascular_access`, `/data/dialyzer_types`

**Solution**: Updated API endpoint URLs in HDflow_Records.tsx

### 2. Missing Sample Data
**Problem**: The db.json file didn't have lookup data for units, vascular access, and dialyzer types
**Solution**: Added sample data to db.json:

```json
{
  "units": [
    {"Unit_ID_PK": 1, "Unit_Name": "Unit A", "Unit_Status": 10},
    {"Unit_ID_PK": 2, "Unit_Name": "Unit B", "Unit_Status": 10},
    {"Unit_ID_PK": 3, "Unit_Name": "Unit C", "Unit_Status": 10}
  ],
  "vascular_access": [
    {"VAL_ID_PK": 1, "VAL_Access_Type": "AV Fistula", "VAL_Status": 10},
    {"VAL_ID_PK": 2, "VAL_Access_Type": "AV Graft", "VAL_Status": 10},
    {"VAL_ID_PK": 3, "VAL_Access_Type": "Central Catheter", "VAL_Status": 10},
    {"VAL_ID_PK": 4, "VAL_Access_Type": "Temporary Catheter", "VAL_Status": 10}
  ],
  "dialyzer_types": [
    {"DTL_ID_PK": 1, "DTL_Dialyzer_Name": "High Flux", "DTL_Status": 10},
    {"DTL_ID_PK": 2, "DTL_Dialyzer_Name": "Low Flux", "DTL_Status": 10},
    {"DTL_ID_PK": 3, "DTL_Dialyzer_Name": "High Efficiency", "DTL_Status": 10}
  ]
}
```

### 3. Start Time Field Issues
**Problem**: Start Time field was using text input instead of time picker
**Solution**: 
- Added 'time' type to FormField interface
- Updated startDialysisFormConfig to use type: 'time' for SDR_Start_Time
- Added TimeField support to EditModal component
- Imported TimeField component

### 4. Field Mapping Issues
**Problem**: Field names didn't match between MSSQL and JSON database
**Solution**: Updated field mapping to handle both formats:
```typescript
units: units.map((u: any) => ({ 
  value: u.Unit_Name || u.name, 
  label: u.Unit_Name || u.name 
}))
```

## Testing Steps

### 1. Start the API Server
```bash
cd hodo/api
npm start
```

### 2. Start the Frontend
```bash
cd hodo/Dialysis
npm start
```

### 3. Test Lookup Endpoints
Open browser console and test:
```javascript
// Test units endpoint
fetch('http://localhost:5000/data/units').then(r => r.json()).then(console.log)

// Test vascular access endpoint  
fetch('http://localhost:5000/data/vascular_access').then(r => r.json()).then(console.log)

// Test dialyzer types endpoint
fetch('http://localhost:5000/data/dialyzer_types').then(r => r.json()).then(console.log)
```

### 4. Test Edit Modal
1. Navigate to HDflow Records page
2. Select "Start Dialysis" step (step 1)
3. Click "Edit" button on any Start Dialysis record
4. Verify the modal shows:
   - ✅ Dialysis Unit dropdown with options (Unit A, Unit B, Unit C)
   - ✅ Vascular Access dropdown with options (AV Fistula, AV Graft, etc.)
   - ✅ Dialyzer Type dropdown with options (High Flux, Low Flux, etc.)
   - ✅ Start Time field with time picker
   - ✅ All read-only fields populated correctly

### 5. Test Form Functionality
1. Change values in the dropdowns
2. Change the start time
3. Add notes
4. Click "Save"
5. Verify success message appears
6. Verify record is updated in the table

## Expected Results

### Dropdown Options Should Show:
- **Dialysis Unit**: Unit A, Unit B, Unit C
- **Vascular Access**: AV Fistula, AV Graft, Central Catheter, Temporary Catheter  
- **Dialyzer Type**: High Flux, Low Flux, High Efficiency

### Time Field Should:
- Show current time value from record
- Allow time selection with time picker
- Format time properly (HH:MM)

### Form Should:
- Load current values correctly
- Validate required fields
- Submit updates successfully
- Show success/error messages
- Refresh data after update

## Troubleshooting

### If Dropdowns Are Still Empty:
1. Check browser console for API errors
2. Verify API server is running on port 5000
3. Check if USE_MSSQL=false in .env file
4. Verify db.json has the lookup data

### If Time Field Doesn't Work:
1. Check if TimeField component is imported correctly
2. Verify form config uses type: 'time'
3. Check browser console for component errors

### If Update Fails:
1. Check browser Network tab for API errors
2. Verify PUT endpoints are working
3. Check API server logs for errors

## Files Modified

1. **hodo/Dialysis/src/pages/HDflow_Records.tsx**
   - Fixed API endpoint URLs
   - Updated field mapping
   - Removed debug console.log statements

2. **hodo/Dialysis/src/components/EditModal.tsx**
   - Added TimeField import and support
   - Added 'time' case in renderField function

3. **hodo/Dialysis/src/components/forms/formConfigs.ts**
   - Added 'time' type to FormField interface
   - Updated SDR_Start_Time field to use type: 'time'

4. **hodo/api/db/db.json**
   - Added sample lookup data for units, vascular_access, dialyzer_types

## Environment Configuration

Currently using JSON database:
```
USE_MSSQL=false
```

To switch to MSSQL:
```
USE_MSSQL=true
```

Make sure to run the SQL script to add required columns if using MSSQL.