import type { History, HistoryRecord } from '../../types';

export interface HistoryService {
  getAllHistory(): Promise<History[]>;
  getHistoryByPatientId(patientId: string): Promise<HistoryRecord[]>;
  addHistory(history: Omit<History, 'id'>): Promise<History>;
  updateHistory(id: string | number, historyData: Partial<History>): Promise<History>;
  deleteHistory(id: number): Promise<boolean>;
  softDeleteHistory(id: string | number): Promise<boolean>;
} 