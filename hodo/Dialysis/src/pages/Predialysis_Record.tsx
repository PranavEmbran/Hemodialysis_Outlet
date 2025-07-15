import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import { useDialysis } from '../context/DialysisContext';
import ButtonWithGradient from '../components/ButtonWithGradient';

const Predialysis_Record: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
  const { appointments, patients } = useDialysis();
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

  // Get only active appointments
  const availableSchedules = appointments.filter(a => a.isDeleted === 10);

  // When schedule is selected, auto-fill patient
  const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scheduleId = e.target.value;
    setForm(prev => ({ ...prev, SA_ID_FK_PK: scheduleId }));
    const selected = availableSchedules.find(a => a.id === scheduleId);
    if (selected) {
      setForm(prev => ({ ...prev, P_ID_FK: selected.patientName || '' }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    // Simulate save
    setTimeout(() => {
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
    }, 800);
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
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="Predialysis Record" subtitle="Predialysis Record" />
        <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 24 }}>
          <div className="form-group mb-3">
            <label>Schedule (SA_ID_FK_PK) *</label>
            <select name="SA_ID_FK_PK" value={form.SA_ID_FK_PK} onChange={handleScheduleChange} className="form-control">
              <option value="">Select Schedule</option>
              {availableSchedules.map(sch => (
                <option key={sch.id} value={sch.id}>{sch.id} - {sch.patientName}</option>
              ))}
            </select>
            {errors.SA_ID_FK_PK && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.SA_ID_FK_PK}</div>}
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
            <textarea name="PreDR_Notes" value={form.PreDR_Notes} onChange={handleChange} className="form-control" rows={3} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
            <ButtonWithGradient type="submit">Save</ButtonWithGradient>
            <ButtonWithGradient type="button" className="btn-outline" onClick={handleReset}>Reset</ButtonWithGradient>
          </div>
          {successMsg && <div style={{ color: 'green', marginTop: 16, textAlign: 'center' }}>{successMsg}</div>}
          {errorMsg && <div style={{ color: 'red', marginTop: 16, textAlign: 'center' }}>{errorMsg}</div>}
        </form>
      </PageContainer>
      <Footer />
    </>
  );
};

export default Predialysis_Record; 