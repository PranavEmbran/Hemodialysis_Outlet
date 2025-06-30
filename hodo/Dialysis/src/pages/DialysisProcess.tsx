import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { historyApi } from '../api/historyApi';
import { patientsApi } from '../api/patientsApi';
import './DialysisProcess.css';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import Header from '../components/Header';
import { Patient } from '../types';
import SectionHeading from '../components/SectionHeading';
import ButtonWithGradient from '../components/ButtonWithGradient';

interface VitalSigns {
  bloodPressure: string;
  heartRate: number | string;
  temperature: number | string;
  weight: number | string;
}

interface LabResults {
  urea: number | string;
  creatinine: number | string;
  potassium: number | string;
  sodium: number | string;
}

interface TreatmentParameters {
  dialyzer: string;
  bloodFlow: number | string;
  dialysateFlow: number | string;
  ultrafiltration: number | string;
}

interface DialysisProcessFormValues {
  patientId: string;
  startTime: string;
  endTime: string;
  vitalSigns: {
    preDialysis: VitalSigns;
    postDialysis: VitalSigns;
  };
  treatmentParameters: TreatmentParameters;
  nursingNotes: string;
}

const validationSchema = Yup.object({
  patientId: Yup.string().required('Patient selection is required'),
  startTime: Yup.string().required('Start time is required'),
  endTime: Yup.string().required('End time is required'),
  vitalSigns: Yup.object({
    preDialysis: Yup.object({
      bloodPressure: Yup.string().optional(),
      heartRate: Yup.number().optional(),
      temperature: Yup.number().optional(),
      weight: Yup.number().optional()
    }),
    postDialysis: Yup.object({
      bloodPressure: Yup.string().optional(),
      heartRate: Yup.number().optional(),
      temperature: Yup.number().optional(),
      weight: Yup.number().optional()
    })
  }),
  treatmentParameters: Yup.object({
    dialyzer: Yup.string().optional(),
    bloodFlow: Yup.number().optional(),
    dialysateFlow: Yup.number().optional(),
    ultrafiltration: Yup.number().optional()
  }),
  nursingNotes: Yup.string().optional()
});

