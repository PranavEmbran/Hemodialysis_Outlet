import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import { InputField, TextareaField } from '../components/forms';
import ButtonWithGradient from '../components/ButtonWithGradient';
import { API_URL } from '../config';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

const Post_Dialysis_Record: React.FC<{
  selectedSchedule?: string;
  records?: any[];
  onSaveSuccess?: () => void;
}> = ({ selectedSchedule, records = [], onSaveSuccess }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  const [form, setForm] = useState({
    SA_ID_PK_FK: '',
    P_ID_FK: '',
    PostDR_Vitals_BP: '',
    PostDR_Vitals_HeartRate: '',
    PostDR_Vitals_Temperature: '',
    PostDR_Vitals_Weight: '',
    PostDR_Notes: '',
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

  useEffect(() => {
    if (selectedSchedule && appointments.length > 0) {
      setForm(prev => {
        if (prev.SA_ID_PK_FK !== selectedSchedule) {
          const selected = appointments.find(a => a.DS_ID_PK === selectedSchedule);
          let patientName = '';
          if (selected) {
            const patient = patients.find((p: any) => p.id === selected.P_ID_FK);
            patientName = patient ? patient.Name : '';
          }
          return { ...prev, SA_ID_PK_FK: selectedSchedule, P_ID_FK: patientName };
        }
        return prev;
      });
    }
    if (!selectedSchedule) {
      setForm(prev => ({ ...prev, SA_ID_PK_FK: '', P_ID_FK: '' }));
    }
  }, [selectedSchedule, appointments, patients]);

  const isDisabled = !!(selectedSchedule && records.some((rec: any) =>
    rec.SA_ID_PK_FK === selectedSchedule || rec.SA_ID_FK === selectedSchedule
  ));

  return (
    <>
      {isDisabled && (
        <div style={{ color: 'red', marginBottom: 16 }}>
          Postdialysis form is disabled because a record already exists for the selected schedule.
        </div>
      )}
      <Formik
        key={selectedSchedule}
        initialValues={{
          ...form,
          SA_ID_PK_FK: selectedSchedule || '',
        }}
        enableReinitialize
        validationSchema={Yup.object({
          SA_ID_PK_FK: Yup.string().required('Schedule is required'),
          PostDR_Vitals_BP: Yup.string().required('Blood Pressure is required'),
          PostDR_Vitals_HeartRate: Yup.string().required('Heart Rate is required'),
          PostDR_Vitals_Temperature: Yup.string().required('Temperature is required'),
          PostDR_Vitals_Weight: Yup.string().required('Weight is required'),
          PostDR_Notes: Yup.string(),
        })}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          setSuccessMsg('');
          setErrorMsg('');
          if (!selectedSchedule) {
            setErrorMsg('Please select a schedule before saving.');
            setSubmitting(false);
            return;
          }
          try {
            const payload = { ...values, SA_ID_PK_FK: selectedSchedule };
            delete (payload as any).P_ID_FK;

            const res = await fetch(`${API_URL}/data/post_dialysis_record`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to save');
            setSuccessMsg('Postdialysis record saved successfully!');
            toast.success('Postdialysis record saved successfully!');
            resetForm();
            if (onSaveSuccess) onSaveSuccess();
          } catch (err) {
            setErrorMsg('Error saving postdialysis record.');
            toast.error('Error saving postdialysis record.');
          }
          setSubmitting(false);
        }}
      >
        {({ values, isSubmitting, resetForm, errors, submitCount }) => (
          <Form style={{ margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 24 }}>
            {Object.keys(errors).length > 0 && submitCount > 0 && (
              <div style={{ color: 'red', background: '#fff2f2', border: '1px solid #ffcccc', padding: 10, borderRadius: 5, marginBottom: 16, textAlign: 'center' }}>
                Please fill in the following required fields:
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
            {/* <div className="form-group mb-0">
              {(() => {
                const selectedScheduleObj = appointments.find(sch => sch.DS_ID_PK === values.SA_ID_PK_FK);
                const patient = selectedScheduleObj ? patients.find((p: any) => p.id === selectedScheduleObj.P_ID_FK) : null;
                const labelText = selectedScheduleObj
                  ? `${selectedScheduleObj.DS_ID_PK} - ${patient ? patient.Name : selectedScheduleObj.P_ID_FK}`
                  : 'No schedule selected';
                return <label className="blueBar">{labelText}</label>;
              })()}
            </div> */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label style={{ margin: '24px 0 8px', fontWeight: 600, fontSize: 18 }}>Vitals</label><br />
              <InputField
                label="Blood Pressure"
                name="PostDR_Vitals_BP"
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
                name="PostDR_Vitals_HeartRate"
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
                name="PostDR_Vitals_Temperature"
                required
                placeholder="Enter temperature (e.g. 100.333)"
                disabled={isDisabled || !selectedSchedule}
                inputMode="decimal"
                pattern="\d{1,3}(\.\d{1,3})?"
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const input = e.currentTarget;
                  let value = input.value;
                  value = value.replace(/[^0-9.]/g, '');
                  const parts = value.split('.');
                  if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
                  if (parts.length === 1) value = parts[0].slice(0, 3);
                  else if (parts.length === 2) {
                    const intPart = parts[0].slice(0, 3);
                    const decimalPart = parts[1].slice(0, 3);
                    value = intPart + '.' + decimalPart;
                  }
                  input.value = value;
                }}
              />
              <InputField
                label="Weight"
                name="PostDR_Vitals_Weight"
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
                name="PostDR_Notes"
                rows={3}
                placeholder="Enter any notes (optional)"
                disabled={isDisabled || !selectedSchedule}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'left', marginTop: 16 }}>
              <ButtonWithGradient
                type="button"
                className="btn-outline redButton"
                onClick={() => {
                  resetForm();
                  setSuccessMsg('');
                  setErrorMsg('');
                }}
                disabled={!selectedSchedule || isSubmitting}
              >
                Reset
              </ButtonWithGradient>
              <ButtonWithGradient type="submit" disabled={!selectedSchedule || isSubmitting}>
                Save
              </ButtonWithGradient>
            </div>
            {successMsg && <div style={{ color: 'green', marginTop: 16, textAlign: 'center' }}>{successMsg}</div>}
            {errorMsg && <div style={{ color: 'red', marginTop: 16, textAlign: 'center' }}>{errorMsg}</div>}
          </Form>
        )}
      </Formik>
    </>
  );
};

export default Post_Dialysis_Record;
