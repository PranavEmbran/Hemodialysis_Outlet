import type { Patient } from '../../../types';
import type { PatientService } from '../patientService';
import { filePersistence } from '../../../utils/filePersistence';

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export class MockPatientService implements PatientService {
  async getAllPatients(): Promise<Patient[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Get patients from file
      const patients = await filePersistence.getResourceData('patients');
      // Return only active patients (not soft-deleted)
      const activePatients = patients.filter((p: Patient) => p.isDeleted !== 0);
      console.log(`MockPatientService: Returning ${activePatients.length} active patients`);
      return activePatients;
    } catch (error) {
      console.error('MockPatientService: Error loading patients:', error);
      throw error;
    }
  }

  async getPatientById(id: string | number): Promise<Patient> {
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const patients = await filePersistence.getResourceData('patients');
      const patient = patients.find((p: Patient) => p.id === String(id) && p.isDeleted !== 0);

      if (!patient) {
        console.warn(`MockPatientService: Patient with ID ${id} not found`);
        throw new Error(`Patient with ID ${id} not found`);
      }

      return patient;
    } catch (error) {
      console.error(`MockPatientService: Error loading patient ${id}:`, error);
      throw error;
    }
  }

  async addPatient(patientData: Omit<Patient, 'id'>): Promise<Patient> {
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const newPatient: Patient = {
        ...patientData,
        id: generateId(),
        isDeleted: 10, // Ensure new patients are active
      };

      // Add to file
      await filePersistence.addItem('patients', newPatient);

      console.log(`MockPatientService: Added new patient with ID ${newPatient.id}`);
      return newPatient;
    } catch (error) {
      console.error('MockPatientService: Error adding patient:', error);
      throw error;
    }
  }

  async updatePatient(id: string | number, patientData: Partial<Patient>): Promise<Patient> {
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const patients = await filePersistence.getResourceData('patients');
      const patientIndex = patients.findIndex((p: Patient) => p.id === String(id));

      if (patientIndex === -1) {
        console.warn(`MockPatientService: Cannot update - Patient with ID ${id} not found`);
        throw new Error(`Patient with ID ${id} not found`);
      }

      const updatedPatient = {
        ...patients[patientIndex],
        ...patientData,
        id: String(id), // Ensure ID remains the same
      };

      // Update in file
      await filePersistence.updateItem('patients', String(id), updatedPatient);

      console.log(`MockPatientService: Updated patient with ID ${id}`);
      return updatedPatient;
    } catch (error) {
      console.error(`MockPatientService: Error updating patient ${id}:`, error);
      throw error;
    }
  }

  async deletePatient(id: string | number): Promise<boolean> {
    return await this.softDeletePatient(id);
  }

  async softDeletePatient(id: string | number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Soft delete in file
      await filePersistence.deleteItem('patients', String(id));

      console.log(`MockPatientService: Soft deleted patient with ID ${id}`);
      return true;
    } catch (error) {
      console.error(`MockPatientService: Error deleting patient ${id}:`, error);
      throw error;
    }
  }

  async restorePatient(id: string | number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const patients = await filePersistence.getResourceData('patients');
      const patientIndex = patients.findIndex((p: Patient) => p.id === String(id));

      if (patientIndex === -1) {
        console.warn(`MockPatientService: Cannot restore - Patient with ID ${id} not found`);
        throw new Error(`Patient with ID ${id} not found`);
      }

      // Restore - mark as active
      const restoredPatient = {
        ...patients[patientIndex],
        isDeleted: 10,
        deletedAt: undefined
      };

      // Update in file
      await filePersistence.updateItem('patients', String(id), restoredPatient);

      console.log(`MockPatientService: Restored patient with ID ${id}`);
      return true;
    } catch (error) {
      console.error(`MockPatientService: Error restoring patient ${id}:`, error);
      throw error;
    }
  }

  // Helper method to reset the service (useful for testing)
  static reset(): void {
    filePersistence.clearCache();
    console.log('MockPatientService: Reset completed - cleared cache');
  }

  // Helper method to export current mock data
  static exportData(): void {
    const backup = filePersistence.getBackupData();
    if (backup) {
      console.log('MockPatientService: Current data (from backup):', backup);
    } else {
      console.log('MockPatientService: No backup data available');
    }
  }

  // Helper method to import mock data
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.patients && Array.isArray(data.patients)) {
        localStorage.setItem('mockData_backup', jsonData);
        console.log('MockPatientService: Imported data successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('MockPatientService: Failed to import data:', error);
      return false;
    }
  }

  // Helper method to clear persistent data
  static clearPersistentData(): void {
    filePersistence.clearCache();
    localStorage.removeItem('mockData_backup');
    console.log('MockPatientService: Cleared persistent data');
  }
} 