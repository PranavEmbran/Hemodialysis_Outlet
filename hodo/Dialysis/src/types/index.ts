export interface Patient {
  id?: string | number;
  name: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: string;
  bloodGroup: string;
  phone?: string;
  mobileNo?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  registrationDate?: string;
  catheterDate: string;
  fistulaDate: string;
  catheterInsertionDate?: string;
  fistulaCreationDate?: string;
  dateOfBirth?: string;
}

export interface Appointment {
  id?: number;
  patientId: number;
  patientName: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes?: string;
}

export interface Billing {
  id?: string | number;
  patientId: string | number;
  patientName: string;
  date: string;
  amount: number;
  description?: string;
  status: string;
  sessionDate?: string;
  sessionDuration?: number;
  totalAmount?: number;
}

export interface History {
  id?: string | number;
  date: string;
  patientId: string | number;
  patientName: string;
  parameters?: string;
  notes?: string;
  amount?: string;
  age?: string;
  gender?: string;
  treatmentParameters?: any;
  nursingNotes?: string;
}

export interface HistoryRecord {
  id?: string | number;
  date: string;
  patientId: string | number;
  patientName: string;
  parameters?: string;
  notes?: string;
  amount?: string;
  age?: string;
  gender?: string;
  treatmentParameters?: any;
  nursingNotes?: string;
  treatmentType?: string;
  duration?: string;
  status?: string;
}

export interface StaffData {
  technicians: string[];
  doctors: string[];
  units: string[];
}

export interface ScheduleEntry {
  id?: string | number;
  patientId?: string | number;
  patientName: string;
  date: string;
  time: string;
  dialysisUnit: string;
  technician: string;
  admittingDoctor: string;
  status?: string;
  remarks?: string;
} 