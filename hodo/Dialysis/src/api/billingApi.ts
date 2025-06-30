import { API_URL } from '../config';
import type { Billing } from '../types';

interface Bill {
  id?: number;
  patientId: number;
  patientName: string;
  amount: number;
  date: string;
  status: string;
  description?: string;
}

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

export const billingApi = {
  async getAllBills(): Promise<Billing[]> {
    try {
      return await fetchWithRetry(`${API_URL}/billing`);
    } catch (error) {
      console.error('Error fetching bills:', error);
      throw new Error('Failed to fetch bills');
    }
  },

  async addBill(bill: Omit<Billing, 'id'>): Promise<Billing> {
    try {
      return await fetchWithRetry(`${API_URL}/billing`, {
        method: 'POST',
        body: JSON.stringify(bill),
      });
    } catch (error) {
      console.error('Error adding bill:', error);
      throw new Error('Failed to add bill');
    }
  },

  async deleteBill(id: number): Promise<boolean> {
    try {
      await fetchWithRetry(`${API_URL}/billing/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting bill:', error);
      throw new Error('Failed to delete bill');
    }
  },
}; 