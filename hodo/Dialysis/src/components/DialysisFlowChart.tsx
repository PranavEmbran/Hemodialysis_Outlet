import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { patientsApi } from '../api/patientsApi';
import { dialysisFlowChartApi } from '../api/dialysisFlowChartApi';
import type{ Patient } from '../types';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ButtonWithGradient from './ButtonWithGradient';
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

const DialysisFlowChart: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<DialysisFlowChartForm>({
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
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError('');
        const patientsData = await patientsApi.getAllPatients();
        setPatients(patientsData);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const getSelectedPatient = () => {
    return patients.find(patient => patient.id === formData.patientId);
  };

  const selectedPatient = getSelectedPatient();

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    try {
      const selectedPatient = getSelectedPatient();

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.patientId || !formData.date || !formData.bloodAccess ||
      !formData.hdStartingTime || !formData.hdClosingTime) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const selectedPatient = getSelectedPatient();
      if (!selectedPatient) {
        setError('Please select a valid patient');
        return;
      }

      const dialysisFlowChartData = {
        ...formData,
        patientName: (selectedPatient.firstName || selectedPatient.name) +
          (selectedPatient.lastName ? ' ' + selectedPatient.lastName : '')
      };

      await dialysisFlowChartApi.addDialysisFlowChart(dialysisFlowChartData);

      setSuccess('Dialysis flow chart saved successfully!');

      // Reset form after successful submission
      setFormData({
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
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving dialysis flow chart:', err);
      setError('Failed to save dialysis flow chart. Please try again.');
    } finally {
      setSubmitting(false);
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
        <form onSubmit={handleSubmit}>
          {/* General Info */}
          <div className="form-section">
            <h3>General Info</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Patient</label>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">
                    {loading ? 'Loading patients...' : 'Select Patient'}
                  </option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {(patient.firstName || patient.name) + (patient.lastName ? ' ' + patient.lastName : '')}
                    </option>
                  ))}
                </select>
                {error && <div className="error-message">{error}</div>}
              </div>
              <div className="form-field">
                <label>Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Hemodialysis NIO</label>
                <input type="text" name="hemodialysisNIO" value={formData.hemodialysisNIO} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Blood Access</label>
                <select name="bloodAccess" value={formData.bloodAccess} onChange={handleChange} required>
                  <option value="">Select Access</option>
                  <option value="AV Fistula">AV Fistula</option>
                  <option value="AV Graft">AV Graft</option>
                  <option value="Catheter">Catheter</option>
                  <option value="Other">Other</option>
                </select>
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
          </div>

          {/* Timing */}
          <div className="form-section">
            <h3>Timing</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>HD Starting Time</label>
                <input type="time" name="hdStartingTime" value={formData.hdStartingTime} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>HD Closing Time</label>
                <input type="time" name="hdClosingTime" value={formData.hdClosingTime} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Duration Hours</label>
                <input type="number" name="durationHours" value={formData.durationHours} onChange={handleChange} min="0" />
              </div>
            </div>
          </div>

          {/* Vitals */}
          <div className="form-section">
            <h3>Vitals</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>B.P. Before Dialysis</label>
                <input type="text" name="bpBeforeDialysis" value={formData.bpBeforeDialysis} onChange={handleChange} placeholder="e.g., 120/80" />
              </div>
              <div className="form-field">
                <label>B.P. After Dialysis</label>
                <input type="text" name="bpAfterDialysis" value={formData.bpAfterDialysis} onChange={handleChange} placeholder="e.g., 110/70" />
              </div>
              <div className="form-field">
                <label>B.P. During Dialysis (Average)</label>
                <input type="text" name="bpDuringDialysis" value={formData.bpDuringDialysis} onChange={handleChange} placeholder="e.g., 115/75" />
              </div>
              <div className="form-field">
                <label>Weight Pre Dialysis (kg)</label>
                <input type="number" name="weightPreDialysis" value={formData.weightPreDialysis} onChange={handleChange} min="0" />
              </div>
              <div className="form-field">
                <label>Weight Post Dialysis (kg)</label>
                <input type="number" name="weightPostDialysis" value={formData.weightPostDialysis} onChange={handleChange} min="0" />
              </div>
              <div className="form-field">
                <label>Weight Loss (kg)</label>
                <input type="number" name="weightLoss" value={formData.weightLoss} onChange={handleChange} min="0" />
              </div>
              <div className="form-field">
                <label>Dry Weight (kg)</label>
                <input type="number" name="dryWeight" value={formData.dryWeight} onChange={handleChange} min="0" />
              </div>
              <div className="form-field">
                <label>Weight Gain (kg)</label>
                <input type="number" name="weightGain" value={formData.weightGain} onChange={handleChange} min="0" />
              </div>
              <div className="form-field">
                <label>SPO2 (%)</label>
                <input type="number" name="spo2" value={formData.spo2} onChange={handleChange} min="0" max="100" />
              </div>
            </div>
          </div>

          {/* Dialysis Setup */}
          <div className="form-section">
            <h3>Dialysis Setup</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Blood Flow Rate (ml/min)</label>
                <input type="number" name="bloodFlowRate" value={formData.bloodFlowRate} onChange={handleChange} min="0" />
              </div>
              <div className="form-field">
                <label>Inj Heparin Prime (units)</label>
                <input type="number" name="injHeparinPrime" value={formData.injHeparinPrime} onChange={handleChange} min="0" />
              </div>
              <div className="form-field">
                <label>Inj. Heparin Bolus (units)</label>
                <input type="number" name="injHeparinBolus" value={formData.injHeparinBolus} onChange={handleChange} min="0" />
              </div>

              <div className="form-field checkbox-group">
                <div className="checkbox-subgroup">
                  <label htmlFor="startingWithSaline">Starting with Saline</label>
                  <input id="startingWithSaline" type="checkbox" name="startingWithSaline" checked={formData.startingWithSaline} onChange={handleChange} />
                </div>
              </div>
              <div className="form-field checkbox-group">
                <label>Closing with:</label>
                <br />
                <div className="checkbox-subgroup">
                  <label htmlFor="closingWithAir">Air</label>
                  <input id="closingWithAir" type="checkbox" name="closingWithAir" checked={formData.closingWithAir} onChange={handleChange} />
                </div>
                <div className="checkbox-subgroup">
                  <label htmlFor="closingWithSaline">Saline</label>
                  <input id="closingWithSaline" type="checkbox" name="closingWithSaline" checked={formData.closingWithSaline} onChange={handleChange} />
                </div>
                <small style={{ fontWeight: 'normal' }}>* Use both only when clinically approved</small>
              </div>
              <div className="form-field checkbox-group">
                <div className="checkbox-subgroup">
                  <label htmlFor="bloodTransfusion">Blood Transfusion</label>
                  <input id="bloodTransfusion" type="checkbox" name="bloodTransfusion" checked={formData.bloodTransfusion} onChange={handleChange} />
                </div>
                {formData.bloodTransfusion && (
                  <input type="text" name="bloodTransfusionComment" value={formData.bloodTransfusionComment} onChange={handleChange} placeholder="Comment" style={{ marginTop: '0.5rem' }} />
                )}
              </div>

              <div className="form-field">
                <label>Dialysis Monitor Name FO No</label>
                <input type="text" name="dialysisMonitorNameFO" value={formData.dialysisMonitorNameFO} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Dialysis Name / Size</label>
                <input type="text" name="dialysisNameSize" value={formData.dialysisNameSize} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Dialysis Number of Refuse</label>
                <input type="number" name="dialysisNumberOfRefuse" value={formData.dialysisNumberOfRefuse} onChange={handleChange} min="0" />
              </div>
              <div className="form-field">
                <label>Blood Tube Number of Refuse</label>
                <input type="number" name="bloodTubeNumberOfRefuse" value={formData.bloodTubeNumberOfRefuse} onChange={handleChange} min="0" />
              </div>
              <div className="form-field">
                <label>Dialysis Flow Rate</label>
                <input type="number" name="dialysisFlowRate" value={formData.dialysisFlowRate} onChange={handleChange} min="0" />
              </div>
              <div className="form-field">
                <label>Bathacetete</label>
                <input type="text" name="bathacetete" value={formData.bathacetete} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Bath Bicarb</label>
                <input type="text" name="bathBicarb" value={formData.bathBicarb} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Na / Conductivity</label>
                <input type="text" name="naConductivity" value={formData.naConductivity} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Profiles No</label>
                <input type="text" name="profilesNo" value={formData.profilesNo} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Complaints */}
          <div className="form-section">
            <h3>Complaints & Observations</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Equipments Complaints</label>
                <textarea name="equipmentsComplaints" value={formData.equipmentsComplaints} onChange={handleChange} rows={4}></textarea>
              </div>
              <div className="form-field">
                <label>Patients Complaints</label>
                <textarea name="patientsComplaints" value={formData.patientsComplaints} onChange={handleChange} rows={4}></textarea>
              </div>
              <div className="form-field checkbox-group">
                <label>Fever / Rigor:</label>
                <input type="checkbox" name="fever" checked={formData.fever} onChange={handleChange} />
                <label>Fever</label>
                <input type="checkbox" name="rigor" checked={formData.rigor} onChange={handleChange} />
                <label>Rigor</label>
              </div>
              <div className="form-field checkbox-group">
                <label>Hypertension / Hypoglycemia:</label>
                <input type="checkbox" name="hypertension" checked={formData.hypertension} onChange={handleChange} />
                <label>Hypertension</label>
                <input type="checkbox" name="hypoglycemia" checked={formData.hypoglycemia} onChange={handleChange} />
                <label>Hypoglycemia</label>
              </div>
            </div>
          </div>

          {/* Sign-off */}
          <div className="form-section">
            <h3>Sign-off</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Dept In-Charge Sign</label>
                <input type="text" name="deptInChargeSign" value={formData.deptInChargeSign} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-buttons">
            <ButtonWithGradient
              type="submit"
              className="btn-submit"
              disabled={submitting}
              text={submitting ? 'Saving...' : 'Submit'}
            />
            <ButtonWithGradient
              type="button"
              className="btn-print"
              onClick={handlePrint}
              disabled={submitting}
              text="Print"
            />
            <ButtonWithGradient
              type="button"
              className="btn-export-excel"
              onClick={handleExportExcel}
              disabled={submitting}
              text="Export to Excel"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default DialysisFlowChart; 