import React from 'react';
import { API_URL } from '../config';
import Breadcrumb from './Breadcrumb';
import { SelectField, InputField } from './forms';
import { Formik, Form } from 'formik';
import { useEffect } from 'react';
import DateRangeSelector from './DateRangeSelector';
import './StepperNavigation.css';

interface StepperNavigationProps {
  selectedSchedule: string;
  onScheduleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  scheduleOptions: { value: string; label: string; patientId: string; date: string }[];
  currentStep: number;
  onStepChange: (step: number) => void;
  patients: { id: string; name: string }[];
  selectedPatient: string;
  onPatientChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedDate: string;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fromDate?: string;
  toDate?: string;
  onFromDateChange?: (date: string) => void;
  onToDateChange?: (date: string) => void;
  showDateRangeFilter?: boolean;
}

const steps = [
  'Predialysis Data',
  'Start-Up Data',
  // 'Haemodialysis Details',
  'Post Dialysis Data',
];


const StepperNavigation: React.FC<StepperNavigationProps> = ({
  selectedSchedule,
  onScheduleChange,
  scheduleOptions,
  currentStep,
  onStepChange,
  patients,
  selectedPatient,
  onPatientChange,
  selectedDate,
  onDateChange,
  fromDate = '',
  toDate = '',
  onFromDateChange = () => { },
  onToDateChange = () => { },
  showDateRangeFilter = false,
}) => {
  // --- FILTER PATIENTS BASED ON CASE OPENINGS (DYNAMIC FETCH) ---
  const [caseOpenings, setCaseOpenings] = React.useState<{ DCO_P_ID_FK: string }[]>([]);
  React.useEffect(() => {
    const fetchCaseOpenings = async () => {
      try {
        const res = await fetch(`${API_URL}/data/case_openings`);
        if (res.ok) {
          const data = await res.json();
          setCaseOpenings(Array.isArray(data) ? data : []);
        } else {
          setCaseOpenings([]);
        }
      } catch {
        setCaseOpenings([]);
      }
    };
    fetchCaseOpenings();
  }, []);
  // const allowedPatientIds = new Set(caseOpenings.map((c) => c.P_ID_FK));
  const allowedPatientIds = new Set(
    caseOpenings
      .map(c => c.DCO_P_ID_FK)
      .filter(pid => !!pid)
  );
  const filteredPatients = patients.filter(p => allowedPatientIds.has(p.id));

  // Filter schedules by patient and date range
  // Sort filtered schedules so the latest date is first
  const filteredSchedules = scheduleOptions
    .filter(opt => {
      const patientMatch = !selectedPatient || opt.patientId === selectedPatient;
      const specificDateMatch = !selectedDate || opt.date === selectedDate;

      // Date range filtering
      let dateRangeMatch = true;
      if (fromDate || toDate) {
        const optDate = opt.date;
        if (fromDate && optDate < fromDate) dateRangeMatch = false;
        if (toDate && optDate > toDate) dateRangeMatch = false;
      }

      return patientMatch && specificDateMatch && dateRangeMatch;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  // console.log('scheduleOptions:', scheduleOptions);
  // console.log('filteredSchedules:', filteredSchedules);






  return (
    <div style={{ margin: '0 auto', marginBottom: 32, marginTop: 0 }}>

      {/* Blue Bar showing selected schedule */}
      {/* {selectedSchedule && (
        <div>
          <label className="blueBar">
            {(() => {
              const selected = scheduleOptions.find(sch => sch.value === selectedSchedule);
              return selected?.label || `Schedule ID: ${selectedSchedule}`;
            })()}
          </label>
        </div>
      )} */}

      {/* Stepper */}
      {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        {steps.map((step, idx) => (
          <React.Fragment key={step}>
            <button
              type="button"
              onClick={() => onStepChange(idx)}
              style={{
                background: idx === currentStep ? 'linear-gradient(135deg, rgb(5, 130, 172), rgb(16, 85, 97))' : idx < currentStep ? '#90caf9' : '#e0e0e0',
                color: idx === currentStep ? '#fff' : '#333',
                border: 'none',
                borderRadius: 20,
                padding: '8px 20px',
                fontWeight: idx === currentStep ? 700 : 500,
                cursor: 'pointer',
                minWidth: 120,
                transition: 'background 0.2s',
                boxShadow: idx === currentStep ? '0 2px 8px #b3c6e6' : 'none',
              }}
            >
              {step}
            </button>
            {idx < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: idx < currentStep ? '#1976d2' : '#e0e0e0', margin: '0 8px' }} />
            )}
          </React.Fragment>
        ))}
      </div> */}

      <div>
        <Breadcrumb
          steps={steps.map((label) => ({ label }))}
          activeStep={currentStep}
          onStepClick={onStepChange}
        />
      </div>

      {/* Filters Row */}
      <Formik
        initialValues={{
          selectedPatient: selectedPatient || '',
          selectedDate: selectedDate || '',
          selectedSchedule: selectedSchedule || '',
        }}
        onSubmit={() => { }}
        enableReinitialize
      >
        {({ values, setFieldValue }) => {
          // Defensive sync: if parent's selectedSchedule changes, update Formik
          React.useEffect(() => {
            if (selectedSchedule !== values.selectedSchedule) {
              setFieldValue('selectedSchedule', selectedSchedule || '');
            }
          }, [selectedSchedule]);

          useEffect(() => {
            if (values.selectedPatient !== selectedPatient) {
              onPatientChange({ target: { value: values.selectedPatient } } as React.ChangeEvent<HTMLSelectElement>);
            }
            // eslint-disable-next-line
          }, [values.selectedPatient]);
          useEffect(() => {
            if (values.selectedDate !== selectedDate) {
              onDateChange({ target: { value: values.selectedDate } } as React.ChangeEvent<HTMLInputElement>);
            }
            // eslint-disable-next-line
          }, [values.selectedDate]);
          useEffect(() => {
            if (values.selectedSchedule !== selectedSchedule) {
              onScheduleChange({ target: { value: values.selectedSchedule } } as React.ChangeEvent<HTMLSelectElement>);
            }
            // eslint-disable-next-line
          }, [values.selectedSchedule]);
          return (
            <Form style={{ width: '100%', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16, marginBottom: 24 }}>
              <div style={{ minWidth: '250px', flex: '1 1 250px' }}>
                <SelectField
                  label="Select Patient"
                  name="selectedPatient"
                  options={filteredPatients.map(p => ({ value: p.id, label: `${p.name} (${p.id})` }))}

                  enablePatientSearch={false}
                  placeholder="Type patient name or ID to search..."
                  className="form-group"
                  required={false}
                  onPatientSelect={(patient) => {
                    if (patient) {
                      console.log('Selected patient:', patient);
                    }
                  }}
                />
              </div>

              {/* Only show DateRangeSelector if explicitly enabled */}
              {showDateRangeFilter && (
                <div style={{ minWidth: '250px', flex: '1 1 250px' }}>
                  <DateRangeSelector
                    fromDate={fromDate}
                    toDate={toDate}
                    onFromDateChange={onFromDateChange}
                    onToDateChange={onToDateChange}
                    label="Date Range Filter"
                  />
                </div>
              )}

              <div style={{ minWidth: '250px', flex: '1 1 250px' }}>
                <InputField
                  label="Specific Date"
                  name="selectedDate"
                  type="date"
                  className="form-group"
                  required={false}
                />
              </div>
              
              <div style={{ minWidth: '250px', flex: '1 1 250px' }}>
                <SelectField
                  label="Select Schedule"
                  name="selectedSchedule"
                  options={filteredSchedules.map(opt => ({ value: opt.value, label: opt.label }))}
                  placeholder="Select Schedule"
                  className="form-group"
                  required={true}
                />
              </div>
            </Form>
          );
        }}
      </Formik>
      {/* Blue Bar showing selected schedule */}
      {
        //  selectedSchedule && (
        <div>
          <label className="blueBar">
            {(() => {
              const selected = scheduleOptions.find(sch => sch.value === selectedSchedule);
              // return selected?.label || `Schedule ID: ${selectedSchedule}`;
              return selected?.label ?? (`${selectedSchedule ?? ''}` || '  |');

            })()}
          </label>
        </div>
        // )
      }
    </div>
  );
};

export default StepperNavigation; 