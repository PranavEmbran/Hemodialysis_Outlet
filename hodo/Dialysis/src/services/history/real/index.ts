import { historyApi } from '../../../api/historyApi';
import type { History, HistoryRecord } from '../../../types';
import type { HistoryService } from '../historyService';

export class RealHistoryService implements HistoryService {
  async getAllHistory(): Promise<History[]> {
    return await historyApi.getAllHistory();
  }

  async getHistoryByPatientId(patientId: string): Promise<HistoryRecord[]> {
    return await historyApi.getHistoryByPatientId(patientId);
  }

  async addHistory(history: Omit<History, 'id'>): Promise<History> {
    return await historyApi.addHistory(history);
  }

  async deleteHistory(id: number): Promise<boolean> {
    return await historyApi.deleteHistory(id);
  }
} 