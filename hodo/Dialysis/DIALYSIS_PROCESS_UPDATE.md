# Dialysis Process - Appointment Status Update

## Overview
When a dialysis process is submitted through the DialysisProcess page, the system now automatically updates the corresponding appointment status to "Completed" in the Schedule/Appointments tables.

## Implementation Details

### Changes Made

1. **Modified DialysisProcess.tsx**:
   - Added `scheduleServiceFactory` import
   - Added `appointments` and `updateAppointment` from `useDialysis` hook
   - Added `appointmentUpdated` state to track whether an appointment was found and updated
   - Enhanced `handleSubmit` function to:
     - Find corresponding appointment for the patient and current date
     - Update appointment status to "Completed" if found
     - Show appropriate success messages

### Logic Flow

1. **Dialysis Process Submission**:
   - User fills out dialysis process form
   - Form is submitted with patient ID, vital signs, treatment parameters, etc.
   - History record is created in the database

2. **Appointment Status Update**:
   - System searches for appointments matching:
     - Patient ID matches the selected patient
     - Date matches current date
     - Status is not already "Completed"
     - Appointment is not soft-deleted (isDeleted !== 0)
   
3. **Status Update**:
   - If matching appointment is found, status is updated to "Completed"
   - If no matching appointment is found, dialysis process still completes successfully
   - Success message indicates whether appointment was updated or not

### Success Messages

- **Appointment Found and Updated**: "Dialysis session recorded successfully! Appointment status updated to Completed."
- **No Appointment Found**: "Dialysis session recorded successfully! No corresponding appointment found for today."

### Error Handling

- If appointment update fails, the dialysis process still completes successfully
- Error is logged to console but doesn't prevent the main operation
- User is informed through appropriate success/error messages

## Technical Implementation

### Key Functions

```typescript
// Find corresponding appointment
const correspondingAppointment = appointments.find(apt => 
  apt.patientId === values.patientId && 
  apt.date === currentDate &&
  apt.status !== 'Completed' &&
  apt.isDeleted !== 0
);

// Update appointment status
await updateAppointment(correspondingAppointment.id.toString(), {
  status: 'Completed'
});
```

### Dependencies

- `useDialysis` hook for accessing appointments and update functions
- `scheduleServiceFactory` for schedule service operations
- Existing appointment update functionality in DialysisContext

## Testing

To test this functionality:

1. Create an appointment for a patient for today's date
2. Go to DialysisProcess page
3. Select the same patient
4. Fill out the dialysis process form
5. Submit the form
6. Check that the appointment status is updated to "Completed" in the Schedule page

## Benefits

- **Automatic Status Management**: No manual intervention required to update appointment status
- **Data Consistency**: Ensures dialysis sessions and appointments stay synchronized
- **User Experience**: Clear feedback about what happened during the process
- **Error Resilience**: Main functionality continues even if appointment update fails 