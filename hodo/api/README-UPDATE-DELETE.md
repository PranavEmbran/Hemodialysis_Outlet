# HDflow Records - Update and Soft Delete Functionality

## Overview
This document describes the update and soft delete functionality implemented for the HDflow Records page tables.

## Database Configuration

### Environment Variables
The system uses the `USE_MSSQL` environment variable to switch between database backends:

- `USE_MSSQL=true` - Uses MSSQL database
- `USE_MSSQL=false` - Uses JSON database (db.json)

### Required Database Columns (MSSQL)
Before using the update/delete functionality with MSSQL, ensure these columns exist:

```sql
-- Status columns (10 = active, 0 = soft deleted)
ALTER TABLE PreDialysis_Records ADD PreDR_Status INT DEFAULT 10;
ALTER TABLE Start_Dialysis_Records ADD SDR_Status INT DEFAULT 10;
ALTER TABLE PostDialysis_Records ADD PostDR_Status INT DEFAULT 10;

-- Modified timestamp columns
ALTER TABLE PreDialysis_Records ADD PreDR_Modified_On DATETIME DEFAULT GETDATE();
ALTER TABLE Start_Dialysis_Records ADD SDR_Modified_On DATETIME DEFAULT GETDATE();
ALTER TABLE PostDialysis_Records ADD PostDR_Modified_On DATETIME DEFAULT GETDATE();
```

Run the provided SQL script: `sql-scripts/add-status-columns.sql`

## API Endpoints

### Update Records
All update operations use PUT method:

#### Predialysis Records
```
PUT /data/predialysis_record
Content-Type: application/json

{
  "PreDR_ID_PK": "123",
  "PreDR_Vitals_BP": 120,
  "PreDR_Vitals_HeartRate": 80,
  "PreDR_Vitals_Temperature": 98.6,
  "PreDR_Vitals_Weight": 70,
  "PreDR_Notes": "Updated notes"
}
```

#### Start Dialysis Records
```
PUT /data/start_dialysis_record
Content-Type: application/json

{
  "SDR_ID_PK": "456",
  "SDR_Dialysis_Unit": "Unit A",
  "SDR_Start_Time": "2024-01-15T10:30:00",
  "SDR_Vascular_Access": "AV Fistula",
  "SDR_Dialyzer_Type": "High Flux",
  "SDR_Notes": "Updated notes"
}
```

#### Post Dialysis Records
```
PUT /data/post_dialysis_record
Content-Type: application/json

{
  "PostDR_ID_PK": "789",
  "PostDR_Vitals_BP": 110,
  "PostDR_Vitals_HeartRate": 75,
  "PostDR_Vitals_Temperature": 98.4,
  "PostDR_Vitals_Weight": 68,
  "PostDR_Notes": "Updated notes"
}
```

### Soft Delete Records
Soft delete is performed by sending the `deleted: true` flag:

```
PUT /data/predialysis_record
Content-Type: application/json

{
  "PreDR_ID_PK": "123",
  "deleted": true
}
```

## Frontend Implementation

### HDflow_Records Component
The component includes:

1. **Edit Button**: Opens modal with pre-filled form data
2. **Delete Button**: Confirms and performs soft delete
3. **Edit Modal**: Form for updating record fields
4. **Data Refresh**: Automatically refreshes data after operations

### Key Functions

#### handleEdit(row)
- Maps row data to form format
- Opens edit modal with current values

#### handleDelete(row)
- Shows confirmation dialog
- Sends soft delete request
- Refreshes data on success

#### handleEditSubmit(values)
- Cleans form data (removes read-only fields)
- Sends update request
- Refreshes data on success

## Service Layer Architecture

### dataFactory.ts
Acts as a service switcher based on `USE_MSSQL` environment variable:
- Imports appropriate service (mssqlService or lowdbService)
- Exports unified interface

### mssqlService.ts
Implements MSSQL operations:
- Dynamic SQL generation for updates
- Transaction support
- Soft delete via status field updates

### lowdbService.ts
Implements JSON database operations:
- In-memory array manipulation
- File-based persistence
- Status field filtering

## Error Handling

### API Level
- Transaction rollback on MSSQL errors
- Proper HTTP status codes
- Detailed error messages

### Frontend Level
- Toast notifications for success/error
- Loading states during operations
- Confirmation dialogs for destructive actions

## Testing

### Manual Testing
1. Set `USE_MSSQL=false` in .env
2. Start API server
3. Test update/delete operations in HDflow Records page
4. Switch to `USE_MSSQL=true` and test with MSSQL

### API Testing
Use the provided test script:
```bash
node test-update.js
```

## Security Considerations

1. **Input Validation**: All inputs are validated and sanitized
2. **SQL Injection Prevention**: Parameterized queries used
3. **Soft Delete**: Records are never permanently deleted
4. **Transaction Safety**: MSSQL operations use transactions

## Performance Notes

1. **Filtering**: Soft-deleted records are filtered at query level
2. **Indexing**: Consider adding indexes on status columns
3. **Caching**: Frontend refreshes data after operations (could be optimized)

## Troubleshooting

### Common Issues

1. **Missing Status Columns**: Run the SQL script to add required columns
2. **Environment Variable**: Ensure USE_MSSQL is set correctly
3. **Database Connection**: Check MSSQL connection parameters
4. **Permissions**: Ensure database user has UPDATE permissions

### Debug Steps

1. Check browser console for frontend errors
2. Check API server logs for backend errors
3. Verify database schema matches requirements
4. Test API endpoints directly with tools like Postman