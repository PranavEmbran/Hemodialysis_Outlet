export interface HaemodialysisRecord {
    id?: string;
    patientId: string;
    patientName: string;
    date: string;
    rows: Array<{
        time: string;
        bp: string;
        pulse: string;
        temperature: string;
        venousPressure: string;
        negativePressure: string;
        tmp: string;
        heparin: string;
        medicationRemarks: string;
    }>;
}

export interface HaemodialysisRecordService {
    getAllRecords(): Promise<HaemodialysisRecord[]>;
    getRecordById(id: string): Promise<HaemodialysisRecord>;
    addRecord(record: Omit<HaemodialysisRecord, 'id'>): Promise<HaemodialysisRecord>;
    updateRecord(id: string, record: Partial<HaemodialysisRecord>): Promise<HaemodialysisRecord>;
    deleteRecord(id: string): Promise<boolean>;
} 