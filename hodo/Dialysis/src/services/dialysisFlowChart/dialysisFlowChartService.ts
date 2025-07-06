export interface DialysisFlowChart {
    id?: string;
    patientId: string;
    patientName: string;
    date: string;
    hemodialysisNIO: string;
    bloodAccess: string;
    hdStartingTime: string;
    hdClosingTime: string;
    durationHours: string;
    bloodFlowRate: string;
    injHeparinPrime: string;
    injHeparinBolus: string;
    startingWithSaline: boolean;
    closingWithAir: boolean;
    closingWithSaline: boolean;
    bloodTransfusion: boolean;
    bloodTransfusionComment: string;
    bpBeforeDialysis: string;
    bpAfterDialysis: string;
    bpDuringDialysis: string;
    weightPreDialysis: string;
    weightPostDialysis: string;
    weightLoss: string;
    dryWeight: string;
    weightGain: string;
    dialysisMonitorNameFO: string;
    dialysisNameSize: string;
    dialysisNumberOfRefuse: string;
    bloodTubeNumberOfRefuse: string;
    dialysisFlowRate: string;
    bathacetete: string;
    bathBicarb: string;
    naConductivity: string;
    profilesNo: string;
    equipmentsComplaints: string;
    patientsComplaints: string;
    spo2: string;
    fever: boolean;
    rigor: boolean;
    hypertension: boolean;
    hypoglycemia: boolean;
    deptInChargeSign: string;
}

export interface DialysisFlowChartService {
    getAllDialysisFlowCharts(): Promise<DialysisFlowChart[]>;
    getDialysisFlowChartById(id: string): Promise<DialysisFlowChart>;
    addDialysisFlowChart(chart: Omit<DialysisFlowChart, 'id'>): Promise<DialysisFlowChart>;
    updateDialysisFlowChart(id: string, chart: Partial<DialysisFlowChart>): Promise<DialysisFlowChart>;
    deleteDialysisFlowChart(id: string): Promise<boolean>;
} 