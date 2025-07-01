import React from 'react';
import { Field, ErrorMessage } from 'formik';
import '../../styles/form-controls.css';

interface DateFieldProps {
  label: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const DateField: React.FC<DateFieldProps> = ({
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
        type="date"
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

export default DateField; 