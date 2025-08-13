import React from 'react';
import { Field, ErrorMessage } from 'formik';
import '../../styles/form-controls.css';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement>{
  label: string;
  name: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'datetime-local' | 'time';
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
  id,
  ...rest // ← This line collects additional props
}) => {
  const fieldId = id || name;

  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={fieldId} className="form-label">
        {label}
        {/* {required && <span className="text-danger"> *</span>} */}
        <span className="required-indicator">{required ? '*' : '\u00A0'}</span>

      </label>
      <Field
        type={type}
        id={fieldId}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        className="form-control"
        aria-describedby={`${fieldId}-error`}
        {...rest}
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