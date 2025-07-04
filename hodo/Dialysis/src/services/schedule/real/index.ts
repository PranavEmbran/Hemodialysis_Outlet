import { scheduleApi } from '../../../api/scheduleApi';
import type { ScheduleEntry, StaffData } from '../../../types';
import type { ScheduleService } from '../scheduleService';

export class RealScheduleService implements ScheduleService {
  async getAllSchedules(): Promise<ScheduleEntry[]> {
    return await scheduleApi.getAllSchedules();
  }

  async getScheduleById(id: string | number): Promise<ScheduleEntry> {
    return await scheduleApi.getScheduleById(id);
  }

  async createSchedule(schedule: Omit<ScheduleEntry, 'id'>): Promise<ScheduleEntry> {
    return await scheduleApi.createSchedule(schedule);
  }

  async updateSchedule(id: string | number, scheduleData: Partial<ScheduleEntry>): Promise<ScheduleEntry> {
    return await scheduleApi.updateSchedule(id, scheduleData);
  }

  async deleteSchedule(id: string | number): Promise<boolean> {
    return await this.softDeleteSchedule(id);
  }

  async softDeleteSchedule(id: string | number): Promise<boolean> {
    return await scheduleApi.softDeleteSchedule(id);
  }

  async restoreSchedule(id: string | number): Promise<boolean> {
    // For real service, you'd implement a restore endpoint
    // For now, we'll throw an error indicating it's not implemented
    throw new Error('Restore functionality not implemented in real service');
  }

  async getStaff(): Promise<StaffData> {
    return await scheduleApi.getStaff();
  }
} 