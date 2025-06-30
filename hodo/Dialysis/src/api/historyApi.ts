import { API_URL } from '../config';
import { History, HistoryRecord } from '../types';

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

export const historyApi = {
  async getAllHistory(): Promise<History[]> {
    const response = await fetch(`${API_URL}/history`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  async getHistoryByPatientId(patientId: string): Promise<HistoryRecord[]> {
    try {
      const allHistory = await this.getAllHistory();
      return allHistory.filter(history => history.patientId === patientId) as HistoryRecord[];
    } catch (error) {
      console.error('Error fetching history by patient ID:', error);
      throw new Error('Failed to fetch patient history');
    }
  },

  async addHistory(history: Omit<History, 'id'>): Promise<History> {
    const response = await fetch(`${API_URL}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(history),
    });
    if (!response.ok) throw new Error('Failed to add history');
    return response.json();
  },

  async deleteHistory(id: number): Promise<boolean> {
    try {
      await fetchWithRetry(`${API_URL}/history/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting history:', error);
      throw new Error('Failed to delete history');
    }
  }
}; 