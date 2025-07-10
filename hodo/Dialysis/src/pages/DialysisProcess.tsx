import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import type { FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import SelectField from '../components/forms/SelectField';
import InputField from '../components/forms/InputField';
import TimeField from '../components/forms/TimeField';
import TextareaField from '../components/forms/TextareaField';
import ButtonWithGradient from '../components/ButtonWithGradient';
import type { Patient } from '../types';
import { patientServiceFactory } from '../services/patient/factory';
import { historyServiceFactory } from '../services/history/factory';
import { scheduleServiceFactory } from '../services/schedule/factory';
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
  appointmentId: string; // Add appointment ID field
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
  appointmentId: Yup.string().optional(), // Appointment ID is optional
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
  const [appointmentUpdated, setAppointmentUpdated] = useState<boolean>(false);
  const { refreshHistory, appointments, updateAppointment } = useDialysis();

  // Get patient service from factory
  const patientService = patientServiceFactory.getService();
  const scheduleService = scheduleServiceFactory.getService();

  // Get available appointments (not completed, not soft-deleted)
  const getAvailableAppointments = () => {
    return appointments.filter(apt => 
      apt.status !== 'Completed' && 
      apt.isDeleted !== 0
    );
  };

  // Handle appointment selection to auto-fill patient
  const handleAppointmentChange = (appointmentId: string, setFieldValue: (field: string, value: any) => void) => {
    if (appointmentId) {
      const selectedAppointment = appointments.find(apt => apt.id?.toString() === appointmentId);
      if (selectedAppointment) {
        // Auto-fill the patient ID
        setFieldValue('patientId', selectedAppointment.patientId?.toString() || '');
      }
    }
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientsData = await patientService.getAllPatients();
        setPatients(patientsData);
      } catch (err) {
        setError('Failed to load patients. Please try again.');
      }
    };
    fetchPatients();
  }, [patientService]);

  const initialValues: DialysisProcessFormValues = {
    patientId: '',
    appointmentId: '',
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
      const patient = patients.find(p => String(p.id) === String(values.patientId));

      // Convert string values to numbers for vital signs
      const convertToNumber = (value: string | number): number | undefined => {
        if (value === '' || value === null || value === undefined) return undefined;
        const num = Number(value);
        return isNaN(num) ? undefined : num;
      };

      const newHistory = {
        ...values,
        patientId: String(values.patientId),
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : '',
        appointmentId: values.appointmentId || undefined, // Include appointment ID if selected
        date: new Date().toISOString().split('T')[0],
        vitalSigns: {
          preDialysis: {
            bloodPressure: values.vitalSigns.preDialysis.bloodPressure,
            heartRate: convertToNumber(values.vitalSigns.preDialysis.heartRate),
            temperature: convertToNumber(values.vitalSigns.preDialysis.temperature),
            weight: convertToNumber(values.vitalSigns.preDialysis.weight)
          },
          postDialysis: {
            bloodPressure: values.vitalSigns.postDialysis.bloodPressure,
            heartRate: convertToNumber(values.vitalSigns.postDialysis.heartRate),
            temperature: convertToNumber(values.vitalSigns.postDialysis.temperature),
            weight: convertToNumber(values.vitalSigns.postDialysis.weight)
          }
        },
        treatmentParameters: {
          dialyzer: values.treatmentParameters.dialyzer,
          bloodFlow: convertToNumber(values.treatmentParameters.bloodFlow),
          dialysateFlow: convertToNumber(values.treatmentParameters.dialysateFlow),
          ultrafiltration: convertToNumber(values.treatmentParameters.ultrafiltration)
        }
      };
      const response = await historyServiceFactory.getService().addHistory(newHistory);

      // Update appointment status to "Completed" if appointment was selected
      if (values.appointmentId) {
        try {
          await updateAppointment(values.appointmentId, {
            status: 'Completed'
          });
          setAppointmentUpdated(true);
        } catch (updateError) {
          console.error('Failed to update appointment status:', updateError);
          setAppointmentUpdated(false);
          // Don't fail the entire process if appointment update fails
        }
      } else {
        // Fallback to finding appointment by patient and date (existing logic)
        const currentDate = new Date().toISOString().split('T')[0];
        const correspondingAppointment = appointments.find(apt => 
          apt.patientId === values.patientId && 
          apt.date === currentDate &&
          apt.status !== 'Completed' &&
          apt.isDeleted !== 0
        );

        if (correspondingAppointment && correspondingAppointment.id) {
          try {
            await updateAppointment(correspondingAppointment.id.toString(), {
              status: 'Completed'
            });
            setAppointmentUpdated(true);
          } catch (updateError) {
            console.error('Failed to update appointment status:', updateError);
            setAppointmentUpdated(false);
            // Don't fail the entire process if appointment update fails
          }
        } else {
          console.log('No corresponding appointment found for patient:', values.patientId, 'on date:', currentDate);
          setAppointmentUpdated(false);
        }
      }

      await refreshHistory();
      
      setSuccess(true);
      setError('');
      resetForm();
      setTimeout(() => {
        setSuccess(false);
        setAppointmentUpdated(false);
      }, 3000);
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
                    {appointmentUpdated ? ' Appointment status updated to Completed.' : ' No corresponding appointment found for today.'}
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
                  {({ isSubmitting, setFieldValue, values }) => {
                    // Auto-fill patient when appointment is selected
                    React.useEffect(() => {
                      if (values.appointmentId) {
                        handleAppointmentChange(values.appointmentId, setFieldValue);
                      }
                    }, [values.appointmentId, setFieldValue]);

                    return (
                      <Form>
                        <Row>
                          <Col md={6} style={{ marginTop: '1.755rem'}}>
                            <SelectField
                              label="Appointment"
                              name="appointmentId"
                              options={getAvailableAppointments().map(appointment => ({
                                label: `${appointment.id} - ${appointment.patientName}`,
                                value: appointment.id?.toString() || ''
                              }))}
                              placeholder="Select Appointment"
                              // required
                            />
                          </Col>
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
                        </Row>
                        <Row className="mb-2">
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
                    );
                  }}
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