import { MockPatientService } from './mock';
import { RealPatientService } from './real';
import type { PatientService } from './patientService';

class PatientServiceFactory {
  private static instance: PatientService | null = null;

  static getService(): PatientService {
    if (!PatientServiceFactory.instance) {
      const mode = import.meta.env.VITE_DATA_MODE || 'real';
      
      switch (mode) {
        case 'mock':
          console.log('Using Mock Patient Service');
          PatientServiceFactory.instance = new MockPatientService();
          break;
        case 'real':
        default:
          console.log('Using Real Patient Service');
          PatientServiceFactory.instance = new RealPatientService();
          break;
      }
    }
    
    return PatientServiceFactory.instance;
  }

  // Method to reset the instance (useful for testing or mode switching)
  static reset(): void {
    PatientServiceFactory.instance = null;
  }
}

export const patientServiceFactory = PatientServiceFactory; 