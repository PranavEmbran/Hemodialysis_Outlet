import React from 'react';
import { Field, ErrorMessage } from 'formik';
import '../../styles/form-controls.css';

interface CheckboxFieldProps {
  label: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
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
      <div className="form-check">
        <Field
          type="checkbox"
          id={fieldId}
          name={name}
          disabled={disabled}
          className="form-check-input"
          aria-describedby={`${fieldId}-error`}
        />
        <label htmlFor={fieldId} className="form-check-label">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      </div>
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

export default CheckboxField; 