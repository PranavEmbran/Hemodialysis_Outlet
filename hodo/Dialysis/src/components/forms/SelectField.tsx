import React from 'react';
import { Field, ErrorMessage } from 'formik';
import '../../styles/form-controls.css';

interface Option {
  label: string;
  value: string | number;
}

interface SelectFieldProps {
  label: string;
  name: string;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  options,
  placeholder = 'Select an option',
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
        as="select"
        id={fieldId}
        name={name}
        disabled={disabled}
        className="form-select"
        aria-describedby={`${fieldId}-error`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Field>
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

export default SelectField; 