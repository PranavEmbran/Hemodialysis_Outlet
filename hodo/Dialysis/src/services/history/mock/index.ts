import type { History, HistoryRecord } from '../../../types';
import type { HistoryService } from '../historyService';

const STORAGE_KEY = 'dialysis_history';

// Helper function to get history from localStorage
const getHistoryFromStorage = (): History[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading history from localStorage:', error);
    return [];
  }
};

// Helper function to save history to localStorage
const saveHistoryToStorage = (history: History[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving history to localStorage:', error);
  }
};

// Generate a unique ID
const generateId = (): number => {
  return Date.now();
};

export class MockHistoryService implements HistoryService {
  async getAllHistory(): Promise<History[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const allHistory = getHistoryFromStorage();
    
    // Filter out soft-deleted records (isDeleted = 0)
    const activeHistory = allHistory.filter(history => history.isDeleted !== 0);
    
    if (activeHistory.length === 0) {
      const mockHistory: History[] = [
        {
          id: 1,
          date: '2024-01-15',
          patientId: '1',
          patientName: 'John Doe',
          parameters: 'BP: 120/80, Weight: 70kg',
          notes: 'Regular dialysis session completed successfully',
          amount: '1500',
          age: '45',
          gender: 'Male',
          isDeleted: 10,
        },
        {
          id: 2,
          date: '2024-01-16',
          patientId: '2',
          patientName: 'Jane Smith',
          parameters: 'BP: 110/75, Weight: 65kg',
          notes: 'Patient reported mild discomfort during session',
          amount: '1800',
          age: '52',
          gender: 'Female',
          isDeleted: 10,
        },
        {
          id: 3,
          date: '2024-01-17',
          patientId: '3',
          patientName: 'Michael Johnson',
          parameters: 'BP: 125/85, Weight: 75kg',
          notes: 'Standard dialysis session, no complications',
          amount: '1200',
          age: '38',
          gender: 'Male',
          isDeleted: 10,
        }
      ];
      
      saveHistoryToStorage(mockHistory);
      return mockHistory;
    }
    
    return activeHistory;
  }

  async getHistoryByPatientId(patientId: string): Promise<HistoryRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const allHistory = getHistoryFromStorage();
    
    // Filter by patientId and exclude soft-deleted records
    return allHistory.filter(history => 
      history.patientId === patientId && history.isDeleted !== 0
    ) as HistoryRecord[];
  }

  async addHistory(history: Omit<History, 'id'>): Promise<History> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const allHistory = getHistoryFromStorage();
    const newHistory: History = {
      ...history,
      id: generateId(),
      isDeleted: 10,
    };
    
    allHistory.push(newHistory);
    saveHistoryToStorage(allHistory);
    
    return newHistory;
  }

  async updateHistory(id: string | number, historyData: Partial<History>): Promise<History> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const allHistory = getHistoryFromStorage();
    const historyIndex = allHistory.findIndex(h => h.id === id);
    
    if (historyIndex === -1) {
      throw new Error(`History record with ID ${id} not found`);
    }
    
    // Update the history record with new data
    allHistory[historyIndex] = {
      ...allHistory[historyIndex],
      ...historyData,
    };
    
    saveHistoryToStorage(allHistory);
    
    return allHistory[historyIndex];
  }

  async deleteHistory(id: number): Promise<boolean> {
    return await this.softDeleteHistory(id);
  }

  async softDeleteHistory(id: string | number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const allHistory = getHistoryFromStorage();
    const historyIndex = allHistory.findIndex(h => h.id === id);
    
    if (historyIndex === -1) {
      throw new Error(`History record with ID ${id} not found`);
    }
    
    // Soft delete - mark as deleted instead of removing
    allHistory[historyIndex] = {
      ...allHistory[historyIndex],
      isDeleted: 0,
      deletedAt: new Date().toISOString()
    };
    
    saveHistoryToStorage(allHistory);
    
    return true;
  }
} 