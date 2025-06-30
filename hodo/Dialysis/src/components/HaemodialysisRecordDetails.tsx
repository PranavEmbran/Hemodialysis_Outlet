import React, { useState, useEffect, type ChangeEvent } from 'react';
import { patientsApi } from '../api/patientsApi';
import type { Patient } from '../types';
import { haemodialysisRecordApi } from '../api/haemodialysisRecordApi';
import ButtonWithGradient from './ButtonWithGradient';
import './HaemodialysisRecordDetails.css';

interface Row {
  id: number;
  time: string;
  bp: string;
  pulse: string;
  temperature: string;
  venousPressure: string;
  negativePressure: string;
  tmp: string;
  heparin: string;
  medicationRemarks: string;
}

const HaemodialysisRecordDetails: React.FC = () => {
  const createNewRow = (): Row => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    return {
      id: now.getTime(),
      time: time,
      bp: '',
      pulse: '',
      temperature: '',
      venousPressure: '',
      negativePressure: '',
      tmp: '',
      heparin: '',
      medicationRemarks: '',
    };
  };

  const [rows, setRows] = useState<Row[]>([createNewRow()]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    patientsApi.getAllPatients()
      .then(setPatients)
      .catch(() => setError('Failed to fetch patients'))
      .finally(() => setLoading(false));
  }, []);

  const handlePatientChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPatientId(e.target.value);
  };

  const handleAddRow = () => {
    setRows([...rows, createNewRow()]);
  };

  const handleRowChange = (id: number, field: keyof Row, value: string) => {
    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setRows(updatedRows);
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    if (!selectedPatientId) {
      setError('Please select a patient.');
      return;
    }
    const patient = patients.find(p => String(p.id) === String(selectedPatientId));
    if (!patient) {
      setError('Invalid patient selected.');
      return;
    }
    const record = {
      patientId: selectedPatientId,
      patientName: (patient.firstName || patient.name) + (patient.lastName ? ' ' + patient.lastName : ''),
      date: new Date().toISOString().split('T')[0],
      rows: rows,
    };
    try {
      await haemodialysisRecordApi.addRecord(record);
      setSuccess('Record saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save record. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="haemodialysis-record-content">
      {/* <div className="haemodialysis-record-header">
        <h2 className="haemodialysis-record-title">Haemodialysis Record Details</h2>
      </div> */}
      <div className="haemodialysis-record-form-container">
        {/* Patient Dropdown */}
        <div className="form-field" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="patient-select"><strong>Select Patient</strong></label>
          <select
            id="patient-select"
            value={selectedPatientId}
            onChange={handlePatientChange}
            disabled={loading}
            style={{ marginLeft: '1rem', minWidth: '200px' }}
          >
            <option value="">-- Select Patient --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {(p.firstName || p.name) + (p.lastName ? ' ' + p.lastName : '')}
              </option>
            ))}
          </select>
        </div>
        {/* Selected Patient Info */}
        {selectedPatientId && (
          <div className="selected-patient-info" style={{ marginBottom: '1.5rem', background: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
            <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>Selected Patient Information</h4>
            {(() => {
              const selectedPatient = patients.find(p => String(p.id) === String(selectedPatientId));
              if (!selectedPatient) return null;
              return (
                <div className="patient-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <div><strong>Name:</strong> {(selectedPatient.firstName || selectedPatient.name) + (selectedPatient.lastName ? ' ' + selectedPatient.lastName : '')}</div>
                  <div><strong>Gender:</strong> {selectedPatient.gender || 'N/A'}</div>
                  <div><strong>Blood Group:</strong> {selectedPatient.bloodGroup || 'N/A'}</div>
                  <div><strong>Mobile:</strong> {selectedPatient.mobileNo || selectedPatient.phone || 'N/A'}</div>
                  <div><strong>Date of Birth:</strong> {selectedPatient.dateOfBirth || 'N/A'}</div>
                  <div><strong>Catheter Date:</strong> {selectedPatient.catheterDate || selectedPatient.catheterInsertionDate || 'N/A'}</div>
                  <div><strong>Fistula Date:</strong> {selectedPatient.fistulaDate || selectedPatient.fistulaCreationDate || 'N/A'}</div>
                </div>
              );
            })()}
          </div>
        )}
        <div className="record-table-wrapper">
          <table className="record-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>B.P.</th>
                <th>Pulse</th>
                <th>Temp</th>
                <th>Venous Pressure</th>
                <th>Negative Pressure</th>
                <th>TMP</th>
                <th>Heparin</th>
                <th>Medication & Remarks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><input type="time" value={row.time} onChange={(e: ChangeEvent<HTMLInputElement>) => handleRowChange(row.id, 'time', e.target.value)} /></td>
                  <td><input type="text" value={row.bp} onChange={(e: ChangeEvent<HTMLInputElement>) => handleRowChange(row.id, 'bp', e.target.value)} placeholder="e.g., 120/80" /></td>
                  <td><input type="number" value={row.pulse} onChange={(e: ChangeEvent<HTMLInputElement>) => handleRowChange(row.id, 'pulse', e.target.value)} /></td>
                  <td><input type="number" value={row.temperature} onChange={(e: ChangeEvent<HTMLInputElement>) => handleRowChange(row.id, 'temperature', e.target.value)} /></td>
                  <td><input type="number" value={row.venousPressure} onChange={(e: ChangeEvent<HTMLInputElement>) => handleRowChange(row.id, 'venousPressure', e.target.value)} /></td>
                  <td><input type="number" value={row.negativePressure} onChange={(e: ChangeEvent<HTMLInputElement>) => handleRowChange(row.id, 'negativePressure', e.target.value)} /></td>
                  <td><input type="number" value={row.tmp} onChange={(e: ChangeEvent<HTMLInputElement>) => handleRowChange(row.id, 'tmp', e.target.value)} /></td>
                  <td><input type="text" value={row.heparin} onChange={(e: ChangeEvent<HTMLInputElement>) => handleRowChange(row.id, 'heparin', e.target.value)} /></td>
                  <td><textarea value={row.medicationRemarks} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleRowChange(row.id, 'medicationRemarks', e.target.value)}></textarea></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="form-actions">
          <ButtonWithGradient onClick={handleAddRow} className="btn-add-row" text="Add Row" />
          <div className="action-buttons">
            <ButtonWithGradient onClick={handleSave} className="btn-save" disabled={!selectedPatientId} text="Save" />
            <ButtonWithGradient onClick={handlePrint} className="btn-print-record" text="Print" />
          </div>
        </div>
      </div>
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default HaemodialysisRecordDetails; 