import type { History, HistoryRecord } from '../../../types';
import type { HistoryService } from '../historyService';
import { filePersistence } from '../../../utils/filePersistence';

// Generate a unique ID
const generateId = (): number => {
  return Date.now();
};

export class MockHistoryService implements HistoryService {
  async getAllHistory(): Promise<History[]> {
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Get history from file persistence
      const history = await filePersistence.getResourceData('history');
      // Return only active history records (not soft-deleted)
      const activeHistory = history.filter((h: History) => h.isDeleted !== 0);
      console.log(`MockHistoryService: Returning ${activeHistory.length} active history records`);
      return activeHistory;
    } catch (error) {
      console.error('MockHistoryService: Error loading history:', error);
      throw error;
    }
  }

  async getHistoryByPatientId(patientId: string): Promise<HistoryRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const history = await filePersistence.getResourceData('history');
      return history.filter((h: History) =>
        h.patientId === patientId && h.isDeleted !== 0
      ) as HistoryRecord[];
    } catch (error) {
      console.error('MockHistoryService: Error loading history by patient ID:', error);
      throw error;
    }
  }

  async addHistory(history: Omit<History, 'id'>): Promise<History> {
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const newHistory: History = {
        ...history,
        id: generateId(),
        isDeleted: 10, // Ensure new history records are active
      };

      // Add to file persistence
      await filePersistence.addItem('history', newHistory);

      console.log(`MockHistoryService: Added new history record with ID ${newHistory.id}`);
      return newHistory;
    } catch (error) {
      console.error('MockHistoryService: Error adding history:', error);
      throw error;
    }
  }

  async updateHistory(id: string | number, historyData: Partial<History>): Promise<History> {
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const history = await filePersistence.getResourceData('history');
      const historyIndex = history.findIndex((h: History) => h.id === Number(id));

      if (historyIndex === -1) {
        console.warn(`MockHistoryService: Cannot update - History record with ID ${id} not found`);
        throw new Error(`History record with ID ${id} not found`);
      }

      const updatedHistory = {
        ...history[historyIndex],
        ...historyData,
        id: Number(id), // Ensure ID remains the same
      };

      // Update in file persistence
      await filePersistence.updateItem('history', String(id), updatedHistory);

      console.log(`MockHistoryService: Updated history record with ID ${id}`);
      return updatedHistory;
    } catch (error) {
      console.error(`MockHistoryService: Error updating history ${id}:`, error);
      throw error;
    }
  }

  async deleteHistory(id: number): Promise<boolean> {
    return await this.softDeleteHistory(id);
  }

  async softDeleteHistory(id: string | number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Soft delete in file persistence
      await filePersistence.deleteItem('history', String(id));

      console.log(`MockHistoryService: Soft deleted history record with ID ${id}`);
      return true;
    } catch (error) {
      console.error(`MockHistoryService: Error deleting history ${id}:`, error);
      throw error;
    }
  }

  // Helper method to reset the service (useful for testing)
  static reset(): void {
    filePersistence.clearCache();
    console.log('MockHistoryService: Reset completed - cleared cache');
  }
} 