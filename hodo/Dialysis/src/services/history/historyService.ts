import type { History, HistoryRecord } from '../../types';

export interface HistoryService {
  getAllHistory(): Promise<History[]>;
  getHistoryByPatientId(patientId: string): Promise<HistoryRecord[]>;
  addHistory(history: Omit<History, 'id'>): Promise<History>;
  deleteHistory(id: number): Promise<boolean>;
} 