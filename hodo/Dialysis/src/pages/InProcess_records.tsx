import React, { useEffect, useState } from 'react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import type { Patient } from '../types';
import ButtonWithGradient from '../components/ButtonWithGradient';
import { SelectField, InputField, TimeField, TextareaField } from '../components/forms';
import './HaemodialysisRecordDetails.css';
import { API_URL } from '../config';

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

const HaemodialysisRecordDetailsPage: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/data/schedules_assigned`).then(res => res.json()),
      fetch(`${API_URL}/data/patients_derived`).then(res => res.json())
    ]).then(([schedulesData, patientsData]) => {
      setPatients(patientsData);
      setSchedules(schedulesData.filter((a: any) => a.isDeleted === 10));
      setLoading(false);
    });
  }, []);

  const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scheduleId = e.target.value;
    setSelectedSchedule(scheduleId);
    const selected = schedules.find((s: any) => s.SA_ID_PK === scheduleId);
    if (selected) {
      const patient = patients.find((p: any) => p.id === selected.P_ID_FK);
      setSelectedPatient(patient ? patient.name : selected.P_ID_FK);
    } else {
      setSelectedPatient('');
    }
  };

  const initialValues: FormValues = {
    patientId: '',
    rows: [createNewRow()]
  };

  const handleSubmit = async (values: FormValues, { resetForm }: any) => {
    setError('');
    setSuccess('');
    const record = {
      ...values,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
    };
    try {
      const res = await fetch(`${API_URL}/data/inprocess_record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSuccess('Record saved successfully!');
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save record.');
    }
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
          {({ values, isSubmitting }) => (
            <Form>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Select Schedule</label>
                <select value={selectedSchedule} onChange={handleScheduleChange} className="form-control">
                  <option value="">Select Schedule</option>
                  {schedules.map(sch => {
                    const patient = patients.find((p: any) => p.id === sch.P_ID_FK);
                    const patientLabel = patient ? ((patient as any)['Name'] || patient.name) : sch.P_ID_FK;
                    return (
                      <option key={sch.SA_ID_PK} value={sch.SA_ID_PK}>{sch.SA_ID_PK} - {patientLabel}</option>
                    );
                  })}
                </select>
              </div>
              {selectedPatient && (
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Patient</label>
                  <input type="text" value={selectedPatient} readOnly className="form-control" />
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
                  <ButtonWithGradient type="submit" className="btn-save" disabled={isSubmitting || !selectedSchedule} text={isSubmitting ? 'Saving...' : 'Save'} />
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

export default HaemodialysisRecordDetailsPage;
