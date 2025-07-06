import { MockDialysisFlowChartService } from './mock';
import { RealDialysisFlowChartService } from './real';
import type { DialysisFlowChartService } from './dialysisFlowChartService';

class DialysisFlowChartServiceFactory {
    private static instance: DialysisFlowChartService | null = null;

    static getService(): DialysisFlowChartService {
        if (!DialysisFlowChartServiceFactory.instance) {
            const dataMode = import.meta.env.VITE_DATA_MODE;

            if (dataMode === 'mock') {
                console.log('DialysisFlowChartServiceFactory: Using mock service');
                DialysisFlowChartServiceFactory.instance = new MockDialysisFlowChartService();
            } else {
                console.log('DialysisFlowChartServiceFactory: Using real service');
                DialysisFlowChartServiceFactory.instance = new RealDialysisFlowChartService();
            }
        }

        return DialysisFlowChartServiceFactory.instance;
    }

    static reset(): void {
        DialysisFlowChartServiceFactory.instance = null;
    }
}

export const dialysisFlowChartServiceFactory = DialysisFlowChartServiceFactory; 