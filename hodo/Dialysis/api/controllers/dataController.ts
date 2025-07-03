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
  technicians: string[];
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
    const patientIndex = db.patients.findIndex(p => p.id === patientId);
    
    if (patientIndex === -1) {
      console.error('Patient not found:', patientId);
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Soft delete: set isDeleted to 0 instead of removing the record
    db.patients[patientIndex].isDeleted = 0;

    writeDB(db);
    console.log('Successfully soft deleted patient:', patientId);
    return res.status(200).json({ message: 'Patient soft deleted successfully' });
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
    
    writeDB(db);
    console.log('Successfully restored patient:', patientId);
    return res.status(200).json({ message: 'Patient restored successfully' });
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
    const newAppointment: Appointment = { id: Date.now().toString(), ...req.body };
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
    db.appointments = db.appointments.filter(a => a.id !== appointmentId);
    writeDB(db);
    console.log('Successfully deleted appointment:', appointmentId);
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
    const billing = db.billing || [];
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
    const newBilling: Billing = { id: Date.now().toString(), ...req.body };
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

// History
export const getHistory = (req: Request, res: Response): any => {
  try {
    console.log('Fetching all history records...');
    const db = readDB();
    const history = db.history || [];
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
    const newHistory: History = { id: Date.now().toString(), ...req.body };
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

// Staff
export const getStaff = (req: Request, res: Response): any => {
  try {
    console.log('Fetching staff data...');
    const staffData: StaffData = {
      technicians: ['John Doe', 'Jane Smith', 'Mike Johnson'],
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
      ...req.body 
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