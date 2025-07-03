import { patientsApi } from '../../../api/patientsApi';
import type { Patient } from '../../../types';
import type { PatientService } from '../patientService';

export class RealPatientService implements PatientService {
  async getAllPatients(): Promise<Patient[]> {
    return await patientsApi.getAllPatients();
  }

  async getPatientById(id: string | number): Promise<Patient> {
    return await patientsApi.getPatientById(id);
  }

  async addPatient(patientData: Omit<Patient, 'id'>): Promise<Patient> {
    return await patientsApi.addPatient(patientData);
  }

  async updatePatient(id: string | number, patientData: Partial<Patient>): Promise<Patient> {
    return await patientsApi.updatePatient(id, patientData);
  }

  async deletePatient(id: string | number): Promise<boolean> {
    return await this.softDeletePatient(id);
  }

  async softDeletePatient(id: string | number): Promise<boolean> {
    // For real service, we'll use the existing delete endpoint
    // In a real implementation, you'd have a separate soft delete endpoint
    return await patientsApi.deletePatient(id);
  }

  async restorePatient(id: string | number): Promise<boolean> {
    // For real service, you'd implement a restore endpoint
    // For now, we'll throw an error indicating it's not implemented
    throw new Error('Restore functionality not implemented in real service');
  }
} 