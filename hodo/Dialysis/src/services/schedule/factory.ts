import { MockScheduleService } from './mock';
import { RealScheduleService } from './real';
import type { ScheduleService } from './scheduleService';

class ScheduleServiceFactory {
  private static instance: ScheduleService | null = null;

  static getService(): ScheduleService {
    if (!ScheduleServiceFactory.instance) {
      const mode = import.meta.env.VITE_DATA_MODE || 'real';
      
      switch (mode) {
        case 'mock':
          console.log('Using Mock Schedule Service');
          ScheduleServiceFactory.instance = new MockScheduleService();
          break;
        case 'real':
        default:
          console.log('Using Real Schedule Service');
          ScheduleServiceFactory.instance = new RealScheduleService();
          break;
      }
    }
    
    return ScheduleServiceFactory.instance;
  }

  // Method to reset the instance (useful for testing or mode switching)
  static reset(): void {
    ScheduleServiceFactory.instance = null;
  }
}

export const scheduleServiceFactory = ScheduleServiceFactory; 