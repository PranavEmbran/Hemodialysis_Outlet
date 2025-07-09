import React, { useState } from 'react';
import ButtonWithGradient from './ButtonWithGradient';
import HistoryDetailsModal from './HistoryDetailsModal';
import type { History } from '../types';

const HistoryDetailsModalTest: React.FC = () => {
    const [showModal, setShowModal] = useState(false);

    // Sample history data for testing
    const sampleHistoryData: History = {
        id: "1751607290465",
        patientId: "20250704/002",
        patientName: "Keerthi Shankar",
        date: "2025-07-04",
        startTime: "11:05",
        endTime: "13:05",
        vitalSigns: {
            preDialysis: {
                bloodPressure: "123",
                heartRate: 234,
                temperature: 345,
                weight: 456
            },
            postDialysis: {
                bloodPressure: "123",
                heartRate: 234,
                temperature: 345,
                weight: 456
            }
        },
        treatmentParameters: {
            dialyzer: "111",
            bloodFlow: 222,
            dialysateFlow: 333,
            ultrafiltration: 444
        },
        nursingNotes: "Test first",
        parameters: "Test parameters",
        amount: "1000",
        age: "25",
        gender: "Female"
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>History Details Modal Test</h2>
            <p>Click the button below to test the modal functionality:</p>

            <ButtonWithGradient
                onClick={() => setShowModal(true)}
                className="mb-3"
            >
                <i className="fa fa-eye me-2"></i>
                Test History Details Modal
            </ButtonWithGradient>

            <HistoryDetailsModal
                show={showModal}
                onHide={() => setShowModal(false)}
                historyData={sampleHistoryData}
            />

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <h4>Test Data Preview:</h4>
                <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                    {JSON.stringify(sampleHistoryData, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default HistoryDetailsModalTest; 