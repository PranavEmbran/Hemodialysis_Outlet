import React from 'react';
import { Field, ErrorMessage } from 'formik';
import '../../styles/form-controls.css';

interface Option {
  label: string;
  value: string | number;
}

interface RadioGroupFieldProps {
  label: string;
  name: string;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const RadioGroupField: React.FC<RadioGroupFieldProps> = ({
  label,
  name,
  options,
  required = false,
  disabled = false,
  className = '',
  id
}) => {
  const fieldId = id || name;

  return (
    <div className={`form-group ${className}`}>
      <label className="form-label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <div className="radio-group">
        {options.map((option, index) => (
          <div key={option.value} className="form-check">
            <Field
              type="radio"
              id={`${fieldId}-${index}`}
              name={name}
              value={option.value}
              disabled={disabled}
              className="form-check-input"
              aria-describedby={`${fieldId}-error`}
            />
            <label htmlFor={`${fieldId}-${index}`} className="form-check-label">
              {option.label}
            </label>
          </div>
        ))}
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

export default RadioGroupField; 