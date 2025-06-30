import { API_URL } from '../config';
import { Patient } from '../types';

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function fetchWithRetry(url: string, options: FetchOptions = {}, retries: number = MAX_RETRIES): Promise<any> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export const patientsApi = {
  async getAllPatients(): Promise<Patient[]> {
    try {
      return await fetchWithRetry(`${API_URL}/patients`);
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw new Error('Failed to fetch patients. Please check if the server is running.');
    }
  },

  async getPatientById(id: number): Promise<Patient> {
    try {
      return await fetchWithRetry(`${API_URL}/patients/${id}`);
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw new Error('Failed to fetch patient details.');
    }
  },

  async addPatient(patientData: Omit<Patient, 'id'>): Promise<Patient> {
    try {
      return await fetchWithRetry(`${API_URL}/patients`, {
        method: 'POST',
        body: JSON.stringify(patientData),
      });
    } catch (error) {
      console.error('Error adding patient:', error);
      throw new Error('Failed to register patient. Please check your connection and try again.');
    }
  },

  async updatePatient(id: number, patientData: Partial<Patient>): Promise<Patient> {
    try {
      return await fetchWithRetry(`${API_URL}/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patientData),
      });
    } catch (error) {
      console.error('Error updating patient:', error);
      throw new Error('Failed to update patient details.');
    }
  },

  async deletePatient(id: number): Promise<boolean> {
    try {
      return await fetchWithRetry(`${API_URL}/patients/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw new Error('Failed to delete patient.');
    }
  }
}; 