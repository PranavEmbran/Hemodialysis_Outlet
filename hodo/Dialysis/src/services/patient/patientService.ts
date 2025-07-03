import type { Patient } from '../../types';

export interface PatientService {
  getAllPatients(): Promise<Patient[]>;
  getPatientById(id: string | number): Promise<Patient>;
  addPatient(patientData: Omit<Patient, 'id'>): Promise<Patient>;
  updatePatient(id: string | number, patientData: Partial<Patient>): Promise<Patient>;
  deletePatient(id: string | number): Promise<boolean>;
  softDeletePatient(id: string | number): Promise<boolean>;
  restorePatient(id: string | number): Promise<boolean>;
} 