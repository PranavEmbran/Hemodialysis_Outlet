import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import type {FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { patientsApi } from '../api/patientsApi';
import './PatientRegistration.css';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import Header from '../components/Header';
import type { Patient } from '../types';
import SectionHeading from '../components/SectionHeading';
import { Row, Col, Container } from 'react-bootstrap';
import ButtonWithGradient from '../components/ButtonWithGradient';
import img1 from '../assets/patient1.png';
import { InputField, SelectField, DateField } from '../components/forms';
import { useDialysis } from '../context/DialysisContext';

interface PatientFormValues {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  mobileNo: string;
  bloodGroup: string;
  catheterInsertionDate: string;
  fistulaCreationDate: string;
}

const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  gender: Yup.string().required('Gender is required'),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  mobileNo: Yup.string()
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
    .required('Mobile number is required'),
  bloodGroup: Yup.string().required('Blood group is required'),
  catheterInsertionDate: Yup.date().required('Catheter insertion date is required'),
  fistulaCreationDate: Yup.date().required('Fistula creation date is required')
});

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const PatientRegistration: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { refreshPatients } = useDialysis();

  const handleSubmit = async (values: PatientFormValues, { resetForm }: FormikHelpers<PatientFormValues>) => {
    try {
      const patientData = {
        ...values,
        name: `${values.firstName} ${values.lastName}`,
        catheterDate: values.catheterInsertionDate,
        fistulaDate: values.fistulaCreationDate,
        phone: values.mobileNo,
      };
      const response = await patientsApi.addPatient(patientData);
      if (response) {
        setSuccess(true);
        setError('');
        resetForm();
        await refreshPatients();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register patient. Please try again.');
    }
  };

  return (
    <>

      {/* <Container fluid className={`home-container py-2 ${sidebarCollapsed ? 'collapsed' : ''}`}> */}
        {/* <div className={`patient-container py-2 ${sidebarCollapsed ? 'collapsed' : ''}`}> */}
        <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <PageContainer>
          {/* <div className="main-container"> */}
          {/* <div style={{ width: '100%', padding: '10px',marginTop: '-20px' }}> */}
          <SectionHeading title="Patient Registration" subtitle="Register new patients and manage patient details" />
          {/* </div> */}



          <div className="patient-registration-flex">
            <div className="patient-image-container">
              <img src={img1} alt="Patient" className="patient-image" />
            </div>
            <div className="patient-registration-content">

              {success && (
                <div className="alert alert-success">
                  Patient registered successfully!
                  <button type="button" className="btn-close" onClick={() => setSuccess(false)}></button>
                </div>
              )}
              {error && (
                <div className="alert alert-danger">
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              )}
              <Formik
                initialValues={{
                  firstName: '',
                  lastName: '',
                  gender: '',
                  dateOfBirth: '',
                  mobileNo: '',
                  bloodGroup: '',
                  catheterInsertionDate: '',
                  fistulaCreationDate: ''
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <div className="patient-form">
                    <Form className="patient-registration-form">
                      <div className="row">
                        <div className="col-md-6">
                          <InputField
                            label="First Name"
                            name="firstName"
                            placeholder="Enter first name"
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <InputField
                            label="Last Name"
                            name="lastName"
                            placeholder="Enter last name"
                            required
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <SelectField
                            label="Gender"
                            name="gender"
                            options={[
                              { label: 'Male', value: 'Male' },
                              { label: 'Female', value: 'Female' },
                              { label: 'Other', value: 'Other' }
                            ]}
                            placeholder="Select Gender"
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <DateField
                            label="Date of Birth"
                            name="dateOfBirth"
                            required
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <InputField
                            label="Mobile Number"
                            name="mobileNo"
                            type="text"
                            placeholder="10-digit mobile number"
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <SelectField
                            label="Blood Group"
                            name="bloodGroup"
                            options={bloodGroups.map(group => ({
                              label: group,
                              value: group
                            }))}
                            placeholder="Select Blood Group"
                            required
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <DateField
                            label="Catheter Insertion Date"
                            name="catheterInsertionDate"
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <DateField
                            label="Fistula Creation Date"
                            name="fistulaCreationDate"
                            required
                          />
                        </div>
                      </div>

                      <div className="text-center mt-4">
                        <ButtonWithGradient
                          type="submit"
                          className="mx-auto block"
                          disabled={isSubmitting}
                          text={isSubmitting ? 'Registering...' : 'Register Patient'}
                        />
                      </div>
                    </Form>
                  </div>
                )}
              </Formik>
            </div>
          </div>
          {/* </div> */}
        </PageContainer>
        <Footer />
      {/* </Container> */}
    </>
  );
};

export default PatientRegistration; 