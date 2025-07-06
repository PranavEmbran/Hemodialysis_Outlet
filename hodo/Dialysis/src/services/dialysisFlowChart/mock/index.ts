import { loadData } from '../../../utils/loadData';
import type { DialysisFlowChart, DialysisFlowChartService } from '../dialysisFlowChartService';

// In-memory storage for mock data
let mockCharts: DialysisFlowChart[] = [];

export class MockDialysisFlowChartService implements DialysisFlowChartService {
    async getAllDialysisFlowCharts(): Promise<DialysisFlowChart[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Load from static mock data first
        try {
            const staticData = await loadData('dialysisFlowCharts');
            if (staticData && staticData.length > 0) {
                console.log('MockDialysisFlowChartService: Loaded from static data');
                return staticData;
            }
        } catch (error) {
            console.warn('MockDialysisFlowChartService: Failed to load static data, using default');
        }

        // Fallback to in-memory default data
        if (mockCharts.length === 0) {
            mockCharts = [
                {
                    id: '1',
                    patientId: 'P001',
                    patientName: 'John Doe',
                    date: '2024-01-15',
                    hemodialysisNIO: 'HD001',
                    bloodAccess: 'AV Fistula',
                    hdStartingTime: '09:00',
                    hdClosingTime: '13:00',
                    durationHours: '4',
                    bloodFlowRate: '300',
                    injHeparinPrime: '2000',
                    injHeparinBolus: '1000',
                    startingWithSaline: true,
                    closingWithAir: false,
                    closingWithSaline: true,
                    bloodTransfusion: false,
                    bloodTransfusionComment: '',
                    bpBeforeDialysis: '120/80',
                    bpAfterDialysis: '110/70',
                    bpDuringDialysis: '115/75',
                    weightPreDialysis: '75.5',
                    weightPostDialysis: '73.2',
                    weightLoss: '2.3',
                    dryWeight: '72.0',
                    weightGain: '3.5',
                    dialysisMonitorNameFO: 'Monitor A',
                    dialysisNameSize: 'F8',
                    dialysisNumberOfRefuse: '2',
                    bloodTubeNumberOfRefuse: '1',
                    dialysisFlowRate: '500',
                    bathacetete: 'Bath A',
                    bathBicarb: '35',
                    naConductivity: '14.0',
                    profilesNo: 'P001',
                    equipmentsComplaints: 'None',
                    patientsComplaints: 'None',
                    spo2: '98',
                    fever: false,
                    rigor: false,
                    hypertension: false,
                    hypoglycemia: false,
                    deptInChargeSign: 'Dr. Smith'
                },
                {
                    id: '2',
                    patientId: 'P002',
                    patientName: 'Jane Smith',
                    date: '2024-01-16',
                    hemodialysisNIO: 'HD002',
                    bloodAccess: 'Catheter',
                    hdStartingTime: '10:00',
                    hdClosingTime: '14:00',
                    durationHours: '4',
                    bloodFlowRate: '280',
                    injHeparinPrime: '1800',
                    injHeparinBolus: '800',
                    startingWithSaline: true,
                    closingWithAir: true,
                    closingWithSaline: false,
                    bloodTransfusion: false,
                    bloodTransfusionComment: '',
                    bpBeforeDialysis: '118/78',
                    bpAfterDialysis: '105/68',
                    bpDuringDialysis: '112/73',
                    weightPreDialysis: '68.0',
                    weightPostDialysis: '65.8',
                    weightLoss: '2.2',
                    dryWeight: '65.0',
                    weightGain: '3.0',
                    dialysisMonitorNameFO: 'Monitor B',
                    dialysisNameSize: 'F6',
                    dialysisNumberOfRefuse: '1',
                    bloodTubeNumberOfRefuse: '0',
                    dialysisFlowRate: '450',
                    bathacetete: 'Bath B',
                    bathBicarb: '32',
                    naConductivity: '13.5',
                    profilesNo: 'P002',
                    equipmentsComplaints: 'None',
                    patientsComplaints: 'Slight dizziness',
                    spo2: '97',
                    fever: false,
                    rigor: false,
                    hypertension: false,
                    hypoglycemia: false,
                    deptInChargeSign: 'Dr. Johnson'
                }
            ];
        }

        console.log('MockDialysisFlowChartService: Using in-memory data');
        return mockCharts;
    }

    async getDialysisFlowChartById(id: string): Promise<DialysisFlowChart> {
        const charts = await this.getAllDialysisFlowCharts();
        const chart = charts.find(c => c.id === id);
        if (!chart) {
            throw new Error('Dialysis flow chart not found');
        }
        return chart;
    }

    async addDialysisFlowChart(chart: Omit<DialysisFlowChart, 'id'>): Promise<DialysisFlowChart> {
        const newChart: DialysisFlowChart = {
            ...chart,
            id: Date.now().toString()
        };
        mockCharts.push(newChart);
        return newChart;
    }

    async updateDialysisFlowChart(id: string, chart: Partial<DialysisFlowChart>): Promise<DialysisFlowChart> {
        const index = mockCharts.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error('Dialysis flow chart not found');
        }
        mockCharts[index] = { ...mockCharts[index], ...chart };
        return mockCharts[index];
    }

    async deleteDialysisFlowChart(id: string): Promise<boolean> {
        const index = mockCharts.findIndex(c => c.id === id);
        if (index === -1) {
            return false;
        }
        mockCharts.splice(index, 1);
        return true;
    }
} 