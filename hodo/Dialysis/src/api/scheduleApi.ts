import { API_URL } from '../config';
import { ScheduleEntry, StaffData } from '../types';

interface Schedule {
  id?: number;
  patientId: number;
  patientName: string;
  date: string;
  time: string;
  duration: number;
  staffId: number;
  staffName: string;
  status: string;
  notes?: string;
}

interface Staff {
  id: number;
  name: string;
  role: string;
  specialization?: string;
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

export const scheduleApi = {
  async getAllSchedules(): Promise<ScheduleEntry[]> {
    const response = await fetch(`${API_URL}/schedules`);
    if (!response.ok) throw new Error('Failed to fetch schedules');
    return response.json();
  },

  async getScheduleById(id: number): Promise<Schedule> {
    try {
      return await fetchWithRetry(`${API_URL}/appointments/${id}`);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw new Error('Failed to fetch schedule');
    }
  },

  async createSchedule(schedule: Omit<ScheduleEntry, 'id'>): Promise<ScheduleEntry> {
    const response = await fetch(`${API_URL}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule),
    });
    if (!response.ok) throw new Error('Failed to create schedule');
    return response.json();
  },

  async updateSchedule(id: number, scheduleData: Partial<Schedule>): Promise<Schedule> {
    try {
      return await fetchWithRetry(`${API_URL}/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(scheduleData),
      });
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw new Error('Failed to update schedule');
    }
  },

  async deleteSchedule(id: number): Promise<boolean> {
    try {
      await fetchWithRetry(`${API_URL}/appointments/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw new Error('Failed to delete schedule');
    }
  },

  async getStaff(): Promise<StaffData> {
    const response = await fetch(`${API_URL}/staff`);
    if (!response.ok) throw new Error('Failed to fetch staff');
    return response.json();
  }
}; 