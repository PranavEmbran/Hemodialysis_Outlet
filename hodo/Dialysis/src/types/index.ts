export interface Patient {
  id?: string;
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
  // Status?: boolean;
  Status?: number;
  deletedAt?: string;
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
  Status?: number;
  deletedAt?: string;
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
  Status?: number;
  deletedAt?: string;
}

export interface History {
  id?: string | number;
  date: string;
  patientId: string | number;
  patientName: string;
  appointmentId?: string | number; // Add appointment ID to link with appointment
  parameters?: string;
  notes?: string;
  amount?: string;
  age?: string;
  gender?: string;
  treatmentParameters?: any;
  nursingNotes?: string;
  startTime?: string;
  endTime?: string;
  vitalSigns?: {
    preDialysis?: {
      bloodPressure?: string;
      heartRate?: number;
      temperature?: number;
      weight?: number;
    };
    postDialysis?: {
      bloodPressure?: string;
      heartRate?: number;
      temperature?: number;
      weight?: number;
    };
  };
  Status?: number;
  deletedAt?: string;
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
  Status?: number;
  deletedAt?: string;
}

export interface StaffData {
  // technicians: string[];
  doctors: string[];
  units: string[];
}

export interface ScheduleEntry {
  id?: string;
  patientId?: string | number;
  patientName: string;
  date: string;
  time: string;
  dialysisUnit: string;
  // technician: string;
  admittingDoctor: string;
  status?: string;
  remarks?: string;
  // Status?: boolean;
  Status?: number;
  deletedAt?: string;
} 