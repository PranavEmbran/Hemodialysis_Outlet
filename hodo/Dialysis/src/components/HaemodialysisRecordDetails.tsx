import React, { useEffect, useState } from 'react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import type { Patient } from '../types';
import ButtonWithGradient from './ButtonWithGradient';
import { SelectField, InputField, TimeField, TextareaField } from './forms';
import './HaemodialysisRecordDetails.css';

interface Row {
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

interface FormValues {
  patientId: string;
  rows: Row[];
}

const createNewRow = (): Row => {
  const now = new Date();
  const time = now.toTimeString().slice(0, 5);
  return {
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

const validationSchema = Yup.object({
  patientId: Yup.string().required('Please select a patient.'),
  rows: Yup.array().of(
    Yup.object({
      time: Yup.string().required('Required'),
      bp: Yup.string(),
      pulse: Yup.string(),
      temperature: Yup.string(),
      venousPressure: Yup.string(),
      negativePressure: Yup.string(),
      tmp: Yup.string(),
      heparin: Yup.string(),
      medicationRemarks: Yup.string(),
    })
  )
});

const HaemodialysisRecordDetails: React.FC = () => {
  const [patients] = useState<Patient[]>([]); // Placeholder for new mock db integration
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // No API/service logic, just use local state
  useEffect(() => { setLoading(false); }, []);

  const initialValues: FormValues = {
    patientId: '',
    rows: [createNewRow()]
  };

  const handleSubmit = async (values: FormValues, { resetForm }: any) => {
    setError('');
    setSuccess('');
    if (!values.patientId) {
      setError('Please select a patient.');
      return;
    }
    const patient = patients.find(p => String(p.id) === String(values.patientId));
    if (!patient) {
      setError('Invalid patient selected.');
      return;
    }
    const record = {
      patientId: values.patientId,
      patientName: (patient.firstName || patient.name) + (patient.lastName ? ' ' + patient.lastName : ''),
      date: new Date().toISOString().split('T')[0],
      rows: values.rows,
    };
    // Simulate save
    setSuccess('Record saved successfully!');
    resetForm();
    setTimeout(() => setSuccess(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="haemodialysis-record-content">
      <div className="haemodialysis-record-form-container">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, isSubmitting, setFieldValue }) => (
            <Form>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <SelectField
                  label="Select Patient"
                  name="patientId"
                  options={patients.map((p) => ({
                    label: (p.firstName || p.name) + (p.lastName ? ' ' + p.lastName : ''),
                    value: p.id || ''
                  }))}
                  placeholder="-- Select Patient --"
                  disabled={loading}
                  required
                />
              </div>
              {/* Selected Patient Info */}
              {values.patientId && (
                <div className="selected-patient-info" style={{ marginBottom: '1.5rem', background: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
                  <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>Selected Patient Information</h4>
                  {(() => {
                    const selectedPatient = patients.find(p => String(p.id) === String(values.patientId));
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
              <FieldArray name="rows">
                {({ push, remove }) => (
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
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {values.rows.map((row, idx) => (
                          <tr key={idx}>
                            <td><TimeField name={`rows.${idx}.time`} label="Time" /></td>
                            <td><InputField name={`rows.${idx}.bp`} type="text" label="B.P." placeholder="e.g., 120/80" /></td>
                            <td><InputField name={`rows.${idx}.pulse`} type="number" label="Pulse" /></td>
                            <td><InputField name={`rows.${idx}.temperature`} type="number" label="Temp" /></td>
                            <td><InputField name={`rows.${idx}.venousPressure`} type="number" label="Venous Pressure" /></td>
                            <td><InputField name={`rows.${idx}.negativePressure`} type="number" label="Negative Pressure" /></td>
                            <td><InputField name={`rows.${idx}.tmp`} type="number" label="TMP" /></td>
                            <td><InputField name={`rows.${idx}.heparin`} type="text" label="Heparin" /></td>
                            <td><TextareaField name={`rows.${idx}.medicationRemarks`} label="Medication & Remarks" rows={1} /></td>
                            <td>
                              {values.rows.length > 1 && (
                                <ButtonWithGradient
                                  type="button"
                                  className="btn-outline btn-sm"
                                  onClick={() => remove(idx)}
                                  text="Remove"
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <ButtonWithGradient type="button" onClick={() => push(createNewRow())} className="btn-add-row" text="Add Row" />
                  </div>
                )}
              </FieldArray>
              <div className="form-actions">
                <div className="action-buttons">
                  <ButtonWithGradient type="submit" className="btn-save" disabled={isSubmitting || !values.patientId} text={isSubmitting ? 'Saving...' : 'Save'} />
                  <ButtonWithGradient onClick={handlePrint} className="btn-print-record" text="Print" />
                </div>
              </div>
              {success && <div className="success-message">{success}</div>}
              {error && <div className="error-message">{error}</div>}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default HaemodialysisRecordDetails; 