import * as Yup from 'yup';
import type { Patient, ScheduleEntry } from '../../types';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: any;
  colSize?: number;
}

export interface FormConfig {
  fields: FormField[];
  validationSchema: Yup.ObjectSchema<any>;
  initialValues: (data: any) => Record<string, any>;
  title: string;
}

export const patientFormConfig: FormConfig = {
  title: 'Edit Patient',
  fields: [
    { name: 'firstName', label: 'First Name', type: 'text', required: true, colSize: 6 },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true, colSize: 6 },
    { name: 'gender', label: 'Gender', type: 'select', required: true, colSize: 6, options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Other', label: 'Other' }
    ] },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, colSize: 6 },
    { name: 'mobileNo', label: 'Mobile Number', type: 'tel', placeholder: '10 digit mobile number', required: true, colSize: 6 },
    { name: 'bloodGroup', label: 'Blood Group', type: 'select', required: true, colSize: 6, options: [
      { value: 'A+', label: 'A+' },
      { value: 'A-', label: 'A-' },
      { value: 'B+', label: 'B+' },
      { value: 'B-', label: 'B-' },
      { value: 'AB+', label: 'AB+' },
      { value: 'AB-', label: 'AB-' },
      { value: 'O+', label: 'O+' },
      { value: 'O-', label: 'O-' }
    ] },
    { name: 'catheterInsertionDate', label: 'Catheter Insertion Date', type: 'date', required: true, colSize: 6 },
    { name: 'fistulaCreationDate', label: 'Fistula Creation Date', type: 'date', required: true, colSize: 6 },
  ],
  validationSchema: Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    gender: Yup.string().required('Gender is required'),
    dateOfBirth: Yup.date().required('Date of birth is required'),
    mobileNo: Yup.string().matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits').required('Mobile number is required'),
    bloodGroup: Yup.string().required('Blood group is required'),
    catheterInsertionDate: Yup.date().required('Catheter insertion date is required'),
    fistulaCreationDate: Yup.date().required('Fistula creation date is required'),
  }),
  initialValues: (data: Patient) => ({
    firstName: data.firstName || data.name || '',
    lastName: data.lastName || '',
    gender: data.gender || '',
    dateOfBirth: data.dateOfBirth || '',
    mobileNo: data.mobileNo || data.phone || '',
    bloodGroup: data.bloodGroup || '',
    catheterInsertionDate: data.catheterInsertionDate || data.catheterDate || '',
    fistulaCreationDate: data.fistulaCreationDate || data.fistulaDate || '',
  })
};

export const appointmentFormConfig: FormConfig = {
  title: 'Edit Appointment',
  fields: [
    { name: 'patientName', label: 'Patient Name', type: 'text', required: true, colSize: 6 },
    { name: 'date', label: 'Date', type: 'date', required: true, colSize: 6 },
    { name: 'time', label: 'Time', type: 'text', placeholder: 'HH:MM', required: true, colSize: 6 },
    { name: 'dialysisUnit', label: 'Dialysis Unit', type: 'text', required: true, colSize: 6 },
    { name: 'admittingDoctor', label: 'Admitting Doctor', type: 'text', required: true, colSize: 6 },
    { name: 'status', label: 'Status', type: 'select', required: true, colSize: 6, options: [
      { value: 'Scheduled', label: 'Scheduled' },
      { value: 'Completed', label: 'Completed' },
      { value: 'Cancelled', label: 'Cancelled' },
      { value: 'No Show', label: 'No Show' }
    ] },
    { name: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Additional notes or remarks', colSize: 12 },
  ],
  validationSchema: Yup.object({
    patientName: Yup.string().required('Patient name is required'),
    date: Yup.date().required('Date is required'),
    time: Yup.string().required('Time is required'),
    dialysisUnit: Yup.string().required('Dialysis unit is required'),
    admittingDoctor: Yup.string().required('Admitting doctor is required'),
    status: Yup.string().required('Status is required'),
    remarks: Yup.string(),
  }),
  initialValues: (data: ScheduleEntry) => ({
    patientName: data.patientName || '',
    date: data.date || '',
    time: data.time || '',
    dialysisUnit: data.dialysisUnit || '',
    admittingDoctor: data.admittingDoctor || '',
    status: data.status || 'Scheduled',
    remarks: data.remarks || '',
  })
}; 