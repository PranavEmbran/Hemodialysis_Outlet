import React from 'react';
import { Field, ErrorMessage } from 'formik';
import '../../styles/form-controls.css';

interface TimeFieldProps {
  label: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const TimeField: React.FC<TimeFieldProps> = ({
  label,
  name,
  required = false,
  disabled = false,
  className = '',
  id
}) => {
  const fieldId = id || name;

  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <Field
        type="time"
        id={fieldId}
        name={name}
        disabled={disabled}
        className="form-control"
        aria-describedby={`${fieldId}-error`}
      />
      <ErrorMessage name={name}>
        {(msg) => (
          <div id={`${fieldId}-error`} className="invalid-feedback">
            {msg}
          </div>
        )}
      </ErrorMessage>
    </div>
  );
};

export default TimeField; 