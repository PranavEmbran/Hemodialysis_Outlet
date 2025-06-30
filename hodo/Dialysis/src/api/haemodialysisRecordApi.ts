import { API_URL } from '../config';

export interface HaemodialysisRecord {
  id?: string;
  patientId: string;
  patientName: string;
  date: string;
  rows: any[];
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function fetchWithRetry(url: string, options: RequestInit = {}, retries: number = MAX_RETRIES): Promise<any> {
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
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export const haemodialysisRecordApi = {
  async getAll(): Promise<HaemodialysisRecord[]> {
    return fetchWithRetry(`${API_URL}/haemodialysis-records`);
  },
  async addRecord(record: Omit<HaemodialysisRecord, 'id'>): Promise<HaemodialysisRecord> {
    return fetchWithRetry(`${API_URL}/haemodialysis-records`, {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },
}; 