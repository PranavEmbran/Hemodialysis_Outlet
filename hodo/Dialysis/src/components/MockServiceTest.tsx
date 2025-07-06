import React, { useState, useEffect } from 'react';
import { patientServiceFactory } from '../services/patient/factory';
import { billingServiceFactory } from '../services/billing/factory';
import { historyServiceFactory } from '../services/history/factory';
import { scheduleServiceFactory } from '../services/schedule/factory';
import type { Patient } from '../types';

const MockServiceTest: React.FC = () => {
    const [testResults, setTestResults] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const addResult = (message: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const runTests = async () => {
        setLoading(true);
        setTestResults([]);

        try {
            const patientService = patientServiceFactory.getService();
            const billingService = billingServiceFactory.getService();
            const historyService = historyServiceFactory.getService();
            const scheduleService = scheduleServiceFactory.getService();

            addResult('Starting mock service tests...');

            // Test 1: Get all patients
            try {
                const patients = await patientService.getAllPatients();
                addResult(`✅ getAllPatients: Found ${patients.length} patients`);
                console.log('Patients:', patients);
            } catch (error) {
                addResult(`❌ getAllPatients failed: ${error}`);
            }

            // Test 2: Get patient by ID (P001)
            try {
                const patient = await patientService.getPatientById('P001');
                addResult(`✅ getPatientById('P001'): Found patient ${patient.name}`);
            } catch (error) {
                addResult(`❌ getPatientById('P001') failed: ${error}`);
            }

            // Test 3: Update patient
            try {
                const updatedPatient = await patientService.updatePatient('P001', {
                    firstName: 'John Updated',
                    lastName: 'Doe Updated'
                });
                addResult(`✅ updatePatient('P001'): Updated to ${updatedPatient.firstName} ${updatedPatient.lastName}`);
            } catch (error) {
                addResult(`❌ updatePatient('P001') failed: ${error}`);
            }

            // Test 4: Soft delete patient
            try {
                const deleted = await patientService.softDeletePatient('P001');
                addResult(`✅ softDeletePatient('P001'): ${deleted ? 'Success' : 'Failed'}`);
            } catch (error) {
                addResult(`❌ softDeletePatient('P001') failed: ${error}`);
            }

            // Test 5: Get patients after soft delete
            try {
                const patientsAfterDelete = await patientService.getAllPatients();
                addResult(`✅ getAllPatients after delete: Found ${patientsAfterDelete.length} active patients`);
            } catch (error) {
                addResult(`❌ getAllPatients after delete failed: ${error}`);
            }

            // Test 6: Restore patient
            try {
                const restored = await patientService.restorePatient('P001');
                addResult(`✅ restorePatient('P001'): ${restored ? 'Success' : 'Failed'}`);
            } catch (error) {
                addResult(`❌ restorePatient('P001') failed: ${error}`);
            }

            // Test 7: Get patients after restore
            try {
                const patientsAfterRestore = await patientService.getAllPatients();
                addResult(`✅ getAllPatients after restore: Found ${patientsAfterRestore.length} active patients`);
            } catch (error) {
                addResult(`❌ getAllPatients after restore failed: ${error}`);
            }

            // Test 8: Test billing service
            try {
                const bills = await billingService.getAllBills();
                addResult(`✅ BillingService.getAllBills: Found ${bills.length} bills`);
            } catch (error) {
                addResult(`❌ BillingService.getAllBills failed: ${error}`);
            }

            // Test 9: Test history service
            try {
                const history = await historyService.getAllHistory();
                addResult(`✅ HistoryService.getAllHistory: Found ${history.length} records`);
            } catch (error) {
                addResult(`❌ HistoryService.getAllHistory failed: ${error}`);
            }

            // Test 10: Test schedule service
            try {
                const schedules = await scheduleService.getAllSchedules();
                addResult(`✅ ScheduleService.getAllSchedules: Found ${schedules.length} schedules`);
            } catch (error) {
                addResult(`❌ ScheduleService.getAllSchedules failed: ${error}`);
            }

            addResult('🎉 All tests completed!');

        } catch (error) {
            addResult(`❌ Test suite failed: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Mock Service Test</h2>
            <p>This component tests the mock services to ensure they handle patient IDs correctly.</p>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={runTests}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: loading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginRight: '10px'
                    }}
                >
                    {loading ? 'Running Tests...' : 'Run Tests'}
                </button>

                <button
                    onClick={clearResults}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Clear Results
                </button>
            </div>

            <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                padding: '15px',
                maxHeight: '400px',
                overflowY: 'auto'
            }}>
                <h4>Test Results:</h4>
                {testResults.length === 0 ? (
                    <p style={{ color: '#6c757d' }}>No test results yet. Click "Run Tests" to start.</p>
                ) : (
                    <div>
                        {testResults.map((result, index) => (
                            <div key={index} style={{
                                marginBottom: '5px',
                                fontFamily: 'monospace',
                                fontSize: '14px'
                            }}>
                                {result}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                <h4>Expected Behavior:</h4>
                <ul>
                    <li>✅ Should find patients with IDs like "P001", "P002"</li>
                    <li>✅ Should successfully update, soft delete, and restore patients</li>
                    <li>✅ Should maintain data consistency across all services</li>
                    <li>✅ Should provide helpful error messages if patient not found</li>
                </ul>
            </div>
        </div>
    );
};

export default MockServiceTest; 