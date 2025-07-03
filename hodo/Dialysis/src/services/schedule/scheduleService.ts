import type { ScheduleEntry, StaffData } from '../../types';

export interface ScheduleService {
  getAllSchedules(): Promise<ScheduleEntry[]>;
  getScheduleById(id: string | number): Promise<ScheduleEntry>;
  createSchedule(schedule: Omit<ScheduleEntry, 'id'>): Promise<ScheduleEntry>;
  updateSchedule(id: string | number, scheduleData: Partial<ScheduleEntry>): Promise<ScheduleEntry>;
  deleteSchedule(id: string | number): Promise<boolean>;
  softDeleteSchedule(id: string | number): Promise<boolean>;
  restoreSchedule(id: string | number): Promise<boolean>;
  getStaff(): Promise<StaffData>;
} 