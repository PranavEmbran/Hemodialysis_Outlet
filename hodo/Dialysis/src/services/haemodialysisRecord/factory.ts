import { MockHaemodialysisRecordService } from './mock';
import { RealHaemodialysisRecordService } from './real';
import type { HaemodialysisRecordService } from './haemodialysisRecordService';

class HaemodialysisRecordServiceFactory {
    private static instance: HaemodialysisRecordService | null = null;

    static getService(): HaemodialysisRecordService {
        if (!HaemodialysisRecordServiceFactory.instance) {
            const dataMode = import.meta.env.VITE_DATA_MODE;

            if (dataMode === 'mock') {
                console.log('HaemodialysisRecordServiceFactory: Using mock service');
                HaemodialysisRecordServiceFactory.instance = new MockHaemodialysisRecordService();
            } else {
                console.log('HaemodialysisRecordServiceFactory: Using real service');
                HaemodialysisRecordServiceFactory.instance = new RealHaemodialysisRecordService();
            }
        }

        return HaemodialysisRecordServiceFactory.instance;
    }

    static reset(): void {
        HaemodialysisRecordServiceFactory.instance = null;
    }
}

export const haemodialysisRecordServiceFactory = HaemodialysisRecordServiceFactory; 