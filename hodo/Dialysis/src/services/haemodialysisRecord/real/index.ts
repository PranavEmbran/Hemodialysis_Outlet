import { haemodialysisRecordApi } from '../../../api/haemodialysisRecordApi';
import type { HaemodialysisRecord, HaemodialysisRecordService } from '../haemodialysisRecordService';

export class RealHaemodialysisRecordService implements HaemodialysisRecordService {
    async getAllRecords(): Promise<HaemodialysisRecord[]> {
        return await haemodialysisRecordApi.getAll();
    }

    async getRecordById(id: string): Promise<HaemodialysisRecord> {
        throw new Error('getRecordById not implemented in real service');
    }

    async addRecord(record: Omit<HaemodialysisRecord, 'id'>): Promise<HaemodialysisRecord> {
        return await haemodialysisRecordApi.addRecord(record);
    }

    async updateRecord(id: string, record: Partial<HaemodialysisRecord>): Promise<HaemodialysisRecord> {
        throw new Error('updateRecord not implemented in real service');
    }

    async deleteRecord(id: string): Promise<boolean> {
        throw new Error('deleteRecord not implemented in real service');
    }
} 