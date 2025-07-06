import type { ScheduleEntry, StaffData } from '../../../types';
import type { ScheduleService } from '../scheduleService';
import { filePersistence } from '../../../utils/filePersistence';

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export class MockScheduleService implements ScheduleService {
  async getAllSchedules(): Promise<ScheduleEntry[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Get schedules from file persistence
      const schedules = await filePersistence.getResourceData('appointments');
      // Return only active schedules (not soft-deleted)
      const activeSchedules = schedules.filter((s: ScheduleEntry) => s.isDeleted !== 0);
      console.log(`MockScheduleService: Returning ${activeSchedules.length} active schedules`);
      return activeSchedules;
    } catch (error) {
      console.error('MockScheduleService: Error loading schedules:', error);
      throw error;
    }
  }

  async getScheduleById(id: string | number): Promise<ScheduleEntry> {
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const schedules = await filePersistence.getResourceData('appointments');
      const schedule = schedules.find((s: ScheduleEntry) => s.id === String(id) && s.isDeleted !== 0);

      if (!schedule) {
        console.warn(`MockScheduleService: Schedule with ID ${id} not found`);
        throw new Error(`Schedule with ID ${id} not found`);
      }

      return schedule;
    } catch (error) {
      console.error(`MockScheduleService: Error loading schedule ${id}:`, error);
      throw error;
    }
  }

  async createSchedule(schedule: Omit<ScheduleEntry, 'id'>): Promise<ScheduleEntry> {
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const newSchedule: ScheduleEntry = {
        ...schedule,
        id: generateId(),
        isDeleted: 10, // Ensure new schedules are active
      };

      // Add to file persistence
      await filePersistence.addItem('appointments', newSchedule);

      console.log(`MockScheduleService: Created new schedule with ID ${newSchedule.id}`);
      return newSchedule;
    } catch (error) {
      console.error('MockScheduleService: Error creating schedule:', error);
      throw error;
    }
  }

  async updateSchedule(id: string | number, scheduleData: Partial<ScheduleEntry>): Promise<ScheduleEntry> {
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const schedules = await filePersistence.getResourceData('appointments');
      const scheduleIndex = schedules.findIndex((s: ScheduleEntry) => s.id === String(id));

      if (scheduleIndex === -1) {
        console.warn(`MockScheduleService: Cannot update - Schedule with ID ${id} not found`);
        throw new Error(`Schedule with ID ${id} not found`);
      }

      // Update the schedule with new data
      const updatedSchedule = {
        ...schedules[scheduleIndex],
        ...scheduleData,
        id: schedules[scheduleIndex].id // Preserve the original ID
      };

      // Update in file persistence
      await filePersistence.updateItem('appointments', String(id), updatedSchedule);

      console.log(`MockScheduleService: Updated schedule with ID ${id}`);
      return updatedSchedule;
    } catch (error) {
      console.error(`MockScheduleService: Error updating schedule ${id}:`, error);
      throw error;
    }
  }

  async deleteSchedule(id: string | number): Promise<boolean> {
    return await this.softDeleteSchedule(id);
  }

  async softDeleteSchedule(id: string | number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Soft delete in file persistence
      await filePersistence.deleteItem('appointments', String(id));

      console.log(`MockScheduleService: Soft deleted schedule with ID ${id}`);
      return true;
    } catch (error) {
      console.error(`MockScheduleService: Error deleting schedule ${id}:`, error);
      throw error;
    }
  }

  async restoreSchedule(id: string | number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const schedules = await filePersistence.getResourceData('appointments');
      const scheduleIndex = schedules.findIndex((s: ScheduleEntry) => s.id === String(id));

      if (scheduleIndex === -1) {
        console.warn(`MockScheduleService: Cannot restore - Schedule with ID ${id} not found`);
        throw new Error(`Schedule with ID ${id} not found`);
      }

      // Restore - mark as active
      const restoredSchedule = {
        ...schedules[scheduleIndex],
        isDeleted: 10,
        deletedAt: undefined
      };

      // Update in file persistence
      await filePersistence.updateItem('appointments', String(id), restoredSchedule);

      console.log(`MockScheduleService: Restored schedule with ID ${id}`);
      return true;
    } catch (error) {
      console.error(`MockScheduleService: Error restoring schedule ${id}:`, error);
      throw error;
    }
  }

  async getStaff(): Promise<StaffData> {
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      // Get all data from file persistence
      const allData = await filePersistence.getData();
      const staffData = allData.staff;
      console.log('MockScheduleService: Loaded staff data:', staffData);

      // Check if staff data exists and has the required structure
      if (staffData && staffData.technicians && staffData.doctors && staffData.units) {
        return staffData;
      } else {
        console.warn('MockScheduleService: Staff data is missing or incomplete, using fallback data');
        // Return fallback data if staff data is missing or incomplete
        return {
          technicians: [
            "Dr. Sarah Johnson",
            "Dr. Michael Chen",
            "Dr. Emily Rodriguez",
            "Dr. David Thompson",
            "Dr. Lisa Wang"
          ],
          doctors: [
            "Dr. Robert Smith",
            "Dr. Jennifer Brown",
            "Dr. William Davis",
            "Dr. Maria Garcia",
            "Dr. James Wilson"
          ],
          units: [
            "Unit A - Main Dialysis",
            "Unit B - Emergency",
            "Unit C - Pediatric",
            "Unit D - Intensive Care",
            "Unit E - Outpatient"
          ]
        };
      }
    } catch (error) {
      console.error('MockScheduleService: Error loading staff data:', error);
      // Return fallback data if file persistence fails
      return {
        technicians: [
          "Dr. Sarah Johnson",
          "Dr. Michael Chen",
          "Dr. Emily Rodriguez",
          "Dr. David Thompson",
          "Dr. Lisa Wang"
        ],
        doctors: [
          "Dr. Robert Smith",
          "Dr. Jennifer Brown",
          "Dr. William Davis",
          "Dr. Maria Garcia",
          "Dr. James Wilson"
        ],
        units: [
          "Unit A - Main Dialysis",
          "Unit B - Emergency",
          "Unit C - Pediatric",
          "Unit D - Intensive Care",
          "Unit E - Outpatient"
        ]
      };
    }
  }

  // Helper method to reset the service (useful for testing)
  static reset(): void {
    filePersistence.clearCache();
    console.log('MockScheduleService: Reset completed - cleared cache');
  }
} 