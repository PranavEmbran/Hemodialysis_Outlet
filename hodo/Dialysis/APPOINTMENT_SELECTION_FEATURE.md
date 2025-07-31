# Appointment Selection Feature - DialysisProcess Page

## Overview
The DialysisProcess page now includes a new appointment selection dropdown that allows users to select appointments by ID. When an appointment is selected, the corresponding patient is automatically filled in the patient dropdown, and the appointment ID is stored in the history record.

## New Features

### 1. Appointment Selection Dropdown
- **Location**: Added next to the existing "Select Patient" dropdown
- **Format**: `<appointment_id> - <patient_name>`
- **Filtering**: Only shows appointments that are not completed and not soft-deleted
- **Optional**: Users can still manually select patients without choosing an appointment

### 2. Auto-Fill Functionality
- When an appointment is selected, the corresponding patient is automatically selected in the "Select Patient" dropdown
- This ensures data consistency and reduces manual input errors

### 3. Enhanced Data Storage
- The selected appointment ID is stored in the history record in the database
- This creates a direct link between dialysis sessions and their corresponding appointments

## Implementation Details

### Updated Interfaces

#### History Interface (types/index.ts)
```typescript
export interface History {
  // ... existing fields
  appointmentId?: string | number; // New field to link with appointment
  // ... rest of fields
}
```

#### DialysisProcessFormValues Interface
```typescript
interface DialysisProcessFormValues {
  patientId: string;
  appointmentId: string; // New field
  startTime: string;
  endTime: string;
  // ... rest of fields
}
```

### Key Functions

#### getAvailableAppointments()
```typescript
const getAvailableAppointments = () => {
  return appointments.filter(apt => 
    apt.status !== 'Completed' && 
    apt.Status !== 0
  );
};
```
- Filters appointments to show only available ones (not completed, not deleted)
- Used to populate the appointment dropdown options

#### handleAppointmentChange()
```typescript
const handleAppointmentChange = (appointmentId: string, setFieldValue: (field: string, value: any) => void) => {
  if (appointmentId) {
    const selectedAppointment = appointments.find(apt => apt.id?.toString() === appointmentId);
    if (selectedAppointment) {
      setFieldValue('patientId', selectedAppointment.patientId?.toString() || '');
    }
  }
};
```
- Handles the auto-fill functionality when an appointment is selected
- Automatically sets the patient ID based on the selected appointment

### Form Structure

The form now includes:
1. **Appointment Selection Dropdown** (Optional)
   - Shows available appointments in format: `ID - Patient Name`
   - Auto-fills patient when selected

2. **Patient Selection Dropdown** (Required)
   - Can be manually selected or auto-filled from appointment selection
   - Required field for form submission

3. **Time Fields** (Required)
   - Start Time and End Time fields

### Enhanced Submit Logic

The `handleSubmit` function now:
1. **Stores Appointment ID**: Includes the selected appointment ID in the history record
2. **Updates Appointment Status**: If an appointment was selected, directly updates its status to "Completed"
3. **Fallback Logic**: If no appointment was selected, falls back to the existing logic of finding appointments by patient and date

```typescript
// Store appointment ID in history
const newHistory = {
  // ... other fields
  appointmentId: values.appointmentId || undefined,
  // ... rest of fields
};

// Update appointment status if selected
if (values.appointmentId) {
  await updateAppointment(values.appointmentId, {
    status: 'Completed'
  });
} else {
  // Fallback to existing logic
  // ... existing appointment finding logic
}
```

## User Experience

### Workflow Options

#### Option 1: Appointment-First Workflow
1. User selects an appointment from the dropdown
2. Patient is automatically filled
3. User fills in dialysis session details
4. On submit, appointment status is updated to "Completed"

#### Option 2: Patient-First Workflow
1. User manually selects a patient
2. User fills in dialysis session details
3. On submit, system finds corresponding appointment by patient and date
4. If found, appointment status is updated to "Completed"

### Benefits

1. **Improved Data Integrity**: Direct link between appointments and dialysis sessions
2. **Reduced Manual Work**: Auto-fill functionality reduces data entry errors
3. **Flexible Workflow**: Supports both appointment-first and patient-first workflows
4. **Better Tracking**: Appointment IDs stored in history for better audit trails
5. **Enhanced UX**: Clear appointment selection with patient names for easy identification

## Database Schema

### History Records
History records now include an optional `appointmentId` field:
```json
{
  "id": "history_123",
  "patientId": "patient_456",
  "patientName": "John Doe",
  "appointmentId": "appointment_789", // New field
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "13:00",
  // ... other fields
}
```

### Appointments
Appointments remain unchanged but are now linked to history records:
```json
{
  "id": "appointment_789",
  "patientId": "patient_456",
  "patientName": "John Doe",
  "status": "Completed", // Updated when dialysis session is recorded
  "date": "2024-01-15",
  // ... other fields
}
```

## Testing

### Test Scenarios

1. **Appointment Selection Test**:
   - Select an appointment from the dropdown
   - Verify patient is auto-filled
   - Submit form and check appointment status is updated to "Completed"

2. **Manual Patient Selection Test**:
   - Manually select a patient without choosing an appointment
   - Submit form and verify fallback logic works

3. **Data Storage Test**:
   - Check that appointment ID is stored in history record
   - Verify the link between appointment and dialysis session

4. **Filtering Test**:
   - Verify only available appointments (not completed, not deleted) appear in dropdown

## Future Enhancements

1. **Appointment Details Display**: Show appointment details (date, time, unit) when selected
2. **Validation**: Ensure selected appointment date matches current date
3. **Batch Processing**: Support for multiple appointments in one session
4. **Audit Trail**: Enhanced logging of appointment-dialysis session relationships 