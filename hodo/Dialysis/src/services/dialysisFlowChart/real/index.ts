import { dialysisFlowChartApi } from '../../../api/dialysisFlowChartApi';
import type { DialysisFlowChart, DialysisFlowChartService } from '../dialysisFlowChartService';

export class RealDialysisFlowChartService implements DialysisFlowChartService {
    async getAllDialysisFlowCharts(): Promise<DialysisFlowChart[]> {
        return await dialysisFlowChartApi.getAllDialysisFlowCharts();
    }

    async getDialysisFlowChartById(id: string): Promise<DialysisFlowChart> {
        return await dialysisFlowChartApi.getDialysisFlowChartById(id);
    }

    async addDialysisFlowChart(chart: Omit<DialysisFlowChart, 'id'>): Promise<DialysisFlowChart> {
        return await dialysisFlowChartApi.addDialysisFlowChart(chart);
    }

    async updateDialysisFlowChart(id: string, chart: Partial<DialysisFlowChart>): Promise<DialysisFlowChart> {
        return await dialysisFlowChartApi.updateDialysisFlowChart(id, chart);
    }

    async deleteDialysisFlowChart(id: string): Promise<boolean> {
        return await dialysisFlowChartApi.deleteDialysisFlowChart(id);
    }
} 