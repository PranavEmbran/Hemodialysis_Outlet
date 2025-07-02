EditModal Component Usage Guide
EditModal is a reusable React modal for editing data rows via a configurable form. It uses Formik for form state and validation, and supports dynamic fields, loading states, and custom labels.

Usage Example:
import EditModal from './components/EditModal';

Props:
show: boolean
Whether the modal is visible.
onHide: () => void
Function to close the modal.
data: any
Data object to prefill the form.
formConfig: FormConfig
Form configuration (fields, validation, etc.).
onSubmit: (values: any) => Promise
Called with form values on submit.
onCancel: () => void (optional)
Called when cancel is clicked.
loading: boolean (optional)
Shows loading state on submit.
modalSize: 'sm' | 'lg' | 'xl' (optional)
Modal size (default: 'lg').
title: string (optional)
Modal title.
submitLabel: string (optional)
Text for submit button (default: 'Save').
cancelLabel: string (optional)
Text for cancel button (default: 'Cancel').

Requirements:
formConfig should define:
fields: Array of field configs (type, name, label, etc.)
initialValues(data): Function returning initial form values
validationSchema: Yup schema for validation

CENTRALIZED STATE MANAGEMENT:
The app uses DialysisContext for centralized state management to ensure data consistency across all tables.

When a patient is updated:
1. The patient data is updated in the backend via API
2. The patients state is optimistically updated
3. All related appointments and history records are updated with the new patient name
4. The UI re-renders with consistent data across all sections

Key Features:
- Optimistic updates for immediate UI feedback
- Automatic propagation of patient changes to related records
- Error handling with automatic data refresh on failure
- Type-safe state management with proper TypeScript interfaces

Context Usage:
import { useDialysis } from '../context/DialysisContext';

const { 
  patients, 
  appointments, 
  history, 
  updatePatient, 
  updateAppointment,
  refreshAllData 
} = useDialysis();