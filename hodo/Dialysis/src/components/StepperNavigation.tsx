import React from 'react';
import ButtonWithGradient from './ButtonWithGradient';

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
}

const steps = [
  'Predialysis',
  'Start Dialysis',
  // 'Haemodialysis Details',
  'Post Dialysis',
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
}) => {
  // Filter schedules by patient and date
  const filteredSchedules = scheduleOptions.filter(opt => {
    const patientMatch = !selectedPatient || opt.patientId === selectedPatient;
    const dateMatch = !selectedDate || opt.date === selectedDate;
    return patientMatch && dateMatch;
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', marginBottom: 32 }}>
      {/* Filters Row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 24 }}>
        {/* Patient Dropdown */}
        <div className="form-group">
          <label style={{ fontWeight: 600 }}>Select Patient</label>
          <select
            value={selectedPatient}
            onChange={onPatientChange}
            className="form-control"
            style={{ minWidth: 180 }}
          >
            <option value="">All Patients</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        {/* Date Picker */}
        <div className="form-group">
          <label style={{ fontWeight: 600 }}>Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={onDateChange}
            className="form-control"
            style={{ minWidth: 140 }}
          />
        </div>
        {/* Schedule Dropdown */}
        <div className="form-group" style={{ flex: 1 }}>
          <label style={{ fontWeight: 600 }}>Select Schedule</label>
          <select
            value={selectedSchedule}
            onChange={onScheduleChange}
            className="form-control"
          >
            <option value="">Select Schedule</option>
            {filteredSchedules.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Stepper */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
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
      </div>
    </div>
  );
};

export default StepperNavigation; 