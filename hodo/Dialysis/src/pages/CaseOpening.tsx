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
import SectionHeading from '../components/SectionHeading';
// import { Row, Col, Container } from 'react-bootstrap';

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

  // Validation schema
  const validationSchema = Yup.object({
    P_ID_FK: Yup.string().required('Patient ID is required.'),
    HCO_Blood_Group: Yup.string().required('Blood Group is required.'),
    HCO_Case_nature: Yup.string().required('Case Nature is required.'),
  });

  // Initial values
  const getInitialValues = () => ({
    P_ID_FK: '',
    HCO_ID_PK: uuidv4(),
    HCO_Blood_Group: '',
    HCO_Case_nature: 'Acute',
  });

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="Case Opening" subtitle="Case Opening" />

        {/* HCO Form Start */}
        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          onSubmit={(values, { resetForm }) => {
            console.log('HCO Form Submitted:', values);
          }}
        >
          {({ isSubmitting, resetForm, values }) => (
            <Form style={{ maxWidth: 500, margin: '2rem auto', padding: 24, background: '#f9f9f9', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
              <InputField
                label="Patient ID"
                name="P_ID_FK"
                required
                placeholder="Enter Patient ID"
              />
              {/* Hidden UUID field */}
              <InputField
                label="Case Opening ID (auto-generated)"
                name="HCO_ID_PK"
                type="text"
                disabled
                className="d-none"
              />
              <SelectField
                label="Blood Group"
                name="HCO_Blood_Group"
                options={bloodGroupOptions}
                required
                placeholder="Select Blood Group"
              />
              <RadioGroupField
                label="Case Nature"
                name="HCO_Case_nature"
                options={caseNatureOptions}
                required
              />
              <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 24 }}>
                <ButtonWithGradient
                  type="button"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); resetForm({ values: getInitialValues() }); }}
                  className="btn-outline"
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
        {/* HCO Form End */}


      </PageContainer>
      <Footer />
    </>
  );
};

export default CaseOpening; 