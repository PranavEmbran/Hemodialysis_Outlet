import { API_URL } from '../config';

interface DialysisFlowChart {
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

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function fetchWithRetry(url: string, options: RequestInit = {}, retries: number = MAX_RETRIES): Promise<any> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export const dialysisFlowChartApi = {
  async getAllDialysisFlowCharts(): Promise<DialysisFlowChart[]> {
    try {
      return await fetchWithRetry(`${API_URL}/dialysis-flow-charts`);
    } catch (error) {
      console.error('Error fetching dialysis flow charts:', error);
      throw new Error('Failed to fetch dialysis flow charts. Please check if the server is running.');
    }
  },

  async getDialysisFlowChartById(id: string): Promise<DialysisFlowChart> {
    try {
      return await fetchWithRetry(`${API_URL}/dialysis-flow-charts/${id}`);
    } catch (error) {
      console.error('Error fetching dialysis flow chart:', error);
      throw new Error('Failed to fetch dialysis flow chart details.');
    }
  },

  async addDialysisFlowChart(dialysisFlowChartData: Omit<DialysisFlowChart, 'id'>): Promise<DialysisFlowChart> {
    try {
      return await fetchWithRetry(`${API_URL}/dialysis-flow-charts`, {
        method: 'POST',
        body: JSON.stringify(dialysisFlowChartData),
      });
    } catch (error) {
      console.error('Error adding dialysis flow chart:', error);
      throw new Error('Failed to save dialysis flow chart. Please check your connection and try again.');
    }
  },

  async updateDialysisFlowChart(id: string, dialysisFlowChartData: Partial<DialysisFlowChart>): Promise<DialysisFlowChart> {
    try {
      return await fetchWithRetry(`${API_URL}/dialysis-flow-charts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dialysisFlowChartData),
      });
    } catch (error) {
      console.error('Error updating dialysis flow chart:', error);
      throw new Error('Failed to update dialysis flow chart details.');
    }
  },

  async deleteDialysisFlowChart(id: string): Promise<boolean> {
    try {
      return await fetchWithRetry(`${API_URL}/dialysis-flow-charts/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting dialysis flow chart:', error);
      throw new Error('Failed to delete dialysis flow chart.');
    }
  }
}; 