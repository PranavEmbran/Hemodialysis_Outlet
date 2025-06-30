import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage} from 'formik';
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
  // const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

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
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register patient. Please try again.');
    }
  };

  return (
    <>

      <Container fluid className={`home-container py-2 ${sidebarCollapsed ? 'collapsed' : ''}`}>
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
                          <div className="form-group">
                            <label htmlFor="firstName" className="form-label">First Name</label>
                            <Field
                              type="text"
                              id="firstName"
                              name="firstName"
                              className="form-control"
                            />
                            <ErrorMessage name="firstName" component="div" className="text-danger" />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="lastName" className="form-label">Last Name</label>
                            <Field
                              type="text"
                              id="lastName"
                              name="lastName"
                              className="form-control"
                            />
                            <ErrorMessage name="lastName" component="div" className="text-danger" />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="gender" className="form-label">Gender</label>
                            <Field as="select" id="gender" name="gender" className="form-select">
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </Field>
                            <ErrorMessage name="gender" component="div" className="text-danger" />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                            <Field
                              type="date"
                              id="dateOfBirth"
                              name="dateOfBirth"
                              className="form-control"
                            />
                            <ErrorMessage name="dateOfBirth" component="div" className="text-danger" />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="mobileNo" className="form-label">Mobile Number</label>
                            <Field
                              type="text"
                              id="mobileNo"
                              name="mobileNo"
                              className="form-control"
                              placeholder="10-digit mobile number"
                            />
                            <ErrorMessage name="mobileNo" component="div" className="text-danger" />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="bloodGroup" className="form-label">Blood Group</label>
                            <Field as="select" id="bloodGroup" name="bloodGroup" className="form-select">
                              <option value="">Select Blood Group</option>
                              {bloodGroups.map(group => (
                                <option key={group} value={group}>{group}</option>
                              ))}
                            </Field>
                            <ErrorMessage name="bloodGroup" component="div" className="text-danger" />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="catheterInsertionDate" className="form-label">Catheter Insertion Date</label>
                            <Field
                              type="date"
                              id="catheterInsertionDate"
                              name="catheterInsertionDate"
                              className="form-control"
                            />
                            <ErrorMessage name="catheterInsertionDate" component="div" className="text-danger" />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="fistulaCreationDate" className="form-label">Fistula Creation Date</label>
                            <Field
                              type="date"
                              id="fistulaCreationDate"
                              name="fistulaCreationDate"
                              className="form-control"
                            />
                            <ErrorMessage name="fistulaCreationDate" component="div" className="text-danger" />
                          </div>
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
      </Container>
    </>
  );
};

export default PatientRegistration; 