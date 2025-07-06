import React, { useState, useEffect } from 'react';
import { useDialysis } from '../context/DialysisContext';
import { scheduleServiceFactory } from '../services/schedule/factory';
import { historyServiceFactory } from '../services/history/factory';

const DataFlowTest: React.FC = () => {
    const { appointments, history, patients, refreshAppointments, refreshHistory, refreshPatients } = useDialysis();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [testResults, setTestResults] = useState<string[]>([]);

    const addResult = (message: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const runDataFlowTest = async () => {
        setLoading(true);
        setError('');
        setTestResults([]);

        try {
            addResult('Starting data flow test...');

            // Test 1: Check if services are properly configured
            const scheduleService = scheduleServiceFactory.getService();
            const historyService = historyServiceFactory.getService();
            addResult(`Schedule Service: ${scheduleService.constructor.name}`);
            addResult(`History Service: ${historyService.constructor.name}`);

            // Test 2: Check current data in context
            addResult(`Patients in context: ${patients.length}`);
            addResult(`Appointments in context: ${appointments.length}`);
            addResult(`History in context: ${history.length}`);

            // Test 3: Test direct service calls
            addResult('Testing direct service calls...');
            const [directAppointments, directHistory] = await Promise.all([
                scheduleService.getAllSchedules(),
                historyService.getAllHistory()
            ]);
            addResult(`Direct appointments: ${directAppointments.length}`);
            addResult(`Direct history: ${directHistory.length}`);

            // Test 4: Test refresh functions
            addResult('Testing refresh functions...');
            await Promise.all([
                refreshAppointments(),
                refreshHistory(),
                refreshPatients()
            ]);
            addResult('Refresh functions completed');

            // Test 5: Check data after refresh
            addResult(`Patients after refresh: ${patients.length}`);
            addResult(`Appointments after refresh: ${appointments.length}`);
            addResult(`History after refresh: ${history.length}`);

            // Test 6: Check for data consistency
            const contextAppointments = appointments.length;
            const contextHistory = history.length;
            const directAppointmentsCount = directAppointments.length;
            const directHistoryCount = directHistory.length;

            if (contextAppointments === directAppointmentsCount) {
                addResult('✅ Appointments data is consistent');
            } else {
                addResult(`❌ Appointments data mismatch: Context=${contextAppointments}, Direct=${directAppointmentsCount}`);
            }

            if (contextHistory === directHistoryCount) {
                addResult('✅ History data is consistent');
            } else {
                addResult(`❌ History data mismatch: Context=${contextHistory}, Direct=${directHistoryCount}`);
            }

            addResult('🎉 Data flow test completed!');

        } catch (error) {
            console.error('Data flow test error:', error);
            setError(`Test failed: ${error}`);
            addResult(`❌ Test failed: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => {
        setTestResults([]);
        setError('');
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">🔍 Data Flow Test</h2>

            <div className="mb-4">
                <button
                    onClick={runDataFlowTest}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Running Test...' : 'Run Data Flow Test'}
                </button>

                <button
                    onClick={clearResults}
                    className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Clear Results
                </button>
            </div>

            {error && (
                <div className="p-3 mb-4 bg-red-100 text-red-800 rounded">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Current Data Status:</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 rounded">
                        <strong>Patients:</strong> {patients.length}
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                        <strong>Appointments:</strong> {appointments.length}
                    </div>
                    <div className="p-3 bg-yellow-50 rounded">
                        <strong>History:</strong> {history.length}
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
                {testResults.length === 0 ? (
                    <p className="text-gray-500">No test results yet. Click "Run Data Flow Test" to start.</p>
                ) : (
                    <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
                        {testResults.map((result, index) => (
                            <div key={index} className="mb-1 font-mono text-sm">
                                {result}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="font-semibold text-blue-800 mb-2">What This Test Does:</h3>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                    <li>Checks if services are properly configured</li>
                    <li>Compares context data with direct service calls</li>
                    <li>Tests refresh functions</li>
                    <li>Verifies data consistency</li>
                    <li>Identifies where data flow might be broken</li>
                </ul>
            </div>
        </div>
    );
};

export default DataFlowTest; 