const DialysisProcess: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  // const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientsData = await patientsApi.getAllPatients();
        setPatients(patientsData);
      } catch (err) {
        setError('Failed to load patients. Please try again.');
      }
    };
    fetchPatients();
  }, []);

  const initialValues: DialysisProcessFormValues = {
    patientId: '',
    startTime: '',
    endTime: '',
    vitalSigns: {
      preDialysis: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: ''
      },
      postDialysis: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: ''
      }
    },
    treatmentParameters: {
      dialyzer: '',
      bloodFlow: '',
      dialysateFlow: '',
      ultrafiltration: ''
    },
    nursingNotes: ''
  };

  const handleSubmit = async (values: DialysisProcessFormValues, { resetForm }: FormikHelpers<DialysisProcessFormValues>) => {
    try {
      console.log('Form submitted with values:', values);
      const patient = patients.find(p => String(p.id) === String(values.patientId));
      const newHistory = {
        ...values,
        patientId: String(values.patientId),
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : '',
        date: new Date().toISOString().split('T')[0]
      };
      console.log('Sending to API:', newHistory);
      const response = await historyApi.addHistory(newHistory);
      console.log('API response:', response);
      setSuccess(true);
      setError('');
      resetForm();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to record dialysis session:', err);
      setError('Failed to record dialysis session. Please try again.');
    }
  };

  return (
    <>
      {/* <Container fluid className={`dialysis-process-container py-2 ${sidebarCollapsed ? 'collapsed' : ''}`}> */}
      <Container fluid className={`home-container py-2 ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <PageContainer>
          {/* <div className="main-container"> */}
          {/* <div style={{ width: '100%' ,padding: '10px',marginTop: '-20px' }}> */}
          <SectionHeading title="Dialysis Process" subtitle="Monitor and record dialysis procedures" />
          {/* </div> */}
          <Row>
            <Col>
              <Card className="shadow-sm">
                <Card.Body>
                  <h4 className="home-title">Start Dialysis Process</h4>

                  {success && (
                    <div className="alert alert-success">
                      Dialysis session recorded successfully!
                    </div>
                  )}

                  {error && (
                    <div className="alert alert-danger">
                      {error}
                    </div>
                  )}

                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ isSubmitting }) => (
                      <Form>
                        <Row className="mb-2">
                          <Col md={6}>
                            <div className="form-group">
                              <label htmlFor="patientId">Patient</label>
                              <Field as="select" id="patientId" name="patientId" className="form-control">
                                <option value="">Select Patient</option>
                                {patients.map(patient => (
                                  <option key={patient.id} value={patient.id}>
                                    {patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim()}
                                  </option>
                                ))}
                              </Field>
                              <ErrorMessage name="patientId" component="div" className="text-danger" />
                            </div>
                          </Col>
                          <Col md={3}>
                            <div className="form-group">
                              <label htmlFor="startTime">Start Time</label>
                              <Field
                                type="time"
                                id="startTime"
                                name="startTime"
                                className="form-control"
                              />
                              <ErrorMessage name="startTime" component="div" className="text-danger" />
                            </div>
                          </Col>
                          <Col md={3}>
                            <div className="form-group">
                              <label htmlFor="endTime">End Time</label>
                              <Field
                                type="time"
                                id="endTime"
                                name="endTime"
                                className="form-control"
                              />
                              <ErrorMessage name="endTime" component="div" className="text-danger" />
                            </div>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <Card className="mb-2">
                              <Card.Body>
                                <h4 className="home-title">Vital Signs</h4>
                                <Row>
                                  <Col md={6}>
                                    <h4 className="home-title">Pre-Dialysis</h4>
                                    <Row>
                                      <Col md={6}>
                                        <div className="form-group">
                                          <label htmlFor="vitalSigns.preDialysis.bloodPressure">Blood Pressure</label>
                                          <Field
                                            type="text"
                                            id="vitalSigns.preDialysis.bloodPressure"
                                            name="vitalSigns.preDialysis.bloodPressure"
                                            className="form-control"
                                            placeholder="e.g., 120/80"
                                          />
                                          <ErrorMessage name="vitalSigns.preDialysis.bloodPressure" component="div" className="text-danger" />
                                        </div>
                                      </Col>
                                      <Col md={6}>
                                        <div className="form-group">
                                          <label htmlFor="vitalSigns.preDialysis.heartRate">Heart Rate</label>
                                          <Field
                                            type="number"
                                            id="vitalSigns.preDialysis.heartRate"
                                            name="vitalSigns.preDialysis.heartRate"
                                            className="form-control"
                                          />
                                          <ErrorMessage name="vitalSigns.preDialysis.heartRate" component="div" className="text-danger" />
                                        </div>
                                      </Col>
                                    </Row>
                                    <Row>
                                      <Col md={6}>
                                        <div className="form-group">
                                          <label htmlFor="vitalSigns.preDialysis.temperature">Temperature</label>
                                          <Field
                                            type="number"
                                            step="0.1"
                                            id="vitalSigns.preDialysis.temperature"
                                            name="vitalSigns.preDialysis.temperature"
                                            className="form-control"
                                          />
                                          <ErrorMessage name="vitalSigns.preDialysis.temperature" component="div" className="text-danger" />
                                        </div>
                                      </Col>
                                      <Col md={6}>
                                        <div className="form-group">
                                          <label htmlFor="vitalSigns.preDialysis.weight">Weight (kg)</label>
                                          <Field
                                            type="number"
                                            step="0.1"
                                            id="vitalSigns.preDialysis.weight"
                                            name="vitalSigns.preDialysis.weight"
                                            className="form-control"
                                          />
                                          <ErrorMessage name="vitalSigns.preDialysis.weight" component="div" className="text-danger" />
                                        </div>
                                      </Col>
                                    </Row>
                                  </Col>

                                  <Col md={6}>
                                    <h4 className="home-title">Post-Dialysis</h4>
                                    <Row>
                                      <Col md={6}>
                                        <div className="form-group">
                                          <label htmlFor="vitalSigns.postDialysis.bloodPressure">Blood Pressure</label>
                                          <Field
                                            type="text"
                                            id="vitalSigns.postDialysis.bloodPressure"
                                            name="vitalSigns.postDialysis.bloodPressure"
                                            className="form-control"
                                            placeholder="e.g., 120/80"
                                          />
                                          <ErrorMessage name="vitalSigns.postDialysis.bloodPressure" component="div" className="text-danger" />
                                        </div>
                                      </Col>
                                      <Col md={6}>
                                        <div className="form-group">
                                          <label htmlFor="vitalSigns.postDialysis.heartRate">Heart Rate</label>
                                          <Field
                                            type="number"
                                            id="vitalSigns.postDialysis.heartRate"
                                            name="vitalSigns.postDialysis.heartRate"
                                            className="form-control"
                                          />
                                          <ErrorMessage name="vitalSigns.postDialysis.heartRate" component="div" className="text-danger" />
                                        </div>
                                      </Col>
                                    </Row>
                                    <Row>
                                      <Col md={6}>
                                        <div className="form-group">
                                          <label htmlFor="vitalSigns.postDialysis.temperature">Temperature</label>
                                          <Field
                                            type="number"
                                            step="0.1"
                                            id="vitalSigns.postDialysis.temperature"
                                            name="vitalSigns.postDialysis.temperature"
                                            className="form-control"
                                          />
                                          <ErrorMessage name="vitalSigns.postDialysis.temperature" component="div" className="text-danger" />
                                        </div>
                                      </Col>
                                      <Col md={6}>
                                        <div className="form-group">
                                          <label htmlFor="vitalSigns.postDialysis.weight">Weight (kg)</label>
                                          <Field
                                            type="number"
                                            step="0.1"
                                            id="vitalSigns.postDialysis.weight"
                                            name="vitalSigns.postDialysis.weight"
                                            className="form-control"
                                          />
                                          <ErrorMessage name="vitalSigns.postDialysis.weight" component="div" className="text-danger" />
                                        </div>
                                      </Col>
                                    </Row>
                                  </Col>
                                </Row>
                              </Card.Body>
                            </Card>
                          </Col>

                          <Col md={6}>
                            <Card className="mb-2">
                              <Card.Body>
                                <h4 className="home-title">Treatment Parameters</h4>
                                <Row>
                                  <Col md={6}>
                                    <div className="form-group">
                                      <label htmlFor="treatmentParameters.dialyzer">Dialyzer</label>
                                      <Field
                                        type="text"
                                        id="treatmentParameters.dialyzer"
                                        name="treatmentParameters.dialyzer"
                                        className="form-control"
                                      />
                                      <ErrorMessage name="treatmentParameters.dialyzer" component="div" className="text-danger" />
                                    </div>
                                  </Col>
                                  <Col md={6}>
                                    <div className="form-group">
                                      <label htmlFor="treatmentParameters.bloodFlow">Blood Flow (ml/min)</label>
                                      <Field
                                        type="number"
                                        id="treatmentParameters.bloodFlow"
                                        name="treatmentParameters.bloodFlow"
                                        className="form-control"
                                      />
                                      <ErrorMessage name="treatmentParameters.bloodFlow" component="div" className="text-danger" />
                                    </div>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col md={6}>
                                    <div className="form-group">
                                      <label htmlFor="treatmentParameters.dialysateFlow">Dialysate Flow (ml/min)</label>
                                      <Field
                                        type="number"
                                        id="treatmentParameters.dialysateFlow"
                                        name="treatmentParameters.dialysateFlow"
                                        className="form-control"
                                      />
                                      <ErrorMessage name="treatmentParameters.dialysateFlow" component="div" className="text-danger" />
                                    </div>
                                  </Col>
                                  <Col md={6}>
                                    <div className="form-group">
                                      <label htmlFor="treatmentParameters.ultrafiltration">Ultrafiltration (L)</label>
                                      <Field
                                        type="number"
                                        step="0.1"
                                        id="treatmentParameters.ultrafiltration"
                                        name="treatmentParameters.ultrafiltration"
                                        className="form-control"
                                      />
                                      <ErrorMessage name="treatmentParameters.ultrafiltration" component="div" className="text-danger" />
                                    </div>
                                  </Col>
                                </Row>
                              </Card.Body>
                            </Card>

                            <Card className="mb-2">
                              <Card.Body>
                                <div className="form-group">
                                  <label htmlFor="nursingNotes">Nursing Notes</label>
                                  <Field
                                    as="textarea"
                                    id="nursingNotes"
                                    name="nursingNotes"
                                    className="form-control"
                                    rows="2"
                                  />
                                  <ErrorMessage name="nursingNotes" component="div" className="text-danger" />
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>

                        <div className="text-end">
                          <ButtonWithGradient
                            type="submit"
                            disabled={isSubmitting}
                            text={isSubmitting ? 'Recording...' : 'Record Session'}
                          />
                        </div>
                      </Form>
                    )}
                  </Formik>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* </div> */}
        </PageContainer>
        <Footer />
      </Container>
    </>
  );
};

export default DialysisProcess; 