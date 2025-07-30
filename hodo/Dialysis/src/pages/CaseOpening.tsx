import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { InputField, SelectField, RadioGroupField } from '../components/forms';
import ButtonWithGradient from '../components/ButtonWithGradient';
import { v4 as uuidv4 } from 'uuid';
// import HaemodialysisRecordDetails from '../components/HaemodialysisRecordDetails';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import Table from '../components/Table';
import Searchbar from '../components/Searchbar';
import SectionHeading from '../components/SectionHeading';
// import { Row, Col, Container } from 'react-bootstrap';
import { API_URL } from '../config';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const CaseOpening: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
  // Blood group options
  const bloodGroupOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A−' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B−' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB−' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O−' },
  ];
  // Case nature options
  const caseNatureOptions = [
    { value: 'Acute', label: 'Acute' },
    { value: 'Chronic', label: 'Chronic' },
  ];

  const [patientOptions, setPatientOptions] = useState<{ label: string; value: string }[]>([]);
  const [caseOpenings, setCaseOpenings] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/data/patients_derived`)
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPatientOptions(
            data.map((p: any) => ({
              label: `${p.id} - ${p.Name}`,
              value: p.id
            }))
          );
        }
      });
  }, []);

  // Fetch case openings
  useEffect(() => {
    fetch(`${API_URL}/data/case_openings`)
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Sort so last added is first (assuming records have a created/added field or fallback to array order)
          setCaseOpenings([...data].reverse());
        }
      });
  }, []);

  // Validation schema
  const validationSchema = Yup.object({
    P_ID_FK: Yup.string().required('Patient ID is required.'),
    DCO_Blood_Group: Yup.string().required('Blood Group is required.'),
    DCO_Case_nature: Yup.string().required('Case Nature is required.'),
  });

const [formKey, setFormKey] = useState(0);
const regenerateForm = () => setFormKey(prev => prev + 1);


  // Initial values
  const getInitialValues = () => ({
    P_ID_FK: '',
    DCO_ID_PK: uuidv4(),
    DCO_Blood_Group: '',
    DCO_Case_nature: 'Acute',
  });

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="Dialysis Case Opening" subtitle="Case Opening for Registered Patient" />

        {/* DCO Form Start */}
        <Formik
          key={formKey} // This forces Formik to re-render cleanly

          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          onSubmit={async (values, { resetForm }) => {
            try {
              const response = await fetch(`${API_URL}/data/case_openings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
              });
              if (!response.ok) {
                throw new Error('Failed to save case opening');
              }
              regenerateForm();
              // resetForm({ values: getInitialValues() });



              // Refresh case openings after successful submit
              fetch(`${API_URL}/data/case_openings`)
                .then(res => res.json())
                .then((data) => {
                  if (Array.isArray(data)) {
                    setCaseOpenings([...data].reverse());
                  }
                });
              toast.success('Case opening saved successfully!');
            } catch (error) {
              toast.error('Error saving case opening');
              console.error(error);
            }
          }}
        >
          {({ isSubmitting, resetForm, values }) => (
            <Form style={{ height: 320, margin: '0rem auto', padding: '24px', background: 'none', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '32px', rowGap: '16px' }}>
                <SelectField
                  label="Select Patient"
                  name="P_ID_FK"
                  options={patientOptions}
                  required
                  placeholder="Select Patient"
                />
                {/* Hidden UUID field */}
                <InputField
                  label="Case Opening ID (auto-generated)"
                  name="DCO_ID_PK"
                  type="text"
                  disabled
                  className="d-none"
                />
                <SelectField
                  label="Blood Group"
                  name="DCO_Blood_Group"
                  options={bloodGroupOptions}
                  required
                  placeholder="Select Blood Group"
                />
                <RadioGroupField
                  label="Case Nature"
                  name="DCO_Case_nature"
                  options={caseNatureOptions}
                  required
                />
              </div>
              {/* <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 24 }}> */}
              <div style={{ display: 'flex', gap: 16, justifyContent: 'left', marginTop: 24 }}>
                <ButtonWithGradient
                  type="button"
                  // onClick={() => resetForm({ values: getInitialValues() })}
                  onClick={regenerateForm}
                  className="btn-outline redButton"
                >
                  Reset
                </ButtonWithGradient>
                <ButtonWithGradient
                  type="submit"
                  processing={isSubmitting}
                  className=""
                >
                  Submit
                </ButtonWithGradient>
              </div>

            </Form>
          )}
        </Formik>
        {/* DCO Form End */}

        {/* Case Openings Table */}
        <div style={{ marginTop: 40 }}>
          <h4 className="blueBar">Case Openings</h4>
          <Searchbar
            value={searchText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
          />
          <Table
            columns={[
              { key: 'P_ID_FK', header: 'Patient ID' },
              { key: 'PatientName', header: 'Patient Name' },
              { key: 'DCO_Blood_Group', header: 'Blood Group' },
              { key: 'DCO_Case_nature', header: 'Case Nature' },
            ]}
            data={caseOpenings
              .map(row => ({
                ...row,
                PatientName: (patientOptions.find(p => p.value === row.P_ID_FK)?.label?.split(' - ')[1]) || row.P_ID_FK
              }))
              .filter(row => {
                const q = searchText.toLowerCase();
                return (
                  row.P_ID_FK?.toLowerCase().includes(q) ||
                  row.PatientName?.toLowerCase().includes(q) ||
                  row.DCO_Blood_Group?.toLowerCase().includes(q) ||
                  row.DCO_Case_nature?.toLowerCase().includes(q)
                );
              })
            }
          />
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default CaseOpening;