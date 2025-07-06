import { loadData } from '../../../utils/loadData';
import type { HaemodialysisRecord, HaemodialysisRecordService } from '../haemodialysisRecordService';

// In-memory storage for mock data
let mockRecords: HaemodialysisRecord[] = [];

export class MockHaemodialysisRecordService implements HaemodialysisRecordService {
    async getAllRecords(): Promise<HaemodialysisRecord[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Load from static mock data first
        try {
            const staticData = await loadData('haemodialysisRecords');
            if (staticData && staticData.length > 0) {
                console.log('MockHaemodialysisRecordService: Loaded from static data');
                return staticData;
            }
        } catch (error) {
            console.warn('MockHaemodialysisRecordService: Failed to load static data, using default');
        }

        // Fallback to in-memory default data
        if (mockRecords.length === 0) {
            mockRecords = [
                {
                    id: '1',
                    patientId: 'P001',
                    patientName: 'John Doe',
                    date: '2024-01-15',
                    rows: [
                        {
                            time: '09:00',
                            bp: '120/80',
                            pulse: '72',
                            temperature: '36.8',
                            venousPressure: '150',
                            negativePressure: '200',
                            tmp: '180',
                            heparin: '2000',
                            medicationRemarks: 'Routine session'
                        }
                    ]
                },
                {
                    id: '2',
                    patientId: 'P002',
                    patientName: 'Jane Smith',
                    date: '2024-01-16',
                    rows: [
                        {
                            time: '10:00',
                            bp: '118/78',
                            pulse: '70',
                            temperature: '36.9',
                            venousPressure: '145',
                            negativePressure: '195',
                            tmp: '175',
                            heparin: '1800',
                            medicationRemarks: 'Stable condition'
                        }
                    ]
                }
            ];
        }

        console.log('MockHaemodialysisRecordService: Using in-memory data');
        return mockRecords;
    }

    async getRecordById(id: string): Promise<HaemodialysisRecord> {
        const records = await this.getAllRecords();
        const record = records.find(r => r.id === id);
        if (!record) {
            throw new Error('Record not found');
        }
        return record;
    }

    async addRecord(record: Omit<HaemodialysisRecord, 'id'>): Promise<HaemodialysisRecord> {
        const newRecord: HaemodialysisRecord = {
            ...record,
            id: Date.now().toString()
        };
        mockRecords.push(newRecord);
        return newRecord;
    }

    async updateRecord(id: string, record: Partial<HaemodialysisRecord>): Promise<HaemodialysisRecord> {
        const index = mockRecords.findIndex(r => r.id === id);
        if (index === -1) {
            throw new Error('Record not found');
        }
        mockRecords[index] = { ...mockRecords[index], ...record };
        return mockRecords[index];
    }

    async deleteRecord(id: string): Promise<boolean> {
        const index = mockRecords.findIndex(r => r.id === id);
        if (index === -1) {
            return false;
        }
        mockRecords.splice(index, 1);
        return true;
    }
} 