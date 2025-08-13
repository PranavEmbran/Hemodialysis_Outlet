# Status Display and Reassign Button Fixes

## Issues Identified
1. **Status colors not changing** - Only grey is displayed
2. **Reassign button not showing** - After cancelling, reassign button doesn't appear
3. **Status text not showing properly** - Need to show appropriate text

## Fixes Applied

### 1. Backend Debugging
- Added console logging to both MSSQL and LowDB services to debug query execution
- Added logging to see what data is being returned from the API

### 2. Frontend Debugging
- Added extensive console logging to see what data is received
- Added debugging for action logic to understand button display conditions

### 3. Status Display Improvements
- Added fallback logic for status display using DS_Status when computed_status is not available
- Improved color coding logic with fallback colors
- Added proper text display with fallbacks

### 4. Action Button Logic Fixes
- Fixed the condition for showing reassign button to include DS_Status fallback
- Added proper refresh logic with small delays to ensure database updates are reflected
- Improved error handling and user feedback

### 5. Test Component
- Created `ScheduleStatusTest` component for debugging API responses
- Shows raw data from API to help identify issues
- Provides direct test buttons for cancel/reassign operations

## Code Changes Made

### Backend (mssqlService.ts)
```typescript
// Added console logging to debug query execution
console.log('Executing query:', query);
console.log('Query result sample:', result.recordset.slice(0, 2));
```

### Backend (lowdbService.ts)
```typescript
// Added debugging for status computation
console.log('LowDB - Computed status for schedule', ds.DS_ID_PK, ':', computed_status, 'DS_Status:', ds.DS_Status);
```

### Frontend (Scheduling.tsx)
```typescript
// Added fallback for status display
backgroundColor: 
  row.computed_status === 'Completed' ? '#4caf50' :
  row.computed_status === 'Cancelled' ? '#f44336' :
  row.computed_status === 'Initiated' ? '#ff9800' :
  row.computed_status === 'Arrived' ? '#2196f3' :
  row.computed_status === 'Missed' ? '#9c27b0' :
  row.DS_Status === 0 ? '#f44336' : // Fallback for cancelled
  '#757575' // Scheduled or default

// Added fallback for status text
{row.computed_status || (row.DS_Status === 0 ? 'Cancelled' : 'Scheduled')}

// Fixed action button logic
const isCancelled = row.computed_status === 'Cancelled' || row.DS_Status === 0;

// Added refresh delays
setTimeout(async () => {
  // Refresh logic with proper error handling
}, 500);
```

## Testing Steps

1. **Check API Response**:
   - Open browser console
   - Navigate to Scheduling page, step 2
   - Look for console logs showing API response data

2. **Test Status Display**:
   - Verify that different statuses show different colors
   - Check that status text is displayed correctly

3. **Test Cancel/Reassign**:
   - Cancel a future session
   - Verify it shows as "Cancelled" with red color
   - Verify reassign button appears for cancelled sessions
   - Test reassign functionality

4. **Use Test Component**:
   - The test component shows raw API data
   - Use the test buttons to directly test cancel/reassign
   - Compare with main table behavior

## Expected Behavior After Fixes

### Status Colors
- **Scheduled**: Grey (#757575)
- **Arrived**: Blue (#2196f3)
- **Initiated**: Orange (#ff9800)
- **Completed**: Green (#4caf50)
- **Cancelled**: Red (#f44336)
- **Missed**: Purple (#9c27b0)

### Action Buttons
- **Cancel Button**: Shows for future, non-completed, non-cancelled sessions
- **Reassign Button**: Shows for future, cancelled sessions
- **No Button**: Shows for past sessions or completed sessions

### Real-time Updates
- Status changes immediately after cancel/reassign actions
- Colors update to reflect new status
- Appropriate action button appears/disappears

## Troubleshooting

If issues persist:

1. **Check API Endpoint**: Verify `/data/dialysis_schedules/with-records` returns computed_status
2. **Check Database**: Ensure Dialysis_Schedules table has proper DS_Status values
3. **Check Console**: Look for error messages or unexpected data structures
4. **Test with Test Component**: Use the debugging component to isolate issues

The fixes provide multiple fallback mechanisms to ensure the status display works even if the computed_status field is not properly calculated by the backend.