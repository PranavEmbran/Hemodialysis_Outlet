import React from 'react';
import { Field, ErrorMessage } from 'formik';
import '../../styles/form-controls.css';

interface InputFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'email' | 'password';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
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
        type={type}
        id={fieldId}
        name={name}
        placeholder={placeholder}
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

export default InputField; 