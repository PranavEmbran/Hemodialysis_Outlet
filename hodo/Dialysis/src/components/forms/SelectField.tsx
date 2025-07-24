import React from 'react';
import Select from 'react-select';
import { useField, useFormikContext } from 'formik';
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
  defaultValue?: Option | null;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  options,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  className = '',
  id,
  defaultValue
}) => {
  const fieldId = id || name;
  const [field, meta] = useField(name);
  const { setFieldValue, setFieldTouched } = useFormikContext<any>();

  const handleChange = (selectedOption: Option | null) => {
    setFieldValue(name, selectedOption ? selectedOption.value : '');
  };

  const selectedOption = options.find(opt => opt.value === field.value) || null;

  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>

      <Select
        inputId={fieldId}
        name={name}
        options={options}
        placeholder={placeholder}
        isDisabled={disabled}
        value={selectedOption || defaultValue}
        onChange={handleChange}
        onBlur={() => setFieldTouched(name, true)}
        isClearable
        classNamePrefix="react-select"
        className={`react-select-container ${meta.touched && meta.error ? 'is-invalid' : ''}`}
      />

      {meta.touched && meta.error && (
        <div id={`${fieldId}-error`} className="invalid-feedback">
          {meta.error}
        </div>
      )}
    </div>
  );
};

export default SelectField;
