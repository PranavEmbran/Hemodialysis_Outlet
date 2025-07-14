import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { generatePatientId } from '../utils/patientIdGenerator';

const dbPath = path.join(__dirname, '../db/db.json');

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  mobileNo: string;
  bloodGroup: string;
  catheterInsertionDate: string;
  fistulaCreationDate: string;
  isDeleted?: number; // 10 = active, 0 = deleted
  deletedAt?: string;
}

interface Appointment {
  id: string;
  [key: string]: any;
}

interface Billing {
  id: string;
  [key: string]: any;
}

interface History {
  id: string;
  [key: string]: any;
}

interface DialysisFlowChart {
  id: string;
  patientId: string;
  patientName: string;
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

interface StaffData {
  // technicians: string[];
  doctors: string[];
  units: string[];
}

interface HaemodialysisRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  rows: any[];
}

interface Database {
  patients: Patient[];
  appointments: Appointment[];
  billing: Billing[];
  history: History[];
  dialysisFlowCharts: DialysisFlowChart[];
  haemodialysisRecords: HaemodialysisRecord[];
}

function readDB(): Database {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    throw new Error(`Failed to read database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function writeDB(data: Database): void {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to database:', error);
    throw new Error(`Failed to write to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function normalizeDateString(date: string): string {
  // Accepts 'YYYY-MM-DD' or 'YYYYMMDD'
  if (!date) return '';
  if (date.includes('-')) {
    const [yyyy, mm, dd] = date.split('-');
    return `${yyyy}${mm.padStart(2, '0')}${dd.padStart(2, '0')}`;
  }
  return date;
}

// Utility: Normalize isDeleted field for all records in all tables (set to 10 if missing)
export function normalizeIsDeletedFields(db: Database) {
  const ensureIsDeleted = (arr: any[]) =>
    arr.map(item =>
      typeof item.isDeleted === 'undefined' ? { ...item, isDeleted: 10 } : item
    );
  if (db.patients) db.patients = ensureIsDeleted(db.patients);
  if (db.appointments) db.appointments = ensureIsDeleted(db.appointments);
  if (db.history) db.history = ensureIsDeleted(db.history);
  if (db.billing) db.billing = ensureIsDeleted(db.billing);
  if (db.dialysisFlowCharts) db.dialysisFlowCharts = ensureIsDeleted(db.dialysisFlowCharts);
  if (db.haemodialysisRecords) db.haemodialysisRecords = ensureIsDeleted(db.haemodialysisRecords);
}

// Utility: Cascade soft-delete or hard-delete for all related records by patientId
function cascadeDeleteByPatientId(db: Database, patientId: string, softDelete = true) {
  // Mark as deleted if either patientId or id matches
  const markDeleted = (arr: any[]) =>
    arr.map(item =>
      (item.patientId === patientId || item.id === patientId)
        ? { ...item, isDeleted: 0 }
        : item
    );
  if (softDelete) {
    if (db.appointments) db.appointments = markDeleted(db.appointments);
    if (db.history) db.history = markDeleted(db.history);
    if (db.billing) db.billing = markDeleted(db.billing);
    if (db.dialysisFlowCharts) db.dialysisFlowCharts = markDeleted(db.dialysisFlowCharts);
    if (db.haemodialysisRecords) db.haemodialysisRecords = markDeleted(db.haemodialysisRecords);
  } else {
    if (db.appointments) db.appointments = db.appointments.filter(item => item.patientId !== patientId && item.id !== patientId);
    if (db.history) db.history = db.history.filter(item => item.patientId !== patientId && item.id !== patientId);
    if (db.billing) db.billing = db.billing.filter(item => item.patientId !== patientId && item.id !== patientId);
    if (db.dialysisFlowCharts) db.dialysisFlowCharts = db.dialysisFlowCharts.filter(item => item.patientId !== patientId && item.id !== patientId);
    if (db.haemodialysisRecords) db.haemodialysisRecords = db.haemodialysisRecords.filter(item => item.patientId !== patientId && item.id !== patientId);
  }
}

// Utility: Cascade restore for all related records by patientId
function cascadeRestoreByPatientId(db: Database, patientId: string) {
  // Mark as restored if either patientId or id matches
  const markRestored = (arr: any[]) =>
    arr.map(item =>
      (item.patientId === patientId || item.id === patientId)
        ? { ...item, isDeleted: 10, deletedAt: undefined }
        : item
    );

  if (db.appointments) db.appointments = markRestored(db.appointments);
  if (db.history) db.history = markRestored(db.history);
  if (db.billing) db.billing = markRestored(db.billing);
  if (db.dialysisFlowCharts) db.dialysisFlowCharts = markRestored(db.dialysisFlowCharts);
  if (db.haemodialysisRecords) db.haemodialysisRecords = markRestored(db.haemodialysisRecords);
}

// Patients
export const getPatients = (req: Request, res: Response): any => {
  try {
    console.log('Fetching all patients...');
    const db = readDB();
    const allPatients = db.patients || [];

    // Filter out soft-deleted patients (only return active patients where isDeleted !== 0)
    const patients = allPatients.filter(patient => patient.isDeleted !== 0);

    console.log(`Found ${patients.length} active patients out of ${allPatients.length} total`);
    return res.json(patients);
  } catch (error) {
    console.error('Error in getPatients:', error);
    return res.status(500).json({
      message: 'Failed to get patients',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const addPatient = (req: Request, res: Response): any => {
  try {
    console.log('Adding new patient:', req.body);
    const { firstName, lastName, gender, dateOfBirth, mobileNo, bloodGroup, catheterInsertionDate, fistulaCreationDate } = req.body;

    // Validate required fields
    const requiredFields = {
      firstName, lastName, gender, dateOfBirth, mobileNo, bloodGroup, catheterInsertionDate, fistulaCreationDate
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({
        message: 'All fields are required',
        missingFields
      });
    }

    const db = readDB();
    const dateStr = normalizeDateString(catheterInsertionDate);

    const serials = db.patients
      .filter(p => {
        // Normalize the date part of the patient ID for comparison
        if (!p.id) return false;
        const idDatePart = p.id.split('/')[0];
        return idDatePart === dateStr;
      })
      .map(p => parseInt((p.id.split('/')[1] || '0'), 10))
      .filter(n => !isNaN(n));

    const maxSerial = serials.length > 0 ? Math.max(...serials) : 0;
    const nextSerial = maxSerial + 1;
    const newPatientId = `${dateStr}/${String(nextSerial).padStart(3, '0')}`;
    // Ensure uniqueness (should never hit, but just in case)
    if (db.patients.some(p => p.id === newPatientId)) {
      return res.status(500).json({ message: 'Failed to generate unique patient ID. Please try again.' });
    }
    const newPatient: Patient = {
      id: newPatientId,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      mobileNo,
      bloodGroup,
      catheterInsertionDate,
      fistulaCreationDate,
      isDeleted: 10 // Mark as active by default
    };

    db.patients.push(newPatient);
    writeDB(db);
    console.log('Successfully added new patient:', newPatient);
    return res.status(201).json(newPatient);
  } catch (error) {
    console.error('Error in addPatient:', error);
    return res.status(500).json({
      message: 'Failed to add patient',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deletePatient = (req: Request, res: Response): any => {
  try {
    const patientId = req.params.id;
    console.log('Soft deleting patient with ID:', patientId);

    if (!patientId) {
      console.error('No patient ID provided');
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    const db = readDB();
    // Ensure all records have isDeleted field before operation
    normalizeIsDeletedFields(db);
    const patientIndex = db.patients.findIndex(p => p.id === patientId);

    if (patientIndex === -1) {
      console.error('Patient not found:', patientId);
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Soft delete: set isDeleted to 0 instead of removing the record
    db.patients[patientIndex].isDeleted = 0;
    // Cascade soft delete to all related tables
    cascadeDeleteByPatientId(db, patientId, true);
    // Ensure all records have isDeleted field after operation
    normalizeIsDeletedFields(db);
    writeDB(db);
    console.log('Successfully soft deleted patient and related records:', patientId);
    return res.status(200).json({ message: 'Patient and related records soft deleted successfully' });
  } catch (error) {
    console.error('Error in deletePatient:', error);
    return res.status(500).json({
      message: 'Failed to delete patient',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Restore soft-deleted patient
export const restorePatient = (req: Request, res: Response): any => {
  try {
    const patientId = req.params.id;
    console.log('Restoring patient with ID:', patientId);

    if (!patientId) {
      console.error('No patient ID provided');
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    const db = readDB();
    const patientIndex = db.patients.findIndex(p => p.id === patientId);

    if (patientIndex === -1) {
      console.error('Patient not found:', patientId);
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Restore: set isDeleted to 10 (active)
    db.patients[patientIndex].isDeleted = 10;
    db.patients[patientIndex].deletedAt = undefined;

    // Cascade restore to all related tables
    cascadeRestoreByPatientId(db, patientId);

    writeDB(db);
    console.log('Successfully restored patient and related records:', patientId);
    return res.status(200).json({ message: 'Patient and related records restored successfully' });
  } catch (error) {
    console.error('Error in restorePatient:', error);
    return res.status(500).json({
      message: 'Failed to restore patient',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Appointments
export const getAppointments = (req: Request, res: Response): any => {
  try {
    console.log('Fetching all appointments...');
    const db = readDB();
    const appointments = db.appointments || [];
    console.log(`Found ${appointments.length} appointments`);
    return res.json(appointments);
  } catch (error) {
    console.error('Error in getAppointments:', error);
    return res.status(500).json({
      message: 'Failed to get appointments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const addAppointment = (req: Request, res: Response): any => {
  try {
    console.log('Adding new appointment:', req.body);
    const db = readDB();
    const newAppointment: Appointment = { id: Date.now().toString(), ...req.body, isDeleted: 10 };
    db.appointments.push(newAppointment);
    writeDB(db);
    console.log('Successfully added new appointment:', newAppointment);
    return res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error in addAppointment:', error);
    return res.status(500).json({
      message: 'Failed to add appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteAppointment = (req: Request, res: Response): any => {
  try {
    const appointmentId = req.params.id;
    console.log('Deleting appointment with ID:', appointmentId);
    const db = readDB();
    // Find the appointment to get patientId
    const appointment = db.appointments.find(a => a.id === appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const patientId = appointment.patientId;
    // Remove the appointment
    db.appointments = db.appointments.filter(a => a.id !== appointmentId);
    // Remove all related history records for this patientId (optional: could filter by appointmentId if present)
    if (patientId) {
      db.history = db.history.filter(h => h.patientId !== patientId);
    }
    writeDB(db);
    console.log('Successfully deleted appointment and related history:', appointmentId);
    return res.status(204).end();
  } catch (error) {
    console.error('Error in deleteAppointment:', error);
    return res.status(500).json({
      message: 'Failed to delete appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Billing
export const getBilling = (req: Request, res: Response): any => {
  try {
    console.log('Fetching all billing records...');
    const db = readDB();
    const billing = (db.billing || []).filter(b => b.isDeleted !== 0); // Filter out soft-deleted records
    console.log(`Found ${billing.length} billing records`);
    return res.json(billing);
  } catch (error) {
    console.error('Error in getBilling:', error);
    return res.status(500).json({
      message: 'Failed to get billing',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const addBilling = (req: Request, res: Response): any => {
  try {
    console.log('Adding new billing record:', req.body);
    const db = readDB();
    const newBilling: Billing = { id: Date.now().toString(), ...req.body, isDeleted: 10 };
    db.billing.push(newBilling);
    writeDB(db);
    console.log('Successfully added new billing record:', newBilling);
    return res.status(201).json(newBilling);
  } catch (error) {
    console.error('Error in addBilling:', error);
    return res.status(500).json({
      message: 'Failed to add billing',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteBilling = (req: Request, res: Response): any => {
  try {
    const billingId = req.params.id;
    console.log('Deleting billing record with ID:', billingId);
    const db = readDB();
    db.billing = db.billing.filter(b => b.id !== billingId);
    writeDB(db);
    console.log('Successfully deleted billing record:', billingId);
    return res.status(204).end();
  } catch (error) {
    console.error('Error in deleteBilling:', error);
    return res.status(500).json({
      message: 'Failed to delete billing',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateBilling = (req: Request, res: Response): any => {
  try {
    const billingId = req.params.id;
    console.log('Updating billing record with ID:', billingId, req.body);
    const db = readDB();
    const billingIndex = db.billing.findIndex(b => b.id === billingId);

    if (billingIndex === -1) {
      return res.status(404).json({ message: 'Billing record not found' });
    }

    // Update the billing record
    db.billing[billingIndex] = {
      ...db.billing[billingIndex],
      ...req.body,
    };

    writeDB(db);
    console.log('Successfully updated billing record:', billingId);
    return res.json(db.billing[billingIndex]);
  } catch (error) {
    console.error('Error in updateBilling:', error);
    return res.status(500).json({
      message: 'Failed to update billing',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const softDeleteBilling = (req: Request, res: Response): any => {
  try {
    const billingId = req.params.id;
    console.log('Soft deleting billing record with ID:', billingId);
    const db = readDB();
    const billingIndex = db.billing.findIndex(b => b.id === billingId);

    if (billingIndex === -1) {
      return res.status(404).json({ message: 'Billing record not found' });
    }

    // Soft delete - mark as deleted
    db.billing[billingIndex].isDeleted = 0;
    db.billing[billingIndex].deletedAt = new Date().toISOString();

    writeDB(db);
    console.log('Successfully soft deleted billing record:', billingId);
    return res.status(200).json({ message: 'Billing record soft deleted successfully' });
  } catch (error) {
    console.error('Error in softDeleteBilling:', error);
    return res.status(500).json({
      message: 'Failed to soft delete billing',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// History
export const getHistory = (req: Request, res: Response): any => {
  try {
    console.log('Fetching all history records...');
    const db = readDB();
    const history = (db.history || []).filter(h => h.isDeleted !== 0); // Filter out soft-deleted records
    console.log(`Found ${history.length} history records`);
    return res.json(history);
  } catch (error) {
    console.error('Error in getHistory:', error);
    return res.status(500).json({
      message: 'Failed to get history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const addHistory = (req: Request, res: Response): any => {
  try {
    console.log('Adding new history record:', req.body);
    const db = readDB();
    const newHistory: History = { id: Date.now().toString(), ...req.body, isDeleted: 10 };
    db.history.push(newHistory);
    writeDB(db);
    console.log('Successfully added new history record:', newHistory);
    return res.status(201).json(newHistory);
  } catch (error) {
    console.error('Error in addHistory:', error);
    return res.status(500).json({
      message: 'Failed to add history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateHistory = (req: Request, res: Response): any => {
  try {
    const historyId = req.params.id;
    console.log('Updating history record with ID:', historyId, req.body);
    const db = readDB();
    const historyIndex = db.history.findIndex(h => h.id === historyId);

    if (historyIndex === -1) {
      return res.status(404).json({ message: 'History record not found' });
    }

    // Update the history record
    db.history[historyIndex] = {
      ...db.history[historyIndex],
      ...req.body,
    };

    writeDB(db);
    console.log('Successfully updated history record:', historyId);
    return res.json(db.history[historyIndex]);
  } catch (error) {
    console.error('Error in updateHistory:', error);
    return res.status(500).json({
      message: 'Failed to update history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteHistory = (req: Request, res: Response): any => {
  try {
    const historyId = req.params.id;
    console.log('Deleting history record with ID:', historyId);
    const db = readDB();
    db.history = db.history.filter(h => h.id !== historyId);
    writeDB(db);
    console.log('Successfully deleted history record:', historyId);
    return res.status(204).end();
  } catch (error) {
    console.error('Error in deleteHistory:', error);
    return res.status(500).json({
      message: 'Failed to delete history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const softDeleteHistory = (req: Request, res: Response): any => {
  try {
    const historyId = req.params.id;
    console.log('Soft deleting history record with ID:', historyId);
    const db = readDB();
    const historyIndex = db.history.findIndex(h => h.id === historyId);

    if (historyIndex === -1) {
      return res.status(404).json({ message: 'History record not found' });
    }

    // Soft delete - mark as deleted
    db.history[historyIndex].isDeleted = 0;
    db.history[historyIndex].deletedAt = new Date().toISOString();

    writeDB(db);
    console.log('Successfully soft deleted history record:', historyId);
    return res.status(200).json({ message: 'History record soft deleted successfully' });
  } catch (error) {
    console.error('Error in softDeleteHistory:', error);
    return res.status(500).json({
      message: 'Failed to soft delete history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Staff
export const getStaff = (req: Request, res: Response): any => {
  try {
    console.log('Fetching staff data...');
    const staffData: StaffData = {
      // technicians: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      doctors: ['Dr. Brown', 'Dr. Wilson', 'Dr. Davis'],
      units: ['Unit A', 'Unit B', 'Unit C']
    };
    return res.json(staffData);
  } catch (error) {
    console.error('Error in getStaff:', error);
    return res.status(500).json({
      message: 'Failed to get staff data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Dialysis Flow Charts
export const getDialysisFlowCharts = (req: Request, res: Response): any => {
  try {
    console.log('Fetching all dialysis flow charts...');
    const db = readDB();
    const dialysisFlowCharts = db.dialysisFlowCharts || [];
    console.log(`Found ${dialysisFlowCharts.length} dialysis flow charts`);
    return res.json(dialysisFlowCharts);
  } catch (error) {
    console.error('Error in getDialysisFlowCharts:', error);
    return res.status(500).json({
      message: 'Failed to get dialysis flow charts',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const addDialysisFlowChart = (req: Request, res: Response): any => {
  try {
    console.log('Adding new dialysis flow chart:', req.body);
    const db = readDB();
    const newDialysisFlowChart: DialysisFlowChart = {
      id: Date.now().toString(),
      ...req.body,
      isDeleted: 10
    };
    db.dialysisFlowCharts.push(newDialysisFlowChart);
    writeDB(db);
    console.log('Successfully added new dialysis flow chart:', newDialysisFlowChart);
    return res.status(201).json(newDialysisFlowChart);
  } catch (error) {
    console.error('Error in addDialysisFlowChart:', error);
    return res.status(500).json({
      message: 'Failed to add dialysis flow chart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteDialysisFlowChart = (req: Request, res: Response): any => {
  try {
    const dialysisFlowChartId = req.params.id;
    console.log('Deleting dialysis flow chart with ID:', dialysisFlowChartId);
    const db = readDB();
    db.dialysisFlowCharts = db.dialysisFlowCharts.filter(d => d.id !== dialysisFlowChartId);
    writeDB(db);
    console.log('Successfully deleted dialysis flow chart:', dialysisFlowChartId);
    return res.status(204).end();
  } catch (error) {
    console.error('Error in deleteDialysisFlowChart:', error);
    return res.status(500).json({
      message: 'Failed to delete dialysis flow chart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Haemodialysis Records
export const getHaemodialysisRecords = (req: Request, res: Response): any => {
  try {
    const db = readDB();
    return res.json(db.haemodialysisRecords || []);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch haemodialysis records' });
  }
};

export const addHaemodialysisRecord = (req: Request, res: Response): any => {
  try {
    const db = readDB();
    const newRecord: HaemodialysisRecord = {
      id: Date.now().toString(),
      ...req.body
    };
    db.haemodialysisRecords.push(newRecord);
    writeDB(db);
    return res.status(201).json(newRecord);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add haemodialysis record' });
  }
}; 