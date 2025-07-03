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
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const history = getHistoryFromStorage();
    
    // If no history exists, initialize with some mock data
    if (history.length === 0) {
      const mockHistory: History[] = [
        {
          id: 1,
          date: '2024-01-15',
          patientId: '1',
          patientName: 'John Doe',
          parameters: 'BP: 120/80, Weight: 70kg',
          notes: 'Patient responded well to treatment',
          amount: '1500',
          age: '44',
          gender: 'Male',
          treatmentParameters: {
            bloodPressure: '120/80',
            weight: '70kg',
            duration: '4 hours'
          },
          nursingNotes: 'Patient stable throughout session'
        },
        {
          id: 2,
          date: '2024-01-16',
          patientId: '2',
          patientName: 'Jane Smith',
          parameters: 'BP: 118/78, Weight: 65kg',
          notes: 'Minor complications during session',
          amount: '1800',
          age: '49',
          gender: 'Female',
          treatmentParameters: {
            bloodPressure: '118/78',
            weight: '65kg',
            duration: '4 hours'
          },
          nursingNotes: 'Patient experienced mild hypotension, resolved with fluid adjustment'
        },
        {
          id: 3,
          date: '2024-01-17',
          patientId: '3',
          patientName: 'Michael Johnson',
          parameters: 'BP: 125/85, Weight: 75kg',
          notes: 'Standard dialysis session completed',
          amount: '1200',
          age: '59',
          gender: 'Male',
          treatmentParameters: {
            bloodPressure: '125/85',
            weight: '75kg',
            duration: '3 hours'
          },
          nursingNotes: 'Routine session, no complications'
        }
      ];
      
      saveHistoryToStorage(mockHistory);
      return mockHistory;
    }
    
    return history;
  }

  async getHistoryByPatientId(patientId: string): Promise<HistoryRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const allHistory = await this.getAllHistory();
    return allHistory.filter(history => history.patientId === patientId) as HistoryRecord[];
  }

  async addHistory(history: Omit<History, 'id'>): Promise<History> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const allHistory = getHistoryFromStorage();
    const newHistory: History = {
      ...history,
      id: generateId(),
    };
    
    allHistory.push(newHistory);
    saveHistoryToStorage(allHistory);
    
    return newHistory;
  }

  async deleteHistory(id: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const allHistory = getHistoryFromStorage();
    const historyIndex = allHistory.findIndex(h => h.id === id);
    
    if (historyIndex === -1) {
      throw new Error(`History record with ID ${id} not found`);
    }
    
    allHistory.splice(historyIndex, 1);
    saveHistoryToStorage(allHistory);
    
    return true;
  }
} 