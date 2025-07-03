import type { ScheduleEntry, StaffData } from '../../../types';
import type { ScheduleService } from '../scheduleService';

const STORAGE_KEY = 'dialysis_schedules';
const STAFF_STORAGE_KEY = 'dialysis_staff';

// Helper function to get schedules from localStorage
const getSchedulesFromStorage = (): ScheduleEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading schedules from localStorage:', error);
    return [];
  }
};

// Helper function to save schedules to localStorage
const saveSchedulesToStorage = (schedules: ScheduleEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  } catch (error) {
    console.error('Error saving schedules to localStorage:', error);
  }
};

// Helper function to get staff from localStorage
const getStaffFromStorage = (): StaffData => {
  try {
    const stored = localStorage.getItem(STAFF_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      technicians: [],
      doctors: [],
      units: []
    };
  } catch (error) {
    console.error('Error reading staff from localStorage:', error);
    return {
      technicians: [],
      doctors: [],
      units: []
    };
  }
};

// Helper function to save staff to localStorage
const saveStaffToStorage = (staff: StaffData): void => {
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff));
  } catch (error) {
    console.error('Error saving staff to localStorage:', error);
  }
};

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export class MockScheduleService implements ScheduleService {
  async getAllSchedules(): Promise<ScheduleEntry[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const schedules = getSchedulesFromStorage();
    
    // Filter out soft-deleted schedules
    const activeSchedules = schedules.filter(s => !s.isDeleted);
    
    // If no active schedules exist, initialize with some mock data
    if (activeSchedules.length === 0) {
      const mockSchedules: ScheduleEntry[] = [
        {
          id: '1',
          patientId: '1',
          patientName: 'John Doe',
          date: '2024-01-20',
          time: '09:00',
          dialysisUnit: 'Unit A',
          technician: 'Dr. Sarah Wilson',
          admittingDoctor: 'Dr. Michael Brown',
          status: 'Scheduled',
          remarks: 'Regular dialysis session'
        },
        {
          id: '2',
          patientId: '2',
          patientName: 'Jane Smith',
          date: '2024-01-20',
          time: '11:00',
          dialysisUnit: 'Unit B',
          technician: 'Dr. David Johnson',
          admittingDoctor: 'Dr. Emily Davis',
          status: 'Completed',
          remarks: 'Session completed successfully'
        },
        {
          id: '3',
          patientId: '3',
          patientName: 'Michael Johnson',
          date: '2024-01-21',
          time: '08:00',
          dialysisUnit: 'Unit A',
          technician: 'Dr. Sarah Wilson',
          admittingDoctor: 'Dr. Michael Brown',
          status: 'Scheduled',
          remarks: 'Morning session'
        }
      ];
      
      saveSchedulesToStorage(mockSchedules);
      return mockSchedules;
    }
    
    return activeSchedules;
  }

  async getScheduleById(id: string | number): Promise<ScheduleEntry> {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const schedules = getSchedulesFromStorage();
    const schedule = schedules.find(s => s.id === id);
    
    if (!schedule) {
      throw new Error(`Schedule with ID ${id} not found`);
    }
    
    return schedule;
  }

  async createSchedule(schedule: Omit<ScheduleEntry, 'id'>): Promise<ScheduleEntry> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const schedules = getSchedulesFromStorage();
    const newSchedule: ScheduleEntry = {
      ...schedule,
      id: generateId(),
    };
    
    schedules.push(newSchedule);
    saveSchedulesToStorage(schedules);
    
    return newSchedule;
  }

  async updateSchedule(id: string | number, scheduleData: Partial<ScheduleEntry>): Promise<ScheduleEntry> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const schedules = getSchedulesFromStorage();
    const scheduleIndex = schedules.findIndex(s => s.id === id);
    
    if (scheduleIndex === -1) {
      throw new Error(`Schedule with ID ${id} not found`);
    }
    
    const updatedSchedule = {
      ...schedules[scheduleIndex],
      ...scheduleData,
      id, // Ensure ID doesn't get overwritten
    };
    
    schedules[scheduleIndex] = updatedSchedule;
    saveSchedulesToStorage(schedules);
    
    return updatedSchedule;
  }

  async deleteSchedule(id: string | number): Promise<boolean> {
    return await this.softDeleteSchedule(id);
  }

  async softDeleteSchedule(id: string | number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const schedules = getSchedulesFromStorage();
    const scheduleIndex = schedules.findIndex(s => s.id === id);
    
    if (scheduleIndex === -1) {
      throw new Error(`Schedule with ID ${id} not found`);
    }
    
    // Soft delete - mark as deleted instead of removing
    schedules[scheduleIndex] = {
      ...schedules[scheduleIndex],
      isDeleted: true,
      deletedAt: new Date().toISOString()
    };
    
    saveSchedulesToStorage(schedules);
    return true;
  }

  async restoreSchedule(id: string | number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const schedules = getSchedulesFromStorage();
    const scheduleIndex = schedules.findIndex(s => s.id === id);
    
    if (scheduleIndex === -1) {
      throw new Error(`Schedule with ID ${id} not found`);
    }
    
    // Restore - remove deleted flags
    schedules[scheduleIndex] = {
      ...schedules[scheduleIndex],
      isDeleted: false,
      deletedAt: undefined
    };
    
    saveSchedulesToStorage(schedules);
    return true;
  }

  async getStaff(): Promise<StaffData> {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const staff = getStaffFromStorage();
    
    // If no staff exists, initialize with some mock data
    if (staff.technicians.length === 0 && staff.doctors.length === 0 && staff.units.length === 0) {
      const mockStaff: StaffData = {
        technicians: ['Dr. Sarah Wilson', 'Dr. David Johnson', 'Dr. Lisa Chen'],
        doctors: ['Dr. Michael Brown', 'Dr. Emily Davis', 'Dr. Robert Wilson'],
        units: ['Unit A', 'Unit B', 'Unit C', 'Unit D']
      };
      
      saveStaffToStorage(mockStaff);
      return mockStaff;
    }
    
    return staff;
  }
} 