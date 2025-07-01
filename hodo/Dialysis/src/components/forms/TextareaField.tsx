import React from 'react';
import { Field, ErrorMessage } from 'formik';
import '../../styles/form-controls.css';

interface TextareaFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  rows?: number;
}

const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  name,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  id,
  rows = 3
}) => {
  const fieldId = id || name;

  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <Field
        as="textarea"
        id={fieldId}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
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

export default TextareaField; 