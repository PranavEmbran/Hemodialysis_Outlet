import { MockHistoryService } from './mock';
import { RealHistoryService } from './real';
import type { HistoryService } from './historyService';

class HistoryServiceFactory {
  private static instance: HistoryService | null = null;

  static getService(): HistoryService {
    if (!HistoryServiceFactory.instance) {
      const mode = import.meta.env.VITE_DATA_MODE || 'real';
      
      switch (mode) {
        case 'mock':
          console.log('Using Mock History Service');
          HistoryServiceFactory.instance = new MockHistoryService();
          break;
        case 'real':
        default:
          console.log('Using Real History Service');
          HistoryServiceFactory.instance = new RealHistoryService();
          break;
      }
    }
    
    return HistoryServiceFactory.instance;
  }

  // Method to reset the instance (useful for testing or mode switching)
  static reset(): void {
    HistoryServiceFactory.instance = null;
  }
}

export const historyServiceFactory = HistoryServiceFactory; 