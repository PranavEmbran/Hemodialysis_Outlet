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
import { toast } from 'react-toastify';

// const Start_Dialysis_Record: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
const Start_Dialysis_Record: React.FC<{ selectedSchedule?: string; records?: any[]; onSaveSuccess?: () => void }> = ({ selectedSchedule, records = [], onSaveSuccess }) => {
  const { units } = useUnits();
  const { accesses } = useAccessTypes();
  const { dialyzerTypes } = useDialyzerTypes();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [scheduleOptions, setScheduleOptions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  const [formKey, setFormKey] = useState(0);

  

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/data/Dialysis_Schedules`).then(res => res.json()),
      fetch(`${API_URL}/data/patients_derived`).then(res => res.json())
    ]).then(([schedules, patientsData]) => {
      setPatients(patientsData);
      setScheduleOptions(schedules.filter((a: any) => a.Status === 10).map((sch: any) => {
        const patient = patientsData.find((p: any) => p.id === sch.P_ID_FK);
        return {
          value: sch.DS_ID_PK,
          label: `${sch.DS_ID_PK} - ${patient ? patient.Name : sch.P_ID_FK}`
        };
      }));
    });
  }, []);

  // // Sync dropdown with selectedSchedule from parent
  // useEffect(() => {
  //   if (!selectedSchedule) return;
  //   // Wait for scheduleOptions to be loaded
  //   if (scheduleOptions.length > 0) {
  //     // Set Formik field value if needed
  //     const form = document.querySelector('form');
  //     if (form) {
  //       const select = form.querySelector('select[name="SA_ID_PK_FK"]') as HTMLSelectElement;
  //       if (select && select.value !== selectedSchedule) {
  //         select.value = selectedSchedule;
  //         // Trigger change event
  //         select.dispatchEvent(new Event('change', { bubbles: true }));
  //       }
  //     }
  //   }
  // }, [selectedSchedule, scheduleOptions]);

  const initialValues = {
    // SA_ID_PK_FK: '',
    Dialysis_Unit: '',
    SDR_Start_time: '',
    SDR_Vascular_access: '',
    Dialyzer_Type: '',
    SDR_Notes: '',
    // Status: 'Active',
  };

  const unitOptions = units.map(u => ({ value: u.Unit_Name, label: u.Unit_Name }));
  const accessOptions = accesses.map(a => ({ value: a.VAL_Access_Type, label: a.VAL_Access_Type }));
  const dialyzerOptions = dialyzerTypes.map(d => ({ value: d.DTL_Dialyzer_Name, label: d.DTL_Dialyzer_Name }));

  const isDisabled = !!(selectedSchedule && records.some((rec: any) => rec.SA_ID_PK_FK === selectedSchedule || rec.SA_ID_FK === selectedSchedule));

  // Debug: Check disabled state
  console.log("START DIALYSIS - selectedSchedule:", selectedSchedule, "isDisabled:", isDisabled);
  if (selectedSchedule && records.length > 0) {
    const matchingRecords = records.filter(rec => rec.SA_ID_PK_FK === selectedSchedule || rec.SA_ID_FK === selectedSchedule);
    console.log("Matching start dialysis records:", matchingRecords.length);
  }

  return (
    <>
      {isDisabled && (
        <div style={{ color: 'red', marginBottom: 16 }}>
          Start Dialysis form is disabled because a record already exists for the selected schedule.
        </div>
      )}
      <Formik
        key={formKey} // <-- Forces full reinitialization

        initialValues={initialValues}
        validationSchema={Yup.object({
          Dialysis_Unit: Yup.string().required('Dialysis Unit is required'),
          SDR_Start_time: Yup.string().required('Start time is required'),
          SDR_Vascular_access: Yup.string().required('Vascular Access is required'),
          Dialyzer_Type: Yup.string().required('Dialyzer Type is required'),
          SDR_Notes: Yup.string(),
        })}

        onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
          if (isDisabled) {
            setSubmitting(false);
            return;
          }
          setSuccessMsg('');
          setErrorMsg('');
          try {
            const res = await fetch(`${API_URL}/data/start_dialysis_record`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ SA_ID_PK_FK: selectedSchedule, ...values }),
            });

            if (!res.ok) throw new Error('Failed to save');

            setSuccessMsg('Start Dialysis record saved successfully!');
            toast.success('Start Dialysis record saved successfully!');

            // ✅ Explicitly reset the form with initial values
            // This ensures both Formik state and custom field values are cleared
            setTimeout(() => {
              setSuccessMsg('');
              setErrorMsg('');
            }, 3000);

            resetForm({

              values: {
                Dialysis_Unit: '',
                SDR_Start_time: '',
                SDR_Vascular_access: '',
                Dialyzer_Type: '',
                SDR_Notes: '',
              },
            });

            // ✅ Force full remount of the form
            // Helps custom components fully refresh their UI
            setFormKey(prev => prev + 1);

          } catch (err) {
            setErrorMsg('Error saving start dialysis record.');
            toast.error('Error saving start dialysis record.');
          }
        }}




      >
        {({ isSubmitting, resetForm, errors, submitCount }) =>
        (
          <Form style={{ margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 24 }}>
            {/* Danger message for missing required fields */}
            {Object.keys(errors).length > 0 && submitCount > 0 && (
              <div style={{ color: 'red', background: '#fff2f2', border: '1px solid #ffcccc', padding: 10, borderRadius: 5, marginBottom: 16, textAlign: 'center' }}>
                Please fill in the following required fields:<br />
                <ul style={{ color: 'red', textAlign: 'left', maxWidth: 400, margin: '8px auto' }}>
                  {Object.entries(errors).map(([field, msg]) => (
                    <li key={field}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}
            {!selectedSchedule && (
              <div style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>
                Please select a schedule to enable this form.
              </div>
            )}
            {/* <div style={{ display: 'none' }}>
              <SelectField
                label="Schedule ID (SA_ID_PK_FK)"
                name="SA_ID_PK_FK"
                options={scheduleOptions}
                required
                placeholder="Select Schedule"
                disabled
              />
            </div> */}
            {/* <div>
              <label className="blueBar">
                {(() => {
                  const selected = scheduleOptions.find(sch => sch.value === selectedSchedule);
                  return selected?.label || 'No schedule selected';
                })()}
              </label>
            </div> */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <SelectField
                label="Dialysis Unit"
                name="Dialysis_Unit"
                options={unitOptions}
                required
                placeholder="Select Dialysis Unit"
                disabled={isDisabled || !selectedSchedule}
              />
              <TimeField
                label="Start Time (SDR_Start time)"
                name="SDR_Start_time"
                required
                disabled={isDisabled || !selectedSchedule}
              />
              <SelectField
                label="Vascular Access (SDR_Vascular_access)"
                name="SDR_Vascular_access"
                options={accessOptions}
                required
                placeholder="Select Vascular Access"
                disabled={isDisabled || !selectedSchedule}
              />
              <SelectField
                label="Dialyzer Type"
                name="Dialyzer_Type"
                options={dialyzerOptions}
                required
                placeholder="Select Dialyzer Type"
                disabled={isDisabled || !selectedSchedule}
              />
              <TextareaField
                label="Notes (SDR_Notes)"
                name="SDR_Notes"
                rows={3}
                placeholder="Enter any notes (optional)"
                disabled={isDisabled || !selectedSchedule}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'left', marginTop: 16 }}>
              <ButtonWithGradient type="button" className="btn-outline redButton" onClick={() => {
                setFormKey(prev => prev + 1); // force re-mount
                //  resetForm(); 
                setSuccessMsg('');
                setErrorMsg('');
              }} disabled={isDisabled || !selectedSchedule}>Reset</ButtonWithGradient>
              <ButtonWithGradient type="submit" disabled={!selectedSchedule || isSubmitting}>Save</ButtonWithGradient>
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