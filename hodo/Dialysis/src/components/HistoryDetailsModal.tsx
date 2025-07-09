import React from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import ButtonWithGradient from './ButtonWithGradient';
import Cards from './Cards';
import type { History } from '../types';
import '../styles/EditModal.css';
import '../styles/HistoryDetailsModal.css';

interface HistoryDetailsModalProps {
    show: boolean;
    onHide: () => void;
    historyData: History | null;
}

const HistoryDetailsModal: React.FC<HistoryDetailsModalProps> = ({ show, onHide, historyData }) => {
    if (!historyData) return null;

    const formatVitalSigns = (vitalSigns: any, type: string) => {
        if (!vitalSigns) return null;

        return (
            <div className="summary-card mb-3">
                <div className="summary-title">{type} Vital Signs</div>
                <Row>
                    <Col md={6}>
                        <div className="summary-value">
                            <strong>Blood Pressure:</strong> {vitalSigns.bloodPressure || 'Not recorded'}
                        </div>
                        <div className="summary-value">
                            <strong>Heart Rate:</strong> {vitalSigns.heartRate || 'Not recorded'}
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="summary-value">
                            <strong>Temperature:</strong> {vitalSigns.temperature || 'Not recorded'}
                        </div>
                        <div className="summary-value">
                            <strong>Weight:</strong> {vitalSigns.weight || 'Not recorded'}
                        </div>
                    </Col>
                </Row>
            </div>
        );
    };

    const formatTreatmentParameters = (treatmentParams: any) => {
        if (!treatmentParams) return null;

        return (
            <div className="summary-card mb-3">
                <div className="summary-title">Treatment Parameters</div>
                <Row>
                    <Col md={6}>
                        <div className="summary-value">
                            <strong>Dialyzer:</strong> {treatmentParams.dialyzer || 'Not recorded'}
                        </div>
                        <div className="summary-value">
                            <strong>Blood Flow:</strong> {treatmentParams.bloodFlow || 'Not recorded'}
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="summary-value">
                            <strong>Dialysate Flow:</strong> {treatmentParams.dialysateFlow || 'Not recorded'}
                        </div>
                        <div className="summary-value">
                            <strong>Ultrafiltration:</strong> {treatmentParams.ultrafiltration || 'Not recorded'}
                        </div>
                    </Col>
                </Row>
            </div>
        );
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="edit-modal history-details-modal">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="fa fa-user-md me-2"></i>
                    Dialysis Session Details
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {historyData && (
                    <div>
                        {/* Basic Information */}
                        <div className="summary-card mb-3">
                            <div className="summary-title">Session Information</div>
                            <Row>
                                <Col md={6}>
                                    <div className="summary-value">
                                        <strong>Patient Name:</strong> {historyData.patientName}
                                    </div>
                                    <div className="summary-value">
                                        <strong>Patient ID:</strong> {historyData.patientId}
                                    </div>
                                    <div className="summary-value">
                                        <strong>Date:</strong> {historyData.date}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="summary-value">
                                        <strong>Start Time:</strong> {historyData.startTime || 'Not recorded'}
                                    </div>
                                    <div className="summary-value">
                                        <strong>End Time:</strong> {historyData.endTime || 'Not recorded'}
                                    </div>
                                    <div className="summary-value">
                                        <strong>Session ID:</strong> {historyData.id}
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {/* Pre-Dialysis Vital Signs */}
                        {historyData.vitalSigns && formatVitalSigns(historyData.vitalSigns.preDialysis, 'Pre-Dialysis')}

                        {/* Post-Dialysis Vital Signs */}
                        {historyData.vitalSigns && formatVitalSigns(historyData.vitalSigns.postDialysis, 'Post-Dialysis')}

                        {/* Treatment Parameters */}
                        {formatTreatmentParameters(historyData.treatmentParameters)}

                        {/* Additional Information */}
                        <div className="summary-card mb-3">
                            <div className="summary-title">Additional Information</div>
                            <Row>
                                <Col md={6}>
                                    <div className="summary-value">
                                        <strong>Parameters:</strong> {historyData.parameters || 'Not recorded'}
                                    </div>
                                    <div className="summary-value">
                                        <strong>Amount:</strong> {historyData.amount || 'Not recorded'}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="summary-value">
                                        <strong>Age:</strong> {historyData.age || 'Not recorded'}
                                    </div>
                                    <div className="summary-value">
                                        <strong>Gender:</strong> {historyData.gender || 'Not recorded'}
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={12}>
                                    <div className="summary-value">
                                        <strong>Notes:</strong> {historyData.notes || 'No notes'}
                                    </div>
                                    <div className="summary-value">
                                        <strong>Nursing Notes:</strong> {historyData.nursingNotes || 'No nursing notes'}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                )}
            </Modal.Body>

            <div className="modal-footer">
                <ButtonWithGradient
                    onClick={onHide}
                    className="btn-outline"
                    type="button"
                    aria-label="Close"
                >
                    <i className="fa fa-times me-2"></i>
                    Close
                </ButtonWithGradient>
                <ButtonWithGradient
                    onClick={onHide}
                    type="button"
                    aria-label="Print Details"
                >
                    <i className="fa fa-print me-2"></i>
                    Print Details
                </ButtonWithGradient>
            </div>
        </Modal>
    );
};

export default HistoryDetailsModal; 