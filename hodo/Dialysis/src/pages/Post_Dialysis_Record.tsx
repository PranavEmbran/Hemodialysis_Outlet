import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import ButtonWithGradient from '../components/ButtonWithGradient';
import { API_URL } from '../config';

// const Post_Dialysis_Record: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
const Post_Dialysis_Record: React.FC<{ selectedSchedule?: string }> = ({ selectedSchedule }) => {
  // const { appointments, patients } = useDialysis();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  const [form, setForm] = useState({
    SA_ID_FK: '',
    P_ID_FK: '',
    PreDR_Vitals_BP: '',
    PreDR_Vitals_HeartRate: '',
    PreDR_Vitals_Temperature: '',
    PreDR_Vitals_Weight: '',
    PostDR_Notes: '',
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
        if (prev.SA_ID_FK !== selectedSchedule) {
          const selected = appointments.find(a => a.SA_ID_PK === selectedSchedule);
          let patientName = '';
          if (selected) {
            const patient = patients.find((p: any) => p.id === selected.P_ID_FK);
            patientName = patient ? patient.Name : '';
          }
          return { ...prev, SA_ID_FK: selectedSchedule, P_ID_FK: patientName };
        }
        return prev;
      });
    }
    if (!selectedSchedule) {
      setForm(prev => ({ ...prev, SA_ID_FK: '', P_ID_FK: '' }));
    }
  }, [selectedSchedule, appointments, patients]);

  // When schedule is selected, auto-fill patient
  const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scheduleId = e.target.value;
    setForm(prev => ({ ...prev, SA_ID_FK: scheduleId }));
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
    if (!form.SA_ID_FK) errs.SA_ID_FK = 'Required';
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
    try {
      const res = await fetch(`${API_URL}/data/post_dialysis_record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSuccessMsg('Postdialysis record saved successfully!');
      setForm({
        SA_ID_FK: '',
        P_ID_FK: '',
        PreDR_Vitals_BP: '',
        PreDR_Vitals_HeartRate: '',
        PreDR_Vitals_Temperature: '',
        PreDR_Vitals_Weight: '',
        PostDR_Notes: '',
      });
      setErrors({});
    } catch (err) {
      setErrorMsg('Error saving postdialysis record.');
    }
  };

  const handleReset = () => {
    setForm({
      SA_ID_FK: '',
      P_ID_FK: '',
      PreDR_Vitals_BP: '',
      PreDR_Vitals_HeartRate: '',
      PreDR_Vitals_Temperature: '',
      PreDR_Vitals_Weight: '',
      PostDR_Notes: '',
    });
    setErrors({});
    setSuccessMsg('');
    setErrorMsg('');
  };

  return (
    <>
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer> */}
        {/* <SectionHeading title="Postdialysis Record" subtitle="Postdialysis Record" /> */}
        <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 24 }}>
          <div className="form-group mb-3">
            <label>Schedule (SA_ID_FK) *</label>
            <select name="SA_ID_FK" value={form.SA_ID_FK} onChange={handleScheduleChange} className="form-control">
              <option value="">Select Schedule</option>
              {appointments.map(sch => {
                const patient = patients.find((p: any) => p.id === sch.P_ID_FK);
                return (
                  <option key={sch.SA_ID_PK} value={sch.SA_ID_PK}>{sch.SA_ID_PK} - {patient ? patient.Name : sch.P_ID_FK}</option>
                );
              })}
            </select>
            {errors.SA_ID_FK && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.SA_ID_FK}</div>}
          </div>
          <div className="form-group mb-3">
            <label>Patient (P_ID_FK)</label>
            <input type="text" name="P_ID_FK" value={form.P_ID_FK} readOnly className="form-control" />
          </div>
          <div style={{ margin: '24px 0 8px', fontWeight: 600, fontSize: 16 }}>Vitals</div>
          <div className="form-group mb-2">
            <label>Blood Pressure *</label>
            <input type="text" name="PreDR_Vitals_BP" value={form.PreDR_Vitals_BP} onChange={handleChange} className="form-control" />
            {errors.PreDR_Vitals_BP && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.PreDR_Vitals_BP}</div>}
          </div>
          <div className="form-group mb-2">
            <label>Heart Rate *</label>
            <input type="text" name="PreDR_Vitals_HeartRate" value={form.PreDR_Vitals_HeartRate} onChange={handleChange} className="form-control" />
            {errors.PreDR_Vitals_HeartRate && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.PreDR_Vitals_HeartRate}</div>}
          </div>
          <div className="form-group mb-2">
            <label>Temperature *</label>
            <input type="text" name="PreDR_Vitals_Temperature" value={form.PreDR_Vitals_Temperature} onChange={handleChange} className="form-control" />
            {errors.PreDR_Vitals_Temperature && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.PreDR_Vitals_Temperature}</div>}
          </div>
          <div className="form-group mb-2">
            <label>Weight *</label>
            <input type="text" name="PreDR_Vitals_Weight" value={form.PreDR_Vitals_Weight} onChange={handleChange} className="form-control" />
            {errors.PreDR_Vitals_Weight && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.PreDR_Vitals_Weight}</div>}
          </div>
          <div className="form-group mb-3">
            <label>Notes</label>
            <textarea name="PostDR_Notes" value={form.PostDR_Notes} onChange={handleChange} className="form-control" rows={3} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
            <ButtonWithGradient type="submit">Save</ButtonWithGradient>
            <ButtonWithGradient type="button" className="btn-outline" onClick={handleReset}>Reset</ButtonWithGradient>
          </div>
          {successMsg && <div style={{ color: 'green', marginTop: 16, textAlign: 'center' }}>{successMsg}</div>}
          {errorMsg && <div style={{ color: 'red', marginTop: 16, textAlign: 'center' }}>{errorMsg}</div>}
        </form>
      {/* </PageContainer>
      <Footer /> */}
    </>
  );
};

export default Post_Dialysis_Record; 