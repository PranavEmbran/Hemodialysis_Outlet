import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import { useField, useFormikContext } from 'formik';
import { API_URL } from '../../config';
import '../../styles/form-controls.css';

interface Option {
  label: string;
  value: string | number;
}

interface Patient {
  id: string;
  Name: string;
}

interface SelectFieldProps {
  label: string;
  name: string;
  options?: Option[]; // Made optional for patient search mode
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  defaultValue?: Option | null;
  // New props for patient search functionality
  enablePatientSearch?: boolean;
  onPatientSelect?: (patient: Patient | null) => void;
  searchPlaceholder?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  options = [],
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  className = '',
  id,
  defaultValue,
  enablePatientSearch = false,
  onPatientSelect,
  searchPlaceholder = 'Type to search patients...'
}) => {
  const fieldId = id || name;
  const [field, meta] = useField(name);
  const { setFieldValue, setFieldTouched } = useFormikContext<any>();

  // Patient search state
  const [searchOptions, setSearchOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Debounced search function for patients
  const searchPatients = useCallback(
    async (searchTerm: string) => {
      if (!enablePatientSearch || searchTerm.length < 2) {
        setSearchOptions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/data/patients/search?q=${encodeURIComponent(searchTerm)}&limit=20`
        );
        
        if (response.ok) {
          const patients: Patient[] = await response.json();
          const patientOptions = patients.map(patient => ({
            value: patient.id,
            label: `${patient.Name} (${patient.id})`
          }));
          setSearchOptions(patientOptions);
        } else {
          console.error('Failed to search patients:', response.statusText);
          setSearchOptions([]);
        }
      } catch (error) {
        console.error('Error searching patients:', error);
        setSearchOptions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [enablePatientSearch]
  );

  // Debounce search input
  useEffect(() => {
    if (enablePatientSearch) {
      const timeoutId = setTimeout(() => {
        if (inputValue) {
          searchPatients(inputValue);
        }
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [inputValue, searchPatients, enablePatientSearch]);

  const handleChange = (selectedOption: Option | null) => {
    const value = selectedOption ? selectedOption.value : '';
    setFieldValue(name, value);
    
    // Call patient select callback if in patient search mode
    if (enablePatientSearch && onPatientSelect) {
      if (selectedOption) {
        const patient: Patient = {
          id: selectedOption.value.toString(),
          Name: selectedOption.label.split(' (')[0] // Extract name from label
        };
        onPatientSelect(patient);

        // 🛠 This will close the menu:
        setInputValue('');
        setSearchOptions([]);

      } else {
        onPatientSelect(null);
      }
    }
  };

  const handleInputChange = (newValue: string) => {
    if (enablePatientSearch) {
      setInputValue(newValue);
      return newValue;
    }
    return newValue;
  };

  // Use search options if in patient search mode, otherwise use provided options
  const currentOptions = enablePatientSearch ? searchOptions : options;
  const selectedOption = currentOptions.find(opt => opt.value === field.value) || options.find(opt => opt.value === field.value) || defaultValue || null;
  const currentPlaceholder = enablePatientSearch ? searchPlaceholder : placeholder;

  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && <span className="text-danger"> *</span>}
        {enablePatientSearch && (
          <small className="text-muted ms-2">
            (Type to search from 40K+ patients)
          </small>
        )}
      </label>

      <Select
        inputId={fieldId}
        name={name}
        options={currentOptions || options}
        placeholder={currentPlaceholder || placeholder}
        isDisabled={disabled}
        value={selectedOption || defaultValue}
        onChange={handleChange}
        onInputChange={enablePatientSearch ? handleInputChange : undefined}
        onBlur={() => setFieldTouched(name, true)}
        isClearable
        isLoading={enablePatientSearch ? isLoading : false}
        loadingMessage={() => 'Searching patients...'}
        noOptionsMessage={({ inputValue }) => 
          enablePatientSearch 
            ? (inputValue && inputValue.length < 2 
                ? 'Type at least 2 characters to search' 
                : 'Type to search')
            : 'No options available'
        }
        classNamePrefix="react-select"
        className={`react-select-container ${meta.touched && meta.error ? 'is-invalid' : ''}`}
        filterOption={enablePatientSearch ? () => true : undefined} // Disable built-in filtering for patient search
        // menuIsOpen={enablePatientSearch ? (inputValue.length >= 2 || currentOptions.length > 0) : undefined}
        menuIsOpen={undefined}
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
