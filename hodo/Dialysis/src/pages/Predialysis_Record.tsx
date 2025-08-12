import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import ButtonWithGradient from '../components/ButtonWithGradient';
import { Formik, Form } from 'formik';
import { InputField, SelectField, TextareaField } from '../components/forms';
import { API_URL } from '../config';
import * as Yup from 'yup';
import { toast } from 'react-toastify';


// const Predialysis_Record: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
const Predialysis_Record: React.FC<{ selectedSchedule?: string; records?: any[]; onSaveSuccess?: () => void }> = ({ selectedSchedule, records = [], onSaveSuccess }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [form, setForm] = useState({
    SA_ID_PK_FK: '',
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
      fetch(`${API_URL}/data/Dialysis_Schedules`).then(res => res.json()),
      fetch(`${API_URL}/data/patients_derived`).then(res => res.json())
    ]).then(([schedules, patientsData]) => {
      setAppointments(schedules.filter((a: any) => a.Status === 10));
      setPatients(patientsData);
    });
  }, []);

  // Sync dropdown with selectedSchedule from parent
  useEffect(() => {
    if (selectedSchedule && appointments.length > 0) {
      setForm(prev => {
        if (prev.SA_ID_PK_FK !== selectedSchedule) {
          // Find the appointment and patient
          const selected = appointments.find(a => a.DS_ID_PK === selectedSchedule);
          let patientName = '';
          if (selected) {
            const patient = patients.find((p: any) => p.PreDR_ID_PK === selected.P_ID_FK);
            patientName = patient ? patient.Name : '';
          }
          return { ...prev, SA_ID_PK_FK: selectedSchedule, P_ID_FK: patientName };
        }
        return prev;
      });
    }
    // If no schedule selected, clear
    if (!selectedSchedule) {
      setForm(prev => ({ ...prev, SA_ID_PK_FK: '', P_ID_FK: '' }));
    }
  }, [selectedSchedule, appointments, patients]);

  // Disable logic: check if selectedSchedule exists in records
  const isDisabled = !!(selectedSchedule && records.some((rec: any) => rec.SA_ID_PK_FK === selectedSchedule));

  // Get only active appointments
  const availableSchedules = appointments.filter(a => a.Status === 10);

  // When schedule is selected, auto-fill patient
  const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scheduleId = e.target.value;
    setForm(prev => ({ ...prev, SA_ID_PK_FK: scheduleId }));
    const selected = appointments.find(a => a.DS_ID_PK === scheduleId);
    if (selected) {
      const patient = patients.find((p: any) => p.PreDR_ID_PK === selected.P_ID_FK);
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
    if (!form.SA_ID_PK_FK) errs.SA_ID_PK_FK = 'Required';
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
      const payload = { ...form, SA_ID_PK_FK: selectedSchedule };
      const res = await fetch(`${API_URL}/data/predialysis_record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSuccessMsg('Predialysis record saved successfully!');
      toast.success('Predialysis record saved successfully!');
      setForm({
        SA_ID_PK_FK: '',
        P_ID_FK: '',
        PreDR_Vitals_BP: '',
        PreDR_Vitals_HeartRate: '',
        PreDR_Vitals_Temperature: '',
        PreDR_Vitals_Weight: '',
        PreDR_Notes: '',
      });
      setErrors({});
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      setErrorMsg('Error saving predialysis record.');
      toast.error('Error saving predialysis record.');
    }
  };

  const handleReset = () => {
    setForm({
      SA_ID_PK_FK: '',
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



  records.forEach((rec: any) => {
    console.log("@@@Comparing", rec.PreDR_ID_PK, "===", selectedSchedule);
  });




  return (
    <>
      {isDisabled && (
        <div style={{ color: 'red', marginBottom: 16 }}>
          Predialysis form is disabled because a record already exists for the selected schedule.
        </div>
      )}
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} /> */}
      {/* <PageContainer> */}
      {/* <SectionHeading title="Predialysis Record" subtitle="Predialysis Record" /> */}
      <Formik
        key={selectedSchedule} // force remount when schedule changes
        initialValues={{
          ...form,
          SA_ID_PK_FK: selectedSchedule || '', // always use parent's value
        }}
        enableReinitialize
        validationSchema={Yup.object({
          SA_ID_PK_FK: Yup.string().required('Schedule is required'),
          PreDR_Vitals_BP: Yup.string().required('Blood Pressure is required'),
          PreDR_Vitals_HeartRate: Yup.string().required('Heart Rate is required'),
          PreDR_Vitals_Temperature: Yup.string().required('Temperature is required'),
          PreDR_Vitals_Weight: Yup.string().required('Weight is required'),
          // PreDR_Vitals_Weight: Yup.number()
          //   .typeError('Weight must be a number')
          //   .required('Weight is required')
          //   .max(500, 'Weight must be valid'),

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
            const payload = { ...values, SA_ID_PK_FK: selectedSchedule };
            // Always use selectedSchedule as SA_ID_PK_FK for backend
            // Remove possible P_ID_FK from payload if not required by backend
            // if ('P_ID_FK' in payload) delete payload.P_ID_FK;
            delete (payload as any).P_ID_FK;


            console.log("Form values:", values);
            console.log("Payload to backend:", payload);

            const res = await fetch(`${API_URL}/data/predialysis_record`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to save');
            setSuccessMsg('Predialysis record saved successfully!');
            toast.success('Predialysis record saved successfully!');
            resetForm();
          } catch (err) {
            setErrorMsg('Error saving predialysis record.');
          }
          setSubmitting(false);
        }}
      >
        {({ values, isSubmitting, resetForm, errors, submitCount }) => (
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
            {/* <div className="form-group mb-0"> */}


            {/* <div className="form-group mb-0" >
              {(() => {
                const selectedScheduleObj = appointments.find(sch => sch.DS_ID_PK === values.SA_ID_PK_FK);
                const patient = selectedScheduleObj ? patients.find((p: any) => p.PreDR_ID_PK === selectedScheduleObj.P_ID_FK) : null;
                
                const labelText = selectedScheduleObj
                  ? `${selectedScheduleObj.DS_ID_PK} - ${patient ? patient.Name : selectedScheduleObj.P_ID_FK}`
                  : 'No schedule selected';
 
                // const labelText = `${selectedSchedule}`;


                return (
                  <label className="blueBar">
                    {labelText}
                  </label>
                );
              })()}
            </div> */}
            {/* <div className="form-group mb-0">
              {(() => {
                if (!appointments.length || !patients.length) {
                  return (
                    <label className="blueBar">
                      Loading schedule...
                    </label>
                  );
                }

                {(() => {
                  const selectedScheduleObj =
                    appointments.find((sch) => sch.DS_ID_PK === selectedSchedule);
                
                  const patient =
                    selectedScheduleObj &&
                    patients.find((p: any) => p.PreDR_ID_PK === selectedScheduleObj.P_ID_FK);
                
                  const labelText =
                    selectedScheduleObj
                      ? `${selectedScheduleObj.DS_ID_PK} - ${patient ? patient.Name : selectedScheduleObj.P_ID_FK}`
                      : (selectedSchedule ? "Loading schedule..." : "No schedule selected");
                
                  return <label className="blueBar">{labelText}</label>;
                })()}
                
              })()}
            </div> */}





            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label style={{ margin: '24px 0 8px', fontWeight: 600, fontSize: 18 }}>Vitals</label><br />
              <InputField
                label="Blood Pressure"
                name="PreDR_Vitals_BP"
                required
                placeholder="Enter blood pressure (e.g. 120/80)"
                disabled={isDisabled || !selectedSchedule}
                maxLength={3}
                inputMode="numeric"
                pattern="\d{1,3}"
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^0-9]/g, '').slice(0, 3);
                }}
              />
              <InputField
                label="Heart Rate"
                name="PreDR_Vitals_HeartRate"
                required
                placeholder="Enter heart rate (bpm)"
                disabled={isDisabled || !selectedSchedule}
                maxLength={3}
                inputMode="numeric"
                pattern="\d{1,3}"
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^0-9]/g, '').slice(0, 3);
                }}
              />
              <InputField
                label="Temperature"
                name="PreDR_Vitals_Temperature"
                required
                placeholder="Enter temperature (e.g. 100.333)"
                disabled={isDisabled || !selectedSchedule}
                inputMode="decimal"
                pattern="\d{1,3}(\.\d{1,3})?"
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const input = e.currentTarget;
                  let value = input.value;

                  // Allow only digits and a single decimal point
                  value = value.replace(/[^0-9.]/g, '');
                  const parts = value.split('.');

                  if (parts.length > 2) {
                    // Remove extra decimals
                    value = parts[0] + '.' + parts.slice(1).join('');
                  }

                  if (parts.length === 1) {
                    // Only integer part
                    value = parts[0].slice(0, 3);
                  } else if (parts.length === 2) {
                    const intPart = parts[0].slice(0, 3);
                    const decimalPart = parts[1].slice(0, 3);
                    value = intPart + '.' + decimalPart;
                  }

                  input.value = value;
                }}
              />




              <InputField
                label="Weight"
                name="PreDR_Vitals_Weight"
                required
                placeholder="Enter weight (kg)"
                disabled={isDisabled || !selectedSchedule}
                maxLength={3}
                inputMode="numeric"
                pattern="\d{1,3}"
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^0-9]/g, '').slice(0, 3);
                }}
              />


              <TextareaField
                label="Notes"
                name="PreDR_Notes"
                rows={3}
                placeholder="Enter any notes (optional)"
                disabled={isDisabled || !selectedSchedule}
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