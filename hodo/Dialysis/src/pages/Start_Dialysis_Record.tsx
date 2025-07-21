import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import SelectField from '../components/forms/SelectField';
import InputField from '../components/forms/InputField';
import TimeField from '../components/forms/TimeField';
import TextareaField from '../components/forms/TextareaField';
import ButtonWithGradient from '../components/ButtonWithGradient';
import { useUnits } from './UnitsManagement';
import { useAccessTypes } from './VascularAccessLookup';
import { useDialyzerTypes } from './DialyzerTypeLookup';
import { API_URL } from '../config';

// const Start_Dialysis_Record: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
const Start_Dialysis_Record: React.FC<{ selectedSchedule?: string }> = ({ selectedSchedule }) => {
  const { units } = useUnits();
  const { accesses } = useAccessTypes();
  const { dialyzerTypes } = useDialyzerTypes();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [scheduleOptions, setScheduleOptions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/data/schedules_assigned`).then(res => res.json()),
      fetch(`${API_URL}/data/patients_derived`).then(res => res.json())
    ]).then(([schedules, patientsData]) => {
      setPatients(patientsData);
      setScheduleOptions(schedules.filter((a: any) => a.isDeleted === 10).map((sch: any) => {
        const patient = patientsData.find((p: any) => p.id === sch.P_ID_FK);
        return {
          value: sch.SA_ID_PK,
          label: `${sch.SA_ID_PK} - ${patient ? patient.Name : sch.P_ID_FK}`
        };
      }));
    });
  }, []);

  // Sync dropdown with selectedSchedule from parent
  useEffect(() => {
    if (!selectedSchedule) return;
    // Wait for scheduleOptions to be loaded
    if (scheduleOptions.length > 0) {
      // Set Formik field value if needed
      const form = document.querySelector('form');
      if (form) {
        const select = form.querySelector('select[name="SA_ID_FK_PK"]') as HTMLSelectElement;
        if (select && select.value !== selectedSchedule) {
          select.value = selectedSchedule;
          // Trigger change event
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }
  }, [selectedSchedule, scheduleOptions]);

  const initialValues = {
    SA_ID_FK_PK: '',
    Dialysis_Unit: '',
    SDR_Start_time: '',
    SDR_Vascular_access: '',
    Dialyzer_Type: '',
    SDR_Notes: '',
    // Status: 'Active',
  };

  const validationSchema = Yup.object({
    SA_ID_FK_PK: Yup.string().required('Schedule ID is required'),
    Dialysis_Unit: Yup.string().required('Dialysis Unit is required'),
    SDR_Start_time: Yup.string().required('Start time is required'),
    SDR_Vascular_access: Yup.string().required('Vascular Access is required'),
    Dialyzer_Type: Yup.string().required('Dialyzer Type is required'),
    SDR_Notes: Yup.string(),
    // Status: Yup.string(),
  });

  const unitOptions = units.map(u => ({ value: u.Unit_Name, label: u.Unit_Name }));
  const accessOptions = accesses.map(a => ({ value: a.VAL_Access_Type, label: a.VAL_Access_Type }));
  const dialyzerOptions = dialyzerTypes.map(d => ({ value: d.DTL_Dialyzer_Name, label: d.DTL_Dialyzer_Name }));

  return (
    <>
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer> */}
      {/* <SectionHeading title="Start Dialysis Record" subtitle="Start Dialysis Record" /> */}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          setSuccessMsg('');
          setErrorMsg('');
          try {
            const res = await fetch(`${API_URL}/data/start_dialysis_record`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error('Failed to save');
            setSuccessMsg('Start Dialysis record saved successfully!');
            resetForm();
          } catch (err) {
            setErrorMsg('Error saving start dialysis record.');
          }
        }}
      >
        {({ isSubmitting, resetForm }) => (
          <Form style={{ margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 24 }}>
            <div style={{ display: 'none' }}>

              <SelectField
                label="Schedule ID (SA_ID_FK_PK)"
                name="SA_ID_FK_PK"
                options={scheduleOptions}
                required
                placeholder="Select Schedule"
                disabled
              />
            </div>

            <div>
              {/* <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  Schedule ID (SA_ID_FK_PK)
                </label> */}
              <label style={{ fontSize: 18, fontWeight: 600, margin: '0px 0 18px' }}>
                {(() => {
                  const selected = scheduleOptions.find(sch => sch.value === selectedSchedule);
                  return selected?.label || 'No schedule selected';
                })()}
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>



              <SelectField
                label="Dialysis Unit"
                name="Dialysis_Unit"
                options={unitOptions}
                required
                placeholder="Select Dialysis Unit"
              />
              <TimeField
                label="Start Time (SDR_Start time)"
                name="SDR_Start_time"
                required
              />
              <SelectField
                label="Vascular Access (SDR_Vascular_access)"
                name="SDR_Vascular_access"
                options={accessOptions}
                required
                placeholder="Select Vascular Access"
              />
              <SelectField
                label="Dialyzer Type"
                name="Dialyzer_Type"
                options={dialyzerOptions}
                required
                placeholder="Select Dialyzer Type"
              />
              <TextareaField
                label="Notes (SDR_Notes)"
                name="SDR_Notes"
                rows={3}
                placeholder="Enter any notes"
              />
              {/* <InputField
                label="Status"
                name="Status"
                disabled
              /> */}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'left', marginTop: 16 }}>
              <ButtonWithGradient type="button" className="btn-outline redButton" onClick={() => { resetForm(); setSuccessMsg(''); setErrorMsg(''); }}>Reset</ButtonWithGradient>
              <ButtonWithGradient type="submit" disabled={isSubmitting}>Save</ButtonWithGradient>
            </div>
            {successMsg && <div style={{ color: 'green', marginTop: 16, textAlign: 'center' }}>{successMsg}</div>}
            {errorMsg && <div style={{ color: 'red', marginTop: 16, textAlign: 'center' }}>{errorMsg}</div>}
          </Form>
        )}
      </Formik>
      {/* </PageContainer>
      <Footer /> */}
    </>
  );
};

export default Start_Dialysis_Record; 