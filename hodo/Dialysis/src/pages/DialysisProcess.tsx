import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import type { FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { historyApi } from '../api/historyApi';
import { patientsApi } from '../api/patientsApi';
import './DialysisProcess.css';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import Header from '../components/Header';
import type { Patient } from '../types';
import SectionHeading from '../components/SectionHeading';
import ButtonWithGradient from '../components/ButtonWithGradient';
import { InputField, SelectField, TimeField, TextareaField } from '../components/forms';
import { useDialysis } from '../context/DialysisContext';

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
  const { refreshHistory } = useDialysis();

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
      await refreshHistory();
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
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="Dialysis Process" subtitle="Monitor and record dialysis procedures" />
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
                          <SelectField
                            label="Patient"
                            name="patientId"
                            options={patients.map(patient => ({
                              label: patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
                              value: patient.id?.toString() || ''
                            }))}
                            placeholder="Select Patient"
                            required
                          />
                        </Col>
                        <Col md={3}>
                          <TimeField
                            label="Start Time"
                            name="startTime"
                            required
                          />
                        </Col>
                        <Col md={3}>
                          <TimeField
                            label="End Time"
                            name="endTime"
                            required
                          />
                        </Col>
                      </Row>
                      <Row className="mb-2">
                        <Col md={6}>
                          <h5>Pre-Dialysis Vital Signs</h5>
                          <InputField label="Blood Pressure" name="vitalSigns.preDialysis.bloodPressure" type="text" />
                          <InputField label="Heart Rate" name="vitalSigns.preDialysis.heartRate" type="number" />
                          <InputField label="Temperature" name="vitalSigns.preDialysis.temperature" type="number" />
                          <InputField label="Weight" name="vitalSigns.preDialysis.weight" type="number" />
                        </Col>
                        <Col md={6}>
                          <h5>Post-Dialysis Vital Signs</h5>
                          <InputField label="Blood Pressure" name="vitalSigns.postDialysis.bloodPressure" type="text" />
                          <InputField label="Heart Rate" name="vitalSigns.postDialysis.heartRate" type="number" />
                          <InputField label="Temperature" name="vitalSigns.postDialysis.temperature" type="number" />
                          <InputField label="Weight" name="vitalSigns.postDialysis.weight" type="number" />
                        </Col>
                      </Row>
                      <Row className="mb-2">
                        <Col md={6}>
                          <h5>Treatment Parameters</h5>
                          <InputField label="Dialyzer" name="treatmentParameters.dialyzer" type="text" />
                          <InputField label="Blood Flow" name="treatmentParameters.bloodFlow" type="number" />
                          <InputField label="Dialysate Flow" name="treatmentParameters.dialysateFlow" type="number" />
                          <InputField label="Ultrafiltration" name="treatmentParameters.ultrafiltration" type="number" />
                        </Col>
                        <Col md={6}>
                          <h5>Nursing Notes</h5>
                          <TextareaField label="Nursing Notes" name="nursingNotes" placeholder="Enter notes..." rows={6} />
                        </Col>
                      </Row>
                      <Row>
                        <Col md={12} className="text-end">
                          <ButtonWithGradient
                            type="submit"
                            disabled={isSubmitting}
                            text={isSubmitting ? 'Recording...' : 'Record Session'}
                          />
                        </Col>
                      </Row>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </PageContainer>
      <Footer />
    </>
  );
};

export default DialysisProcess; 