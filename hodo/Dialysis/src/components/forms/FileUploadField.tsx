import React from 'react';
import { Field, ErrorMessage } from 'formik';
import '../../styles/form-controls.css';

interface FileUploadFieldProps {
  label: string;
  name: string;
  accept?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  name,
  accept,
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
      <div className="file-upload-wrapper">
        <Field
          type="file"
          id={fieldId}
          name={name}
          accept={accept}
          disabled={disabled}
          className="file-upload-input"
          aria-describedby={`${fieldId}-error`}
        />
        <label htmlFor={fieldId} className="file-upload-label">
          Choose File
          <span className="file-upload-text">No file chosen</span>
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

export default FileUploadField; 