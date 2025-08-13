# Dynamic Scheduling Status and Actions Implementation

## Overview
I've implemented a comprehensive dynamic status and actions system for the dialysis scheduling page that shows real-time session status based on patient activity and provides exclusive Cancel/Reassign actions.

## Status Codes Mapping

### Backend Status Computation
The system dynamically computes status based on related records:

```sql
CASE 
  WHEN ds.DS_Status = 0 THEN 'Cancelled'
  WHEN pdr.PreDR_ID_PK IS NOT NULL AND sdr.SDR_ID_PK IS NOT NULL AND podr.PostDR_ID_PK IS NOT NULL THEN 'Completed'
  WHEN pdr.PreDR_ID_PK IS NOT NULL AND sdr.SDR_ID_PK IS NOT NULL THEN 'Initiated'
  WHEN pdr.PreDR_ID_PK IS NOT NULL THEN 'Arrived'
  WHEN ds.DS_Date < CAST(GETDATE() AS DATE) AND ds.DS_Status = 10 THEN 'Missed'
  ELSE 'Scheduled'
END as computed_status
```

### Status Definitions
- **Scheduled** → DS_Status = 10 (default/reassigned)
- **Cancelled** → DS_Status = 0
- **Arrived** → Predialysis record exists
- **Initiated** → Start dialysis record exists
- **Completed** → Post dialysis record exists
- **Missed** → Past date, no activity, not cancelled

## Backend Implementation

### New API Endpoints

#### 1. Update Schedule Status
```
PUT /api/data/dialysis_schedules/{scheduleId}/status
Body: { "status": 0 | 10 }
```
- Updates DS_Status (0 = Cancelled, 10 = Scheduled)
- Returns updated schedule record

#### 2. Check Schedule Conflicts
```
GET /api/data/dialysis_schedules/check-conflict?date=YYYY-MM-DD&time=HH:MM
```
- Checks if time slot is already booked
- Returns `{ "hasConflict": boolean }`

#### 3. Get Schedules with Related Records
```
GET /api/data/dialysis_schedules/with-records
GET /api/data/dialysis_schedules/{scheduleId}/with-records
```
- Returns schedules with computed status
- Includes related record flags (has_predialysis, has_start_dialysis, has_post_dialysis)

### Service Layer Functions

**Files Modified:**
- `hodo/api/services/mssqlService.ts` - Added schedule status functions
- `hodo/api/services/lowdbService.ts` - Added schedule status functions
- `hodo/api/services/dataFactory.ts` - Added exports
- `hodo/api/controllers/dataController.ts` - Added controller functions
- `hodo/api/routes/dataRoutes.ts` - Added routes

### Key Functions
- `updateDialysisScheduleStatus()` - Updates schedule status
- `checkScheduleConflict()` - Checks for time slot conflicts
- `getScheduleWithRelatedRecords()` - Gets schedules with computed status

## Frontend Implementation

### New Components

#### 1. CancelButton Component
**File**: `hodo/Dialysis/src/components/CancelButton.tsx`
- Red button for cancelling sessions
- Confirmation dialog before action
- Disabled state for past/completed sessions
- Tooltip support

#### 2. ReassignButton Component
**File**: `hodo/Dialysis/src/components/ReassignButton.tsx`
- Green button for reassigning sessions
- Confirmation dialog before action
- Only shown for cancelled future sessions
- Tooltip support

### Updated Scheduling Component

#### Dynamic Status Display
Each session now shows a colored status badge:
- **Scheduled** - Gray
- **Arrived** - Blue
- **Initiated** - Orange
- **Completed** - Green
- **Cancelled** - Red
- **Missed** - Purple

#### Exclusive Actions Logic
```typescript
if (isFutureDate && !isCompleted && !isCancelled) {
  // Show Cancel button
} else if (isFutureDate && isCancelled) {
  // Show Reassign button
}
// Otherwise, show no action
```

#### Action Handlers
- `handleCancelSession()` - Sets DS_Status = 0
- `handleReassignSession()` - Sets DS_Status = 10 with conflict checking

### Enhanced Table Structure
The second step table now includes:
- **Status Column** - Dynamic colored badges
- **Actions Column** - Exclusive Cancel/Reassign buttons
- Real-time updates after actions
- Proper error handling with toast notifications

## Business Rules Implementation

### Cancel Action Rules
- ✅ Only available for future dates
- ✅ Not available for completed sessions
- ✅ Not available for already cancelled sessions
- ✅ Confirmation dialog required
- ✅ Updates DS_Status to 0

### Reassign Action Rules
- ✅ Only available for future dates
- ✅ Only available for cancelled sessions
- ✅ Checks for time slot conflicts
- ✅ Shows error popup if conflict exists
- ✅ Updates DS_Status to 10

### Edge Cases Handled
- ✅ Past sessions cannot be cancelled/reassigned
- ✅ Completed sessions cannot be modified
- ✅ Conflict checking prevents double-booking
- ✅ Real-time status updates
- ✅ Proper error messages and user feedback

## User Experience Features

### Visual Indicators
- Color-coded status badges for quick identification
- Disabled button states with tooltips
- Loading states during API calls
- Success/error toast notifications

### Confirmation Dialogs
- Cancel: "Are you sure you want to cancel this session? This action cannot be undone."
- Reassign: "Are you sure you want to reassign this session? This will make it available for scheduling again."

### Error Handling
- Network errors with retry suggestions
- Conflict errors with clear explanations
- Validation errors with specific messages
- Graceful fallbacks for missing data

## Testing

### API Testing
Run the test script to verify endpoints:
```bash
node test-schedule-status-api.js
```

### Frontend Testing
1. Navigate to Scheduling page
2. Switch to "View Assigned Schedules" tab
3. Verify status colors and action buttons
4. Test cancel/reassign functionality
5. Verify real-time updates

## Database Requirements

The system works with existing tables:
- `Dialysis_Schedules` - Main schedule table
- `PreDialysis_Records` - Arrival tracking
- `Start_Dialysis_Records` - Initiation tracking
- `Post_Dialysis_Records` - Completion tracking

No additional tables required - uses existing foreign key relationships.

## Performance Considerations

- Single API call loads all schedules with computed status
- Efficient SQL joins minimize database queries
- Client-side filtering for date ranges
- Optimistic UI updates with error rollback

## Security Features

- Status validation (only 0 or 10 allowed)
- Schedule ID validation
- Conflict checking prevents unauthorized changes
- Proper error handling prevents information leakage

The implementation is complete and provides a robust, user-friendly system for managing dialysis session status and actions with real-time updates and comprehensive error handling.