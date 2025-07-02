import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { patientsApi } from '../api/patientsApi';
import { dialysisFlowChartApi } from '../api/dialysisFlowChartApi';
import type { Patient } from '../types';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ButtonWithGradient from './ButtonWithGradient';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { InputField, SelectField, DateField, TimeField, TextareaField, CheckboxField } from './forms';
import './DialysisFlowChart.css';

interface DialysisFlowChartForm {
  patientId: string;
  date: string;
  hemodialysisNIO: string;
  bloodAccess: string;
  hdStartingTime: string;
  hdClosingTime: string;
  durationHours: string;
  bloodFlowRate: string;
  injHeparinPrime: string;
  injHeparinBolus: string;
  startingWithSaline: boolean;
  closingWithAir: boolean;
  closingWithSaline: boolean;
  bloodTransfusion: boolean;
  bloodTransfusionComment: string;
  bpBeforeDialysis: string;
  bpAfterDialysis: string;
  bpDuringDialysis: string;
  weightPreDialysis: string;
  weightPostDialysis: string;
  weightLoss: string;
  dryWeight: string;
  weightGain: string;
  dialysisMonitorNameFO: string;
  dialysisNameSize: string;
  dialysisNumberOfRefuse: string;
  bloodTubeNumberOfRefuse: string;
  dialysisFlowRate: string;
  bathacetete: string;
  bathBicarb: string;
  naConductivity: string;
  profilesNo: string;
  equipmentsComplaints: string;
  patientsComplaints: string;
  spo2: string;
  fever: boolean;
  rigor: boolean;
  hypertension: boolean;
  hypoglycemia: boolean;
  deptInChargeSign: string;
}

const validationSchema = Yup.object({
  patientId: Yup.string().required('Patient is required'),
  date: Yup.string().required('Date is required'),
  bloodAccess: Yup.string().required('Blood Access is required'),
  hdStartingTime: Yup.string().required('HD Starting Time is required'),
  hdClosingTime: Yup.string().required('HD Closing Time is required'),
});

const initialValues: DialysisFlowChartForm = {
  patientId: '',
  date: '',
  hemodialysisNIO: '',
  bloodAccess: '',
  hdStartingTime: '',
  hdClosingTime: '',
  durationHours: '',
  bloodFlowRate: '',
  injHeparinPrime: '',
  injHeparinBolus: '',
  startingWithSaline: false,
  closingWithAir: false,
  closingWithSaline: false,
  bloodTransfusion: false,
  bloodTransfusionComment: '',
  bpBeforeDialysis: '',
  bpAfterDialysis: '',
  bpDuringDialysis: '',
  weightPreDialysis: '',
  weightPostDialysis: '',
  weightLoss: '',
  dryWeight: '',
  weightGain: '',
  dialysisMonitorNameFO: '',
  dialysisNameSize: '',
  dialysisNumberOfRefuse: '',
  bloodTubeNumberOfRefuse: '',
  dialysisFlowRate: '',
  bathacetete: '',
  bathBicarb: '',
  naConductivity: '',
  profilesNo: '',
  equipmentsComplaints: '',
  patientsComplaints: '',
  spo2: '',
  fever: false,
  rigor: false,
  hypertension: false,
  hypoglycemia: false,
  deptInChargeSign: '',
};

const DialysisFlowChart: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError('');
        const patientsData = await patientsApi.getAllPatients();
        setPatients(patientsData);
      } catch (err) {
        setError('Failed to load patients. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const getSelectedPatient = (patientId: string) => {
    return patients.find(patient => patient.id === patientId);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = (formData: DialysisFlowChartForm) => {
    try {
      const selectedPatient = getSelectedPatient(formData.patientId);

      // Prepare data for Excel export
      const excelData = [
        {
          'Patient Name': selectedPatient ?
            (selectedPatient.firstName || selectedPatient.name) +
            (selectedPatient.lastName ? ' ' + selectedPatient.lastName : '') : 'N/A',
          'Date': formData.date || 'N/A',
          'Hemodialysis NIO': formData.hemodialysisNIO || 'N/A',
          'Blood Access': formData.bloodAccess || 'N/A',
          'HD Starting Time': formData.hdStartingTime || 'N/A',
          'HD Closing Time': formData.hdClosingTime || 'N/A',
          'Duration Hours': formData.durationHours || 'N/A',
          'Blood Flow Rate (ml/min)': formData.bloodFlowRate || 'N/A',
          'Inj Heparin Prime (units)': formData.injHeparinPrime || 'N/A',
          'Inj Heparin Bolus (units)': formData.injHeparinBolus || 'N/A',
          'Starting with Saline': formData.startingWithSaline ? 'Yes' : 'No',
          'Closing with Air': formData.closingWithAir ? 'Yes' : 'No',
          'Closing with Saline': formData.closingWithSaline ? 'Yes' : 'No',
          'Blood Transfusion': formData.bloodTransfusion ? 'Yes' : 'No',
          'Blood Transfusion Comment': formData.bloodTransfusionComment || 'N/A',
          'B.P. Before Dialysis': formData.bpBeforeDialysis || 'N/A',
          'B.P. After Dialysis': formData.bpAfterDialysis || 'N/A',
          'B.P. During Dialysis': formData.bpDuringDialysis || 'N/A',
          'Weight Pre Dialysis (kg)': formData.weightPreDialysis || 'N/A',
          'Weight Post Dialysis (kg)': formData.weightPostDialysis || 'N/A',
          'Weight Loss (kg)': formData.weightLoss || 'N/A',
          'Dry Weight (kg)': formData.dryWeight || 'N/A',
          'Weight Gain (kg)': formData.weightGain || 'N/A',
          'SPO2 (%)': formData.spo2 || 'N/A',
          'Dialysis Monitor Name FO': formData.dialysisMonitorNameFO || 'N/A',
          'Dialysis Name / Size': formData.dialysisNameSize || 'N/A',
          'Dialysis Number of Refuse': formData.dialysisNumberOfRefuse || 'N/A',
          'Blood Tube Number of Refuse': formData.bloodTubeNumberOfRefuse || 'N/A',
          'Dialysis Flow Rate': formData.dialysisFlowRate || 'N/A',
          'Bathacetete': formData.bathacetete || 'N/A',
          'Bath Bicarb': formData.bathBicarb || 'N/A',
          'Na / Conductivity': formData.naConductivity || 'N/A',
          'Profiles No': formData.profilesNo || 'N/A',
          'Equipments Complaints': formData.equipmentsComplaints || 'N/A',
          'Patients Complaints': formData.patientsComplaints || 'N/A',
          'Fever': formData.fever ? 'Yes' : 'No',
          'Rigor': formData.rigor ? 'Yes' : 'No',
          'Hypertension': formData.hypertension ? 'Yes' : 'No',
          'Hypoglycemia': formData.hypoglycemia ? 'Yes' : 'No',
          'Dept In-Charge Sign': formData.deptInChargeSign || 'N/A'
        }
      ];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 20 }, // Patient Name
        { wch: 12 }, // Date
        { wch: 15 }, // Hemodialysis NIO
        { wch: 15 }, // Blood Access
        { wch: 15 }, // HD Starting Time
        { wch: 15 }, // HD Closing Time
        { wch: 15 }, // Duration Hours
        { wch: 20 }, // Blood Flow Rate
        { wch: 20 }, // Inj Heparin Prime
        { wch: 20 }, // Inj Heparin Bolus
        { wch: 18 }, // Starting with Saline
        { wch: 15 }, // Closing with Air
        { wch: 18 }, // Closing with Saline
        { wch: 18 }, // Blood Transfusion
        { wch: 25 }, // Blood Transfusion Comment
        { wch: 20 }, // B.P. Before Dialysis
        { wch: 20 }, // B.P. After Dialysis
        { wch: 20 }, // B.P. During Dialysis
        { wch: 20 }, // Weight Pre Dialysis
        { wch: 20 }, // Weight Post Dialysis
        { wch: 15 }, // Weight Loss
        { wch: 15 }, // Dry Weight
        { wch: 15 }, // Weight Gain
        { wch: 10 }, // SPO2
        { wch: 25 }, // Dialysis Monitor Name FO
        { wch: 20 }, // Dialysis Name / Size
        { wch: 25 }, // Dialysis Number of Refuse
        { wch: 25 }, // Blood Tube Number of Refuse
        { wch: 18 }, // Dialysis Flow Rate
        { wch: 15 }, // Bathacetete
        { wch: 15 }, // Bath Bicarb
        { wch: 18 }, // Na / Conductivity
        { wch: 15 }, // Profiles No
        { wch: 25 }, // Equipments Complaints
        { wch: 25 }, // Patients Complaints
        { wch: 10 }, // Fever
        { wch: 10 }, // Rigor
        { wch: 15 }, // Hypertension
        { wch: 15 }, // Hypoglycemia
        { wch: 20 }, // Dept In-Charge Sign
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dialysis Flow Chart');

      // Generate filename with current date and patient name
      const patientName = selectedPatient ?
        (selectedPatient.firstName || selectedPatient.name) +
        (selectedPatient.lastName ? ' ' + selectedPatient.lastName : '') : 'Unknown';
      const date = formData.date || new Date().toISOString().split('T')[0];
      const filename = `Dialysis_Flow_Chart_${patientName.replace(/\s+/g, '_')}_${date}.xlsx`;

      // Save the file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, filename);

      setSuccess('Dialysis flow chart exported to Excel successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setError('Failed to export to Excel. Please try again.');
    }
  };

  const handleSubmit = async (values: DialysisFlowChartForm, { resetForm }: any) => {
    setError('');
    setSuccess('');
    try {
      const selectedPatient = getSelectedPatient(values.patientId);
      if (!selectedPatient) {
        setError('Please select a valid patient');
        return;
      }
      const dialysisFlowChartData = {
        ...values,
        patientName: (selectedPatient.firstName || selectedPatient.name) +
          (selectedPatient.lastName ? ' ' + selectedPatient.lastName : '')
      };
      await dialysisFlowChartApi.addDialysisFlowChart(dialysisFlowChartData);
      setSuccess('Dialysis flow chart saved successfully!');
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save dialysis flow chart. Please try again.');
    }
  };

  return (
    <div className="dialysis-flow-chart-content">
      {/* <div className="dialysis-flow-chart-header">
        <h2 className="dialysis-flow-chart-title">Dialysis Flow Chart</h2>
      </div> */}

      {/* Success and Error Messages */}
      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          {success}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="dialysis-flow-chart-form-container">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, isSubmitting, setFieldValue, resetForm }) => {
            const selectedPatient = getSelectedPatient(values.patientId);
            return (
              <Form>
                {/* General Info */}
                <div className="form-section">
                  <h3>General Info</h3>
                  <div className="form-grid">
                    <SelectField
                      label="Patient"
                      name="patientId"
                      options={patients.map(patient => ({
                        label: (patient.firstName || patient.name) + (patient.lastName ? ' ' + patient.lastName : ''),
                        value: patient.id
                      }))}
                      placeholder={loading ? 'Loading patients...' : 'Select Patient'}
                      required
                      disabled={loading}
                    />
                    <DateField label="Date" name="date" required />
                    <InputField label="Hemodialysis NIO" name="hemodialysisNIO" />
                    <SelectField
                      label="Blood Access"
                      name="bloodAccess"
                      options={[
                        { label: 'AV Fistula', value: 'AV Fistula' },
                        { label: 'AV Graft', value: 'AV Graft' },
                        { label: 'Catheter', value: 'Catheter' },
                        { label: 'Other', value: 'Other' },
                      ]}
                      required
                    />
                  </div>
                  {/* Selected Patient Information */}
                  {selectedPatient && (
                    <div className="selected-patient-info">
                      <h4>Selected Patient Information</h4>
                      <div className="patient-details-grid">
                        <div className="patient-detail">
                          <strong>Name:</strong> {(selectedPatient.firstName || selectedPatient.name) + (selectedPatient.lastName ? ' ' + selectedPatient.lastName : '')}
                        </div>
                        <div className="patient-detail">
                          <strong>Gender:</strong> {selectedPatient.gender || 'N/A'}
                        </div>
                        <div className="patient-detail">
                          <strong>Blood Group:</strong> {selectedPatient.bloodGroup}
                        </div>
                        <div className="patient-detail">
                          <strong>Mobile:</strong> {selectedPatient.mobileNo || selectedPatient.phone || 'N/A'}
                        </div>
                        <div className="patient-detail">
                          <strong>Date of Birth:</strong> {selectedPatient.dateOfBirth || 'N/A'}
                        </div>
                        <div className="patient-detail">
                          <strong>Catheter Date:</strong> {selectedPatient.catheterDate || selectedPatient.catheterInsertionDate || 'N/A'}
                        </div>
                        <div className="patient-detail">
                          <strong>Fistula Date:</strong> {selectedPatient.fistulaDate || selectedPatient.fistulaCreationDate || 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Timing */}
                <div className="form-section">
                  <h3>Timing</h3>
                  <div className="form-grid">
                    <TimeField label="HD Starting Time" name="hdStartingTime" required />
                    <TimeField label="HD Closing Time" name="hdClosingTime" required />
                    <InputField label="Duration Hours" name="durationHours" type="number" min="0" />
                  </div>
                </div>

                {/* Vitals */}
                <div className="form-section">
                  <h3>Vitals</h3>
                  <div className="form-grid">
                    <InputField label="B.P. Before Dialysis" name="bpBeforeDialysis" placeholder="e.g., 120/80" />
                    <InputField label="B.P. After Dialysis" name="bpAfterDialysis" placeholder="e.g., 110/70" />
                    <InputField label="B.P. During Dialysis (Average)" name="bpDuringDialysis" placeholder="e.g., 115/75" />
                    <InputField label="Weight Pre Dialysis (kg)" name="weightPreDialysis" type="number" min="0" />
                    <InputField label="Weight Post Dialysis (kg)" name="weightPostDialysis" type="number" min="0" />
                    <InputField label="Weight Loss (kg)" name="weightLoss" type="number" min="0" />
                    <InputField label="Dry Weight (kg)" name="dryWeight" type="number" min="0" />
                    <InputField label="Weight Gain (kg)" name="weightGain" type="number" min="0" />
                    <InputField label="SPO2 (%)" name="spo2" type="number" min="0" max="100" />
                  </div>
                </div>

                {/* Dialysis Setup */}
                <div className="form-section">
                  <h3>Dialysis Setup</h3>
                  <div className="form-grid">
                    <InputField label="Blood Flow Rate (ml/min)" name="bloodFlowRate" type="number" min="0" />
                    <InputField label="Inj Heparin Prime (units)" name="injHeparinPrime" type="number" min="0" />
                    <InputField label="Inj. Heparin Bolus (units)" name="injHeparinBolus" type="number" min="0" />
                    <CheckboxField label="Starting with Saline" name="startingWithSaline" />
                    <div className="form-field checkbox-group">
                      <label>Closing with:</label>
                      <CheckboxField label="Air" name="closingWithAir" />
                      <CheckboxField label="Saline" name="closingWithSaline" />
                      <small style={{ fontWeight: 'normal' }}>* Use both only when clinically approved</small>
                    </div>
                    <div className="form-field checkbox-group">
                      <CheckboxField label="Blood Transfusion" name="bloodTransfusion" />
                      {values.bloodTransfusion && (
                        <InputField label="Blood Transfusion Comment" name="bloodTransfusionComment" />
                      )}
                    </div>
                    <InputField label="Dialysis Monitor Name FO No" name="dialysisMonitorNameFO" />
                    <InputField label="Dialysis Name / Size" name="dialysisNameSize" />
                    <InputField label="Dialysis Number of Refuse" name="dialysisNumberOfRefuse" type="number" min="0" />
                    <InputField label="Blood Tube Number of Refuse" name="bloodTubeNumberOfRefuse" type="number" min="0" />
                    <InputField label="Dialysis Flow Rate" name="dialysisFlowRate" type="number" min="0" />
                    <InputField label="Bathacetete" name="bathacetete" />
                    <InputField label="Bath Bicarb" name="bathBicarb" />
                    <InputField label="Na / Conductivity" name="naConductivity" />
                    <InputField label="Profiles No" name="profilesNo" />
                  </div>
                </div>

                {/* Complaints */}
                <div className="form-section">
                  <h3>Complaints & Observations</h3>
                  <div className="form-grid">
                    <TextareaField label="Equipments Complaints" name="equipmentsComplaints" rows={4} />
                    <TextareaField label="Patients Complaints" name="patientsComplaints" rows={4} />
                    <div className="form-field checkbox-group">
                      <label>Fever / Rigor:</label>
                      <CheckboxField label="Fever" name="fever" />
                      <CheckboxField label="Rigor" name="rigor" />
                    </div>
                    <div className="form-field checkbox-group">
                      <label>Hypertension / Hypoglycemia:</label>
                      <CheckboxField label="Hypertension" name="hypertension" />
                      <CheckboxField label="Hypoglycemia" name="hypoglycemia" />
                    </div>
                  </div>
                </div>

                {/* Sign-off */}
                <div className="form-section">
                  <h3>Sign-off</h3>
                  <div className="form-grid">
                    <InputField label="Dept In-Charge Sign" name="deptInChargeSign" />
                  </div>
                </div>

                <div className="form-buttons">
                  <ButtonWithGradient
                    type="submit"
                    className="btn-submit"
                    disabled={isSubmitting}
                    text={isSubmitting ? 'Saving...' : 'Submit'}
                  />
                  <ButtonWithGradient
                    type="button"
                    className="btn-print"
                    onClick={handlePrint}
                    disabled={isSubmitting}
                    text="Print"
                  />
                  <ButtonWithGradient
                    type="button"
                    className="btn-export-excel"
                    onClick={() => handleExportExcel(values)}
                    disabled={isSubmitting}
                    text="Export to Excel"
                  />
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default DialysisFlowChart; 