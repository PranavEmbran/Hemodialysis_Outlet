import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { SelectField } from '../components/forms';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';

interface Patient {
  id: string;
  Name: string;
}

const PatientSearchDemo: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchMode, setSearchMode] = useState<'search' | 'traditional'>('search');

  const handlePatientSelect = (patient: Patient | null) => {
    setSelectedPatient(patient);
    console.log('Selected patient:', patient);
  };

  // Traditional options for comparison (simulated)
  const traditionalOptions = [
    { value: '1', label: 'John Doe (1)' },
    { value: '2', label: 'Jane Smith (2)' },
    { value: '3', label: 'Bob Johnson (3)' },
    // In reality, this would be 40,000+ options
  ];

  return (
    <PageContainer>
      <SectionHeading title="Patient Search Demo" />
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Mode Selector */}
        <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h5>Select Patient Loading Mode:</h5>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                value="search"
                checked={searchMode === 'search'}
                onChange={(e) => setSearchMode(e.target.value as 'search')}
              />
              Enhanced SelectField with Search (Recommended)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                value="traditional"
                checked={searchMode === 'traditional'}
                onChange={(e) => setSearchMode(e.target.value as 'traditional')}
              />
              Traditional SelectField (Limited options)
            </label>
          </div>
        </div>

        {/* Patient Selection Form */}
        <Formik
          initialValues={{
            patientId: '',
            notes: ''
          }}
          onSubmit={(values) => {
            console.log('Form submitted:', values);
            alert(`Form submitted with patient ID: ${values.patientId}`);
          }}
        >
          {({ values }) => (
            <Form>
              <div style={{ marginBottom: '2rem' }}>
                {searchMode === 'search' ? (
                  <SelectField
                    label="Search Patient"
                    name="patientId"
                    enablePatientSearch={true}
                    placeholder="Type patient name to search..."
                    required={true}
                    onPatientSelect={handlePatientSelect}
                  />
                ) : (
                  <SelectField
                    label="Traditional Patient Selection"
                    name="patientId"
                    options={traditionalOptions}
                    placeholder="Select from limited options..."
                    required={true}
                  />
                )}
              </div>

              {/* Selected Patient Info */}
              {selectedPatient && (
                <div style={{ 
                  marginBottom: '2rem', 
                  padding: '1rem', 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: '8px',
                  border: '1px solid #2196f3'
                }}>
                  <h6 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>Selected Patient:</h6>
                  <p style={{ margin: 0 }}>
                    <strong>ID:</strong> {selectedPatient.id}<br />
                    <strong>Name:</strong> {selectedPatient.Name}
                  </p>
                </div>
              )}

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setSelectedPatient(null);
                    // Reset form would go here
                  }}
                >
                  Clear
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  disabled={!values.patientId}
                >
                  Submit
                </button>
              </div>
            </Form>
          )}
        </Formik>

        {/* Performance Info */}
        <div style={{ 
          marginTop: '3rem', 
          padding: '1.5rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h5 style={{ marginBottom: '1rem', color: '#495057' }}>Performance Comparison</h5>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#d4edda', borderRadius: '4px' }}>
              <h6 style={{ color: '#155724', marginBottom: '0.5rem' }}>🔍 Enhanced SelectField with Search</h6>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                <li>Same familiar SelectField component</li>
                <li>Just add <code>enablePatientSearch=true</code></li>
                <li>Loads only 20 results per search</li>
                <li>Fast response time (&lt;200ms)</li>
                <li>Ideal for large datasets (40K+ records)</li>
              </ul>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
              <h6 style={{ color: '#856404', marginBottom: '0.5rem' }}>📄 Traditional SelectField</h6>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                <li>Loads all options upfront</li>
                <li>Slow with large datasets</li>
                <li>Memory intensive</li>
                <li>Not suitable for 40K+ records</li>
              </ul>
            </div>
          </div>
          
          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#cce5ff', borderRadius: '4px' }}>
            <strong style={{ color: '#004085' }}>💡 Recommendation:</strong> Simply add <code>enablePatientSearch=true</code> to your existing SelectField components. 
            No need to change your existing code structure!
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default PatientSearchDemo;