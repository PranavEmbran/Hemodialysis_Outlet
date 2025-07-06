import { API_URL } from '../config';
import { mockData } from '../mock/api';

// Types for the data structure
interface MockData {
    patients: any[];
    appointments: any[];
    billing: any[];
    history: any[];
    dialysisFlowCharts?: any[];
    haemodialysisRecords?: any[];
}

/**
 * Loads data based on the VITE_DATA_MODE environment variable
 * - 'mock': Loads from in-memory mock data with localStorage persistence
 * - 'real': Loads from API endpoints
 * 
 * @param resource - The resource to load (e.g., 'patients', 'billing')
 * @returns Promise with the loaded data array
 */
export const loadData = async (resource: string): Promise<any[]> => {
    const mode = import.meta.env.VITE_DATA_MODE || 'real';

    console.log(`Loading ${resource} in ${mode} mode`);

    try {
        if (mode === 'mock') {
            // Load from in-memory mock data
            const data = (mockData as any)[resource] || [];
            const activeData = data.filter((item: any) => item.isDeleted !== 0);
            console.log(`Loaded ${activeData.length} ${resource} from mock data`);
            return activeData;
        } else {
            // Load from API
            const response = await fetch(`${API_URL}/${resource}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${resource} from API: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`Loaded ${data.length} ${resource} from API`);
            return data;
        }
    } catch (error) {
        console.error(`Error loading ${resource}:`, error);
        throw error;
    }
};

/**
 * Loads all data resources at once (useful for initial app load)
 */
export const loadAllData = async (): Promise<MockData> => {
    const mode = import.meta.env.VITE_DATA_MODE || 'real';

    console.log(`Loading all data in ${mode} mode`);

    try {
        if (mode === 'mock') {
            // Load from in-memory mock data
            const data = {
                patients: mockData.patients.filter((p: any) => p.isDeleted !== 0),
                appointments: mockData.appointments.filter((a: any) => a.isDeleted !== 0),
                billing: mockData.billing.filter((b: any) => b.isDeleted !== 0),
                history: mockData.history.filter((h: any) => h.isDeleted !== 0),
                dialysisFlowCharts: [],
                haemodialysisRecords: []
            };

            console.log('Loaded all data from mock data');
            return data;
        } else {
            // Load from API endpoints
            const [patients, appointments, billing, history] = await Promise.all([
                fetch(`${API_URL}/patients`).then(r => r.json()),
                fetch(`${API_URL}/schedules`).then(r => r.json()),
                fetch(`${API_URL}/billing`).then(r => r.json()),
                fetch(`${API_URL}/history`).then(r => r.json())
            ]);

            const data = {
                patients,
                appointments,
                billing,
                history,
                dialysisFlowCharts: [],
                haemodialysisRecords: []
            };

            console.log('Loaded all data from API');
            return data;
        }
    } catch (error) {
        console.error('Error loading all data:', error);
        throw error;
    }
}; 