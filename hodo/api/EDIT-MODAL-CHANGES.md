# Start Dialysis Edit Modal - Implementation Summary

## Changes Made

### 1. Form Configuration Updates (`formConfigs.ts`)
- ✅ Updated `startDialysisFormConfig` to include all required fields
- ✅ Added `date` and `time` fields as disabled read-only fields
- ✅ Configured dropdown fields with empty options array (populated dynamically)
- ✅ Proper validation schema for all fields

### 2. EditModal Component Updates (`EditModal.tsx`)
- ✅ Added `TextareaField` import and usage for textarea fields
- ✅ Added support for `number` field type
- ✅ Proper handling of disabled fields
- ✅ Correct field rendering based on field type

### 3. HDflow_Records Component Updates (`HDflow_Records.tsx`)
- ✅ Form options loading from API endpoints:
  - `/data/units_management` → Dialysis Unit options
  - `/data/vascular_access_lookup` → Vascular Access options  
  - `/data/dialyzer_type_lookup` → Dialyzer Type options
- ✅ `getFormConfigForStep()` function populates dropdown options dynamically
- ✅ `mapRowToFormData()` function properly formats Start Dialysis record data
- ✅ Proper time formatting for `SDR_Start_Time` field
- ✅ Edit and delete functionality working with proper API calls

### 4. API Layer Updates
- ✅ MSSQL service: `updateStartDialysisRecord()` function
- ✅ LowDB service: `updateStartDialysisRecord()` function  
- ✅ Data factory: Export update functions
- ✅ Controller: Use service functions for updates
- ✅ Soft delete functionality with status field updates

## Form Fields in Edit Modal

### Read-Only Fields (Disabled)
- **Schedule ID** (`SA_ID_PK_FK`) - Shows the schedule ID
- **Patient ID** (`patientId`) - Shows the patient ID
- **Patient Name** (`patientName`) - Shows the patient name
- **Date** (`date`) - Shows the scheduled date
- **Time** (`time`) - Shows the scheduled time

### Editable Fields
- **Dialysis Unit** (`SDR_Dialysis_Unit`) - Dropdown with unit options
- **Start Time** (`SDR_Start_Time`) - Text input for actual start time (HH:MM format)
- **Vascular Access** (`SDR_Vascular_Access`) - Dropdown with access type options
- **Dialyzer Type** (`SDR_Dialyzer_Type`) - Dropdown with dialyzer options
- **Notes** (`SDR_Notes`) - Textarea for additional notes

## Data Flow

### 1. Loading Dropdown Options
```
HDflow_Records useEffect → API calls → formOptions state → getFormConfigForStep → EditModal
```

### 2. Opening Edit Modal
```
Edit button click → handleEdit → mapRowToFormData → setEditRow → EditModal opens
```

### 3. Submitting Changes
```
EditModal form submit → handleEditSubmit → API PUT call → Success toast → Data refresh
```

### 4. Soft Delete
```
Delete button click → Confirmation → handleDelete → API PUT with deleted:true → Data refresh
```

## API Endpoints

### Lookup Data
- `GET /data/units_management` - Dialysis units
- `GET /data/vascular_access_lookup` - Vascular access types
- `GET /data/dialyzer_type_lookup` - Dialyzer types

### Record Operations  
- `PUT /data/start_dialysis_record` - Update/soft delete records
- `GET /data/start_dialysis_records` - Fetch records (excludes soft deleted)

## Database Schema Requirements

### MSSQL Tables
```sql
-- Start_Dialysis_Records table should have:
SDR_ID_PK (Primary Key)
SDR_DS_ID_FK (Schedule Foreign Key) 
SDR_P_ID_FK (Patient Foreign Key)
SDR_Dialysis_Unit (VARCHAR)
SDR_Start_Time (DATETIME)
SDR_Vascular_Access (VARCHAR)
SDR_Dialyzer_Type (VARCHAR)
SDR_Notes (TEXT)
SDR_Status (INT) -- 10=active, 0=soft deleted
SDR_Modified_On (DATETIME)
```

### JSON Database
Similar structure stored in `db.json` file with status field for soft delete.

## Testing

Use the provided test guide in `test-edit-modal.md` to verify:
- ✅ Dropdown options load correctly
- ✅ Edit modal opens with proper data
- ✅ Form validation works
- ✅ Update functionality works
- ✅ Soft delete functionality works
- ✅ Data refreshes after operations

## Environment Configuration

The system automatically switches between MSSQL and JSON database based on:
```
USE_MSSQL=true  → Uses MSSQL database
USE_MSSQL=false → Uses JSON database (db.json)
```

Currently configured to use JSON database (`USE_MSSQL=false`).