import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import ButtonWithGradient from '../components/ButtonWithGradient';
import { Formik, Form } from 'formik';
import { InputField, TextareaField } from '../components/forms';
import { API_URL } from '../config';
import * as Yup from 'yup';

// const Predialysis_Record: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
const Predialysis_Record: React.FC<{ selectedSchedule?: string }> = ({ selectedSchedule }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [form, setForm] = useState({
    SA_ID_FK_PK: '',
    P_ID_FK: '',
    PreDR_Vitals_BP: '',
    PreDR_Vitals_HeartRate: '',
    PreDR_Vitals_Temperature: '',
    PreDR_Vitals_Weight: '',
    PreDR_Notes: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/data/schedules_assigned`).then(res => res.json()),
      fetch(`${API_URL}/data/patients_derived`).then(res => res.json())
    ]).then(([schedules, patientsData]) => {
      setAppointments(schedules.filter((a: any) => a.isDeleted === 10));
      setPatients(patientsData);
    });
  }, []);

  // Sync dropdown with selectedSchedule from parent
  useEffect(() => {
    if (selectedSchedule && appointments.length > 0) {
      setForm(prev => {
        if (prev.SA_ID_FK_PK !== selectedSchedule) {
          // Find the appointment and patient
          const selected = appointments.find(a => a.SA_ID_PK === selectedSchedule);
          let patientName = '';
          if (selected) {
            const patient = patients.find((p: any) => p.id === selected.P_ID_FK);
            patientName = patient ? patient.Name : '';
          }
          return { ...prev, SA_ID_FK_PK: selectedSchedule, P_ID_FK: patientName };
        }
        return prev;
      });
    }
    // If no schedule selected, clear
    if (!selectedSchedule) {
      setForm(prev => ({ ...prev, SA_ID_FK_PK: '', P_ID_FK: '' }));
    }
  }, [selectedSchedule, appointments, patients]);

  // Get only active appointments
  const availableSchedules = appointments.filter(a => a.isDeleted === 10);

  // When schedule is selected, auto-fill patient
  const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scheduleId = e.target.value;
    setForm(prev => ({ ...prev, SA_ID_FK_PK: scheduleId }));
    const selected = appointments.find(a => a.SA_ID_PK === scheduleId);
    if (selected) {
      const patient = patients.find((p: any) => p.id === selected.P_ID_FK);
      setForm(prev => ({ ...prev, P_ID_FK: patient ? patient.Name : '' }));
    } else {
      setForm(prev => ({ ...prev, P_ID_FK: '' }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!form.SA_ID_FK_PK) errs.SA_ID_FK_PK = 'Required';
    if (!form.PreDR_Vitals_BP) errs.PreDR_Vitals_BP = 'Required';
    if (!form.PreDR_Vitals_HeartRate) errs.PreDR_Vitals_HeartRate = 'Required';
    if (!form.PreDR_Vitals_Temperature) errs.PreDR_Vitals_Temperature = 'Required';
    if (!form.PreDR_Vitals_Weight) errs.PreDR_Vitals_Weight = 'Required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!selectedSchedule) {
      setErrorMsg('Please select a schedule before saving.');
      return;
    }
    try {
      const payload = { ...form, SA_ID_FK_PK: selectedSchedule };
      const res = await fetch(`${API_URL}/data/predialysis_record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSuccessMsg('Predialysis record saved successfully!');
      setForm({
        SA_ID_FK_PK: '',
        P_ID_FK: '',
        PreDR_Vitals_BP: '',
        PreDR_Vitals_HeartRate: '',
        PreDR_Vitals_Temperature: '',
        PreDR_Vitals_Weight: '',
        PreDR_Notes: '',
      });
      setErrors({});
    } catch (err) {
      setErrorMsg('Error saving predialysis record.');
    }
  };

  const handleReset = () => {
    setForm({
      SA_ID_FK_PK: '',
      P_ID_FK: '',
      PreDR_Vitals_BP: '',
      PreDR_Vitals_HeartRate: '',
      PreDR_Vitals_Temperature: '',
      PreDR_Vitals_Weight: '',
      PreDR_Notes: '',
    });
    setErrors({});
    setSuccessMsg('');
    setErrorMsg('');
  };

  return (
    <>
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} /> */}
      {/* <PageContainer> */}
      {/* <SectionHeading title="Predialysis Record" subtitle="Predialysis Record" /> */}
      <Formik
        initialValues={form}
        enableReinitialize
        validationSchema={Yup.object({
          SA_ID_FK_PK: Yup.string().required('Schedule is required'),
          PreDR_Vitals_BP: Yup.string().required('Blood Pressure is required'),
          PreDR_Vitals_HeartRate: Yup.string().required('Heart Rate is required'),
          PreDR_Vitals_Temperature: Yup.string().required('Temperature is required'),
          PreDR_Vitals_Weight: Yup.string().required('Weight is required'),
          PreDR_Notes: Yup.string(),
        })}
        onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
          setSuccessMsg('');
          setErrorMsg('');
          if (!selectedSchedule) {
            setErrorMsg('Please select a schedule before saving.');
            setSubmitting(false);
            return;
          }
          try {
            const payload = { ...values, SA_ID_FK_PK: selectedSchedule };
            const res = await fetch(`${API_URL}/data/predialysis_record`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to save');
            setSuccessMsg('Predialysis record saved successfully!');
            resetForm();
          } catch (err) {
            setErrorMsg('Error saving predialysis record.');
          }
          setSubmitting(false);
        }}
      >
        {({ values, isSubmitting, resetForm }) => (
          <Form style={{ margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 24 }}>
            {!selectedSchedule && (
              <div style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>
                Please select a schedule to enable this form.
              </div>
            )}
            <div className="form-group mb-0">
              {(() => {
                const selectedScheduleObj = appointments.find(sch => sch.SA_ID_PK === values.SA_ID_FK_PK);
                const patient = selectedScheduleObj ? patients.find((p: any) => p.id === selectedScheduleObj.P_ID_FK) : null;
                const labelText = selectedScheduleObj
                  ? `${selectedScheduleObj.SA_ID_PK} - ${patient ? patient.Name : selectedScheduleObj.P_ID_FK}`
                  : 'No schedule selected';
                return (
                  <label style={{ fontSize: 18, fontWeight: 600 }}>
                    {labelText}
                  </label>
                );
              })()}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label style={{ margin: '24px 0 8px', fontWeight: 600, fontSize: 18 }}>Vitals</label><br />
              <InputField
                label="Blood Pressure"
                name="PreDR_Vitals_BP"
                required
                placeholder="Enter blood pressure (e.g. 120/80)"
                disabled={!selectedSchedule}
              />
              <InputField
                label="Heart Rate"
                name="PreDR_Vitals_HeartRate"
                required
                placeholder="Enter heart rate (bpm)"
                disabled={!selectedSchedule}
              />
              <InputField
                label="Temperature"
                name="PreDR_Vitals_Temperature"
                required
                placeholder="Enter temperature (°C)"
                disabled={!selectedSchedule}
              />
              <InputField
                label="Weight"
                name="PreDR_Vitals_Weight"
                required
                placeholder="Enter weight (kg)"
                disabled={!selectedSchedule}
              />
              <TextareaField
                label="Notes"
                name="PreDR_Notes"
                rows={3}
                placeholder="Enter any notes (optional)"
                disabled={!selectedSchedule}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'left', marginTop: 16 }}>
              <ButtonWithGradient
                type="button"
                className="btn-outline redButton"
                onClick={() => { resetForm(); setSuccessMsg(''); setErrorMsg(''); }}
                disabled={!selectedSchedule || isSubmitting}
              >
                Reset
              </ButtonWithGradient>
              <ButtonWithGradient type="submit" disabled={!selectedSchedule || isSubmitting}>Save</ButtonWithGradient>
            </div>
            {successMsg && <div style={{ color: 'green', marginTop: 16, textAlign: 'center' }}>{successMsg}</div>}
            {errorMsg && <div style={{ color: 'red', marginTop: 16, textAlign: 'center' }}>{errorMsg}</div>}
          </Form>
        )}
      </Formik>
      {/* </PageContainer> */}
      {/* <Footer /> */}
    </>
  );
};

export default Predialysis_Record; 