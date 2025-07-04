import type { Patient } from '../../../types';
import type { PatientService } from '../patientService';

const STORAGE_KEY = 'dialysis_patients';

// Helper function to get patients from localStorage
const getPatientsFromStorage = (): Patient[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading patients from localStorage:', error);
    return [];
  }
};

// Helper function to save patients to localStorage
const savePatientsToStorage = (patients: Patient[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  } catch (error) {
    console.error('Error saving patients to localStorage:', error);
  }
};

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export class MockPatientService implements PatientService {
  async getAllPatients(): Promise<Patient[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const patients = getPatientsFromStorage();
    
    // Filter out soft-deleted patients
    const activePatients = patients.filter(p => !p.isDeleted);
    
    // If no active patients exist, initialize with some mock data
    if (activePatients.length === 0) {
      const mockPatients: Patient[] = [
        {
          id: '1',
          name: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          gender: 'Male',
          dateOfBirth: '1980-05-15',
          mobileNo: '+1234567890',
          bloodGroup: 'A+',
          catheterDate: '2023-01-15',
          fistulaDate: '2023-02-20',
          catheterInsertionDate: '2023-01-15',
          fistulaCreationDate: '2023-02-20',
        },
        {
          id: '2',
          name: 'Jane Smith',
          firstName: 'Jane',
          lastName: 'Smith',
          gender: 'Female',
          dateOfBirth: '1975-08-22',
          mobileNo: '+1234567891',
          bloodGroup: 'O+',
          catheterDate: '2023-03-10',
          fistulaDate: '2023-04-05',
          catheterInsertionDate: '2023-03-10',
          fistulaCreationDate: '2023-04-05',
        },
        {
          id: '3',
          name: 'Michael Johnson',
          firstName: 'Michael',
          lastName: 'Johnson',
          gender: 'Male',
          dateOfBirth: '1965-12-03',
          mobileNo: '+1234567892',
          bloodGroup: 'B+',
          catheterDate: '2023-05-20',
          fistulaDate: '2023-06-15',
          catheterInsertionDate: '2023-05-20',
          fistulaCreationDate: '2023-06-15',
        }
      ];
      
      savePatientsToStorage(mockPatients);
      return mockPatients;
    }
    
    return activePatients;
  }

  async getPatientById(id: string | number): Promise<Patient> {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const patients = getPatientsFromStorage();
    const patient = patients.find(p => p.id === id);
    
    if (!patient) {
      throw new Error(`Patient with ID ${id} not found`);
    }
    
    return patient;
  }

  async addPatient(patientData: Omit<Patient, 'id'>): Promise<Patient> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const patients = getPatientsFromStorage();
    const newPatient: Patient = {
      ...patientData,
      id: generateId(),
    };
    
    patients.push(newPatient);
    savePatientsToStorage(patients);
    
    return newPatient;
  }

  async updatePatient(id: string | number, patientData: Partial<Patient>): Promise<Patient> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const patients = getPatientsFromStorage();
    const patientIndex = patients.findIndex(p => p.id === id);
    
    if (patientIndex === -1) {
      throw new Error(`Patient with ID ${id} not found`);
    }
    
    const updatedPatient = {
      ...patients[patientIndex],
      ...patientData,
      id: String(id), // Convert to string to match Patient type
    };
    
    patients[patientIndex] = updatedPatient;
    savePatientsToStorage(patients);
    
    return updatedPatient;
  }

  async deletePatient(id: string | number): Promise<boolean> {
    return await this.softDeletePatient(id);
  }

  async softDeletePatient(id: string | number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const patients = getPatientsFromStorage();
    const patientIndex = patients.findIndex(p => p.id === id);
    
    if (patientIndex === -1) {
      throw new Error(`Patient with ID ${id} not found`);
    }
    
    // Soft delete - mark as deleted instead of removing
    patients[patientIndex] = {
      ...patients[patientIndex],
      isDeleted: 0,
      deletedAt: new Date().toISOString()
    };
    
    savePatientsToStorage(patients);
    return true;
  }

  async restorePatient(id: string | number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const patients = getPatientsFromStorage();
    const patientIndex = patients.findIndex(p => p.id === id);
    
    if (patientIndex === -1) {
      throw new Error(`Patient with ID ${id} not found`);
    }
    
    // Restore - mark as active
    patients[patientIndex] = {
      ...patients[patientIndex],
      isDeleted: 10,
      deletedAt: undefined
    };
    
    savePatientsToStorage(patients);
    return true;
  }
} 