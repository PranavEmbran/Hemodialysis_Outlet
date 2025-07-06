import React, { useEffect, useState } from 'react';
import { billingServiceFactory } from '../services/billing/factory';
import { patientServiceFactory } from '../services/patient/factory';
import { historyServiceFactory } from '../services/history/factory';
import { scheduleServiceFactory } from '../services/schedule/factory';
import { loadData } from '../utils/loadData';
import MockDataManager from './MockDataManager';
import MockDataFileManager from './MockDataFileManager';
import DataFlowTest from './DataFlowTest';

const DataLoaderTest: React.FC = () => {
    const [billingData, setBillingData] = useState<any[]>([]);
    const [patientData, setPatientData] = useState<any[]>([]);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [scheduleData, setScheduleData] = useState<any[]>([]);
    const [staffData, setStaffData] = useState<any>(null);
    const [staticData, setStaticData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showFileManager, setShowFileManager] = useState(false);
    const [showDataFlowTest, setShowDataFlowTest] = useState(false);

    useEffect(() => {
        const testDataLoading = async () => {
            setLoading(true);

            try {
                // Test factory services
                const billingService = billingServiceFactory.getService();
                const patientService = patientServiceFactory.getService();
                const historyService = historyServiceFactory.getService();
                const scheduleService = scheduleServiceFactory.getService();

                // Test static data loading
                const staticBilling = await loadData('billing');
                const staticPatients = await loadData('patients');
                const staticHistory = await loadData('history');
                const staticAppointments = await loadData('appointments');

                setStaticData({
                    billing: staticBilling,
                    patients: staticPatients,
                    history: staticHistory,
                    appointments: staticAppointments
                });

                // Test service methods
                const [bills, patients, history, schedules, staff] = await Promise.all([
                    billingService.getAllBills(),
                    patientService.getAllPatients(),
                    historyService.getAllHistory(),
                    scheduleService.getAllSchedules(),
                    scheduleService.getStaff()
                ]);

                setBillingData(bills);
                setPatientData(patients);
                setHistoryData(history);
                setScheduleData(schedules);
                setStaffData(staff);

            } catch (error) {
                console.error('Error testing data loading:', error);
            } finally {
                setLoading(false);
            }
        };

        testDataLoading();
    }, []);

    const mode = import.meta.env.VITE_DATA_MODE || 'real';

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading test data...</div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h2>Data Loading Test</h2>
            <p><strong>Current Mode:</strong> {mode}</p>

            {/* Data Flow Test - always show */}
            <div className="mb-6">
                <button
                    onClick={() => setShowDataFlowTest(!showDataFlowTest)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-4"
                >
                    {showDataFlowTest ? 'Hide' : 'Show'} Data Flow Test
                </button>

                {showDataFlowTest && (
                    <div className="mt-4">
                        <DataFlowTest />
                    </div>
                )}
            </div>

            {/* Mock Data Manager - only show in mock mode */}
            {mode === 'mock' && (
                <div className="mb-6">
                    <MockDataManager />

                    <div className="mt-4">
                        <button
                            onClick={() => setShowFileManager(!showFileManager)}
                            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                        >
                            {showFileManager ? 'Hide' : 'Show'} File Manager
                        </button>

                        {showFileManager && (
                            <div className="mt-4">
                                <MockDataFileManager />
                            </div>
                        )}
                    </div>
                </div>
            )}

            <h3>Static Data (loadData utility):</h3>
            <div style={{ marginBottom: '20px' }}>
                <p><strong>Billing:</strong> {staticData?.billing?.length || 0} records</p>
                <p><strong>Patients:</strong> {staticData?.patients?.length || 0} records</p>
                <p><strong>History:</strong> {staticData?.history?.length || 0} records</p>
                <p><strong>Appointments:</strong> {staticData?.appointments?.length || 0} records</p>
            </div>

            <h3>Service Data (Factory Pattern):</h3>
            <div style={{ marginBottom: '20px' }}>
                <p><strong>Billing Service:</strong> {billingData.length} records</p>
                <p><strong>Patient Service:</strong> {patientData.length} records</p>
                <p><strong>History Service:</strong> {historyData.length} records</p>
                <p><strong>Schedule Service:</strong> {scheduleData.length} records</p>
                <p><strong>Staff Data:</strong> {staffData ? `${staffData.technicians?.length || 0} technicians, ${staffData.doctors?.length || 0} doctors, ${staffData.units?.length || 0} units` : 'Not loaded'}</p>
            </div>

            <h3>Sample Data:</h3>
            <div style={{ marginBottom: '20px' }}>
                {billingData.length > 0 && (
                    <div>
                        <p><strong>First Billing Record:</strong></p>
                        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
                            {JSON.stringify(billingData[0], null, 2)}
                        </pre>
                    </div>
                )}

                {patientData.length > 0 && (
                    <div>
                        <p><strong>First Patient Record:</strong></p>
                        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
                            {JSON.stringify(patientData[0], null, 2)}
                        </pre>
                    </div>
                )}

                {staffData && (
                    <div>
                        <p><strong>Staff Data:</strong></p>
                        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
                            {JSON.stringify(staffData, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            <h3>Environment Variables:</h3>
            <div style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
                <p>VITE_DATA_MODE: {import.meta.env.VITE_DATA_MODE || 'undefined'}</p>
                <p>NODE_ENV: {import.meta.env.NODE_ENV}</p>
                <p>BASE_URL: {import.meta.env.BASE_URL}</p>
            </div>

            {/* Test History Creation */}
            <h3>Test History Creation:</h3>
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={async () => {
                        try {
                            const historyService = historyServiceFactory.getService();
                            const newHistory = {
                                patientId: 'P001',
                                patientName: 'Test Patient',
                                date: new Date().toISOString().split('T')[0],
                                parameters: 'BP: 120/80, Weight: 70kg',
                                amount: '2000',
                                age: '44',
                                gender: 'Male',
                                notes: 'Test session',
                                nursingNotes: 'Test nursing notes',
                                isDeleted: 10
                            };
                            const result = await historyService.addHistory(newHistory);
                            console.log('Created history:', result);
                            alert('History created successfully! Check the History page.');
                        } catch (error) {
                            console.error('Error creating history:', error);
                            alert('Error creating history: ' + error);
                        }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Create Test History Record
                </button>

                <button
                    onClick={async () => {
                        try {
                            const historyService = historyServiceFactory.getService();
                            const allHistory = await historyService.getAllHistory();
                            console.log('All history records:', allHistory);
                            alert(`Found ${allHistory.length} history records. Check console for details.`);
                        } catch (error) {
                            console.error('Error fetching history:', error);
                            alert('Error fetching history: ' + error);
                        }
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
                >
                    Fetch All History
                </button>
            </div>
        </div>
    );
};

export default DataLoaderTest; 