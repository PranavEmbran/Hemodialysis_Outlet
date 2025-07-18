import * as Yup from 'yup';
import type { Patient, ScheduleEntry, Billing, History } from '../../types';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'number';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: any;
  colSize?: number;
  disabled?: boolean;
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
    // admittingDoctor: Yup.string().required('Admitting doctor is required'),
    status: Yup.string().required('Status is required'),
    remarks: Yup.string(),
  }),
  initialValues: (data: ScheduleEntry) => ({
    patientName: data.patientName || '',
    date: data.date || '',
    time: data.time || '',
    dialysisUnit: data.dialysisUnit || '',
    // admittingDoctor: data.admittingDoctor || '',
    status: data.status || 'Scheduled',
    remarks: data.remarks || '',
  })
};

export const billingFormConfig: FormConfig = {
  title: 'Edit Bill',
  fields: [
    { name: 'patientName', label: 'Patient Name', type: 'text', required: true, colSize: 6 },
    { name: 'sessionDate', label: 'Session Date', type: 'date', required: true, colSize: 6 },
    { name: 'sessionDuration', label: 'Session Duration (hours)', type: 'number', required: true, colSize: 6 },
    { name: 'totalAmount', label: 'Total Amount', type: 'number', required: true, colSize: 6 },
    { name: 'status', label: 'Status', type: 'select', required: true, colSize: 6, options: [
      { value: 'PAID', label: 'Paid' },
      { value: 'PENDING', label: 'Pending' },
      { value: 'CANCELLED', label: 'Cancelled' }
    ] },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Session description or notes', colSize: 12 },
  ],
  validationSchema: Yup.object({
    patientName: Yup.string().required('Patient name is required'),
    sessionDate: Yup.date().required('Session date is required'),
    sessionDuration: Yup.number().min(0, 'Duration must be positive').required('Session duration is required'),
    totalAmount: Yup.number().min(0, 'Amount must be positive').required('Total amount is required'),
    status: Yup.string().required('Status is required'),
    description: Yup.string(),
  }),
  initialValues: (data: Billing) => ({
    patientName: data.patientName || '',
    sessionDate: data.sessionDate || data.date || '',
    sessionDuration: data.sessionDuration || 0,
    totalAmount: data.totalAmount || data.amount || 0,
    status: data.status || 'PENDING',
    description: data.description || '',
  })
};

export const historyFormConfig: FormConfig = {
  title: 'Edit History Record',
  fields: [
    { name: 'patientName', label: 'Patient Name', type: 'text', required: true, colSize: 6 },
    { name: 'date', label: 'Date', type: 'date', required: true, colSize: 6 },
    // { name: 'parameters', label: 'Parameters', type: 'textarea', placeholder: 'BP, Weight, etc.', required: true, colSize: 6 },
    // { name: 'amount', label: 'Amount', type: 'text', placeholder: 'Session cost', colSize: 6 },
    // { name: 'age', label: 'Age', type: 'text', colSize: 6 },
    // { name: 'gender', label: 'Gender', type: 'select', colSize: 6, options: [
    //   { value: 'Male', label: 'Male' },
    //   { value: 'Female', label: 'Female' },
    //   { value: 'Other', label: 'Other' }
    // ] },
    { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Session notes', colSize: 12 },
    { name: 'nursingNotes', label: 'Nursing Notes', type: 'textarea', placeholder: 'Nursing observations', colSize: 12 },
  ],
  validationSchema: Yup.object({
    patientName: Yup.string().required('Patient name is required'),
    date: Yup.date().required('Date is required'),
    // parameters: Yup.string().required('Parameters are required'),
    // amount: Yup.string(),
    // age: Yup.string(),
    // gender: Yup.string(),
    notes: Yup.string(),
    nursingNotes: Yup.string(),
  }),
  initialValues: (data: History) => ({
    patientName: data.patientName || '',
    date: data.date || '',
    // parameters: data.parameters || '',
    // amount: data.amount || '',
    // age: data.age || '',
    // gender: data.gender || '',
    notes: data.notes || '',
    nursingNotes: data.nursingNotes || '',
  })
};

export const unitFormConfig: FormConfig = {
  title: 'Edit Unit',
  fields: [
    { name: 'Unit_Name', label: 'Unit Name', type: 'text', required: true, colSize: 12 },
    { name: 'Unit_Status', label: 'Unit Status', type: 'select', required: true, colSize: 12, options: [
      { value: 'Free', label: 'Free' },
      { value: 'Engaged', label: 'Engaged' },
      { value: 'Out_of_service', label: 'Out of Service' },
    ] },
    { name: 'Unit_Planned_Maintainance_DT', label: 'Planned Maintainance', type: 'text', required: true, colSize: 12, placeholder: 'YYYY-MM-DDTHH:mm' },
    { name: 'Unit_Technitian_Assigned', label: 'Technitian Assigned', type: 'text', required: true, colSize: 12 },
  ],
  validationSchema: Yup.object({
    Unit_Name: Yup.string().required('Unit Name is required'),
    Unit_Status: Yup.string().required('Unit Status is required'),
    Unit_Planned_Maintainance_DT: Yup.string().required('Planned Maintainance is required'),
    Unit_Technitian_Assigned: Yup.string().required('Technitian Assigned is required'),
  }),
  initialValues: (data: any) => ({
    Unit_Name: data?.Unit_Name || '',
    Unit_Status: data?.Unit_Status || '',
    Unit_Planned_Maintainance_DT: data?.Unit_Planned_Maintainance_DT || '',
    Unit_Technitian_Assigned: data?.Unit_Technitian_Assigned || '',
  }),
};

export const predialysisFormConfig: FormConfig = {
  title: 'Edit Predialysis Record',
  fields: [
    { name: 'date', label: 'Date', type: 'date', required: true, colSize: 6 },
    { name: 'time', label: 'Time', type: 'text', required: true, colSize: 6 },
    { name: 'SA_ID_FK_PK', label: 'Schedule ID', type: 'text', required: true, colSize: 6, disabled: true },
    { name: 'patientName', label: 'Patient Name', type: 'text', required: false, colSize: 6, disabled: true },
    { name: 'PreDR_Vitals_BP', label: 'BP', type: 'text', required: false, colSize: 6 },
    { name: 'PreDR_Vitals_HeartRate', label: 'Heart Rate', type: 'text', required: false, colSize: 6 },
    { name: 'PreDR_Vitals_Temperature', label: 'Temperature', type: 'text', required: false, colSize: 6 },
    { name: 'PreDR_Vitals_Weight', label: 'Weight', type: 'text', required: false, colSize: 6 },
    { name: 'PreDR_Notes', label: 'Notes', type: 'textarea', required: false, colSize: 12 },
  ],
  validationSchema: Yup.object({
    date: Yup.string().required('Date is required'),
    time: Yup.string().required('Time is required'),
    SA_ID_FK_PK: Yup.string().required('Schedule ID is required'),
    patientName: Yup.string(),
    PreDR_Vitals_BP: Yup.string(),
    PreDR_Vitals_HeartRate: Yup.string(),
    PreDR_Vitals_Temperature: Yup.string(),
    PreDR_Vitals_Weight: Yup.string(),
    PreDR_Notes: Yup.string(),
  }),
  initialValues: (data: any) => ({
    date: data.date || '',
    time: data.time || '',
    SA_ID_FK_PK: data.SA_ID_FK_PK || '',
    patientName: data.patientName || '',
    PreDR_Vitals_BP: data.PreDR_Vitals_BP || '',
    PreDR_Vitals_HeartRate: data.PreDR_Vitals_HeartRate || '',
    PreDR_Vitals_Temperature: data.PreDR_Vitals_Temperature || '',
    PreDR_Vitals_Weight: data.PreDR_Vitals_Weight || '',
    PreDR_Notes: data.PreDR_Notes || '',
  })
};

export const startDialysisFormConfig: FormConfig = {
  title: 'Edit Start Dialysis Record',
  fields: [
    { name: 'date', label: 'Date', type: 'date', required: true, colSize: 6 },
    { name: 'time', label: 'Time', type: 'text', required: true, colSize: 6 },
    { name: 'SA_ID_FK_PK', label: 'Schedule ID', type: 'text', required: true, colSize: 6, disabled: true },
    { name: 'name', label: 'Name', type: 'text', required: true, colSize: 6, disabled: true },
    { name: 'Dialysis_Unit', label: 'Unit', type: 'text', required: false, colSize: 6 },
    { name: 'SDR_Start_time', label: 'Start Time', type: 'text', required: false, colSize: 6 },
    { name: 'SDR_Vascular_access', label: 'Vascular Access', type: 'text', required: false, colSize: 6 },
    { name: 'Dialyzer_Type', label: 'Dialyzer Type', type: 'text', required: false, colSize: 6 },
    { name: 'SDR_Notes', label: 'Notes', type: 'textarea', required: false, colSize: 12 },
  ],
  validationSchema: Yup.object({
    date: Yup.string().required('Date is required'),
    time: Yup.string().required('Time is required'),
    SA_ID_FK_PK: Yup.string().required('Schedule ID is required'),
    name: Yup.string().required('Name is required'),
    Dialysis_Unit: Yup.string(),
    SDR_Start_time: Yup.string(),
    SDR_Vascular_access: Yup.string(),
    Dialyzer_Type: Yup.string(),
    SDR_Notes: Yup.string(),
  }),
  initialValues: (data: any) => ({
    date: data.date || '',
    time: data.time || '',
    SA_ID_FK_PK: data.SA_ID_FK_PK || '',
    name: data.name || '',
    Dialysis_Unit: data.Dialysis_Unit || '',
    SDR_Start_time: data.SDR_Start_time || '',
    SDR_Vascular_access: data.SDR_Vascular_access || '',
    Dialyzer_Type: data.Dialyzer_Type || '',
    SDR_Notes: data.SDR_Notes || '',
  })
};

export const postDialysisFormConfig: FormConfig = {
  title: 'Edit Post Dialysis Record',
  fields: [
    { name: 'date', label: 'Date', type: 'date', required: true, colSize: 6 },
    { name: 'time', label: 'Time', type: 'text', required: true, colSize: 6 },
    { name: 'SA_ID_FK', label: 'Schedule ID', type: 'text', required: true, colSize: 6, disabled: true },
    { name: 'patientName', label: 'Patient Name', type: 'text', required: false, colSize: 6, disabled: true },
    { name: 'PreDR_Vitals_BP', label: 'BP', type: 'text', required: false, colSize: 6 },
    { name: 'PreDR_Vitals_HeartRate', label: 'Heart Rate', type: 'text', required: false, colSize: 6 },
    { name: 'PreDR_Vitals_Temperature', label: 'Temperature', type: 'text', required: false, colSize: 6 },
    { name: 'PreDR_Vitals_Weight', label: 'Weight', type: 'text', required: false, colSize: 6 },
    { name: 'PostDR_Notes', label: 'Notes', type: 'textarea', required: false, colSize: 12 },
  ],
  validationSchema: Yup.object({
    date: Yup.string().required('Date is required'),
    time: Yup.string().required('Time is required'),
    SA_ID_FK: Yup.string().required('Schedule ID is required'),
    patientName: Yup.string(),
    PreDR_Vitals_BP: Yup.string(),
    PreDR_Vitals_HeartRate: Yup.string(),
    PreDR_Vitals_Temperature: Yup.string(),
    PreDR_Vitals_Weight: Yup.string(),
    PostDR_Notes: Yup.string(),
  }),
  initialValues: (data: any) => ({
    date: data.date || '',
    time: data.time || '',
    SA_ID_FK: data.SA_ID_FK || '',
    patientName: data.patientName || '',
    PreDR_Vitals_BP: data.PreDR_Vitals_BP || '',
    PreDR_Vitals_HeartRate: data.PreDR_Vitals_HeartRate || '',
    PreDR_Vitals_Temperature: data.PreDR_Vitals_Temperature || '',
    PreDR_Vitals_Weight: data.PreDR_Vitals_Weight || '',
    PostDR_Notes: data.PostDR_Notes || '',
  })
}; 