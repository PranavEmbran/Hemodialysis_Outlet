import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { generatePatientId } from '../utils/patientIdGenerator';

const router = express.Router();

// Database file path
const dbPath = path.join(__dirname, '../db/db.json');

// Helper function to read database
const readDatabase = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { patients: [], appointments: [], billing: [], history: [], dialysisFlowCharts: [], haemodialysisRecords: [] };
  }
};

// Helper function to write database
const writeDatabase = (data: any) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
};

// Test endpoint
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'API is working!' });
});

// Debug endpoint to check database path and working directory
router.get('/debug', (req: Request, res: Response) => {
  res.json({
    message: 'Debug info',
    dbPath: dbPath,
    workingDirectory: process.cwd(),
    fileExists: fs.existsSync(dbPath),
    fileStats: fs.existsSync(dbPath) ? fs.statSync(dbPath) : null
  });
});

// Patients endpoints
router.get('/patients', (req: Request, res: Response) => {
  try {
    const db = readDatabase();
    res.json(db.patients || []);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

router.post('/patients', (req: Request, res: Response) => {
  try {
    const db = readDatabase();
    // Use catheterInsertionDate as registration date for ID
    const newPatientId = generatePatientId(req.body.catheterInsertionDate);
    const patient = {
      ...req.body,
      id: newPatientId
    };

    db.patients.push(patient);
    writeDatabase(db);

    res.status(201).json(patient);
  } catch (error) {
    console.error('Error adding patient:', error);
    res.status(500).json({ error: 'Failed to add patient' });
  }
});

// Get patient by ID
router.get('/patients/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = readDatabase();
    
    const patient = db.patients.find((p: any) => p.id === id);
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ error: 'Patient not found' });
    }
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// Update patient by ID
router.put('/patients/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = readDatabase();
    
    const index = db.patients.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      // Update the patient data while preserving the ID
      const updatedPatient = {
        ...db.patients[index],
        ...req.body,
        id: id // Ensure ID is preserved
      };
      
      db.patients[index] = updatedPatient;
      writeDatabase(db);
      
      res.json(updatedPatient);
    } else {
      res.status(404).json({ error: 'Patient not found' });
    }
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// Delete patient by ID
router.delete('/patients/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = readDatabase();
    
    const index = db.patients.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      db.patients.splice(index, 1);
      writeDatabase(db);
      res.json({ message: `Patient ${id} deleted successfully` });
    } else {
      res.status(404).json({ error: 'Patient not found' });
    }
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

// Billing endpoints
router.get('/billing', (req: Request, res: Response) => {
  try {
    const db = readDatabase();
    res.json(db.billing || []);
  } catch (error) {
    console.error('Error fetching billing:', error);
    res.status(500).json({ error: 'Failed to fetch billing' });
  }
});

router.post('/billing', (req: Request, res: Response) => {
  try {
    const db = readDatabase();
    const bill = {
      ...req.body,
      id: Date.now().toString()
    };

    db.billing.push(bill);
    writeDatabase(db);

    res.status(201).json(bill);
  } catch (error) {
    console.error('Error adding bill:', error);
    res.status(500).json({ error: 'Failed to add bill' });
  }
});

// History endpoints
router.get('/history', (req: Request, res: Response) => {
  try {
    const db = readDatabase();
    res.json(db.history || []);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.post('/history', (req: Request, res: Response) => {
  try {
    const db = readDatabase();
    const history = {
      ...req.body,
      id: Date.now().toString()
    };

    db.history.push(history);
    writeDatabase(db);

    res.status(201).json(history);
  } catch (error) {
    console.error('Error adding history:', error);
    res.status(500).json({ error: 'Failed to add history' });
  }
});

router.delete('/history/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = readDatabase();

    const index = db.history.findIndex((h: any) => h.id === id);
    if (index !== -1) {
      db.history.splice(index, 1);
      writeDatabase(db);
      res.json({ message: `History record ${id} deleted successfully` });
    } else {
      res.status(404).json({ error: 'History record not found' });
    }
  } catch (error) {
    console.error('Error deleting history:', error);
    res.status(500).json({ error: 'Failed to delete history' });
  }
});

// Schedule endpoints (appointments)
router.get('/schedule', (req: Request, res: Response) => {
  try {
    const db = readDatabase();
    res.json(db.appointments || []);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Add the /schedules endpoint (plural) for frontend compatibility
router.get('/schedules', (req: Request, res: Response) => {
  try {
    const db = readDatabase();
    res.json(db.appointments || []);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

router.post('/schedule', (req: Request, res: Response) => {
  try {
    const db = readDatabase();
    const schedule = {
      ...req.body,
      id: Date.now().toString()
    };

    db.appointments.push(schedule);
    writeDatabase(db);

    res.status(201).json(schedule);
  } catch (error) {
    console.error('Error adding schedule:', error);
    res.status(500).json({ error: 'Failed to add schedule' });
  }
});

// Add the /schedules POST endpoint (plural) for frontend compatibility
router.post('/schedules', (req: Request, res: Response) => {
  try {
    const db = readDatabase();
    const schedule = {
      ...req.body,
      id: Date.now().toString()
    };

    db.appointments.push(schedule);
    writeDatabase(db);

    res.status(201).json(schedule);
  } catch (error) {
    console.error('Error adding schedule:', error);
    res.status(500).json({ error: 'Failed to add schedule' });
  }
});

// Get appointment by ID
router.get('/appointments/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = readDatabase();
    
    const appointment = db.appointments.find((a: any) => a.id === id);
    if (appointment) {
      res.json(appointment);
    } else {
      res.status(404).json({ error: 'Appointment not found' });
    }
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// Update appointment by ID
router.put('/appointments/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = readDatabase();
    
    const index = db.appointments.findIndex((a: any) => a.id === id);
    if (index !== -1) {
      // Update the appointment data while preserving the ID
      const updatedAppointment = {
        ...db.appointments[index],
        ...req.body,
        id: id // Ensure ID is preserved
      };
      
      db.appointments[index] = updatedAppointment;
      writeDatabase(db);
      
      res.json(updatedAppointment);
    } else {
      res.status(404).json({ error: 'Appointment not found' });
    }
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Delete appointment by ID
router.delete('/appointments/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = readDatabase();
    
    const index = db.appointments.findIndex((a: any) => a.id === id);
    if (index !== -1) {
      db.appointments.splice(index, 1);
      writeDatabase(db);
      res.json({ message: `Appointment ${id} deleted successfully` });
    } else {
      res.status(404).json({ error: 'Appointment not found' });
    }
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// Staff endpoint
router.get('/staff', (req: Request, res: Response) => {
  try {
    // Mock staff data - you can move this to db.json later
    const staffData = {
      technicians: [
        "Dr. Smith",
        "Dr. Brown",
        "Dr. Wilson",
        "Dr. Davis",
        "Dr. Miller"
      ],
      doctors: [
        "Dr. Johnson",
        "Dr. Williams",
        "Dr. Davis",
        "Dr. Miller",
        "Dr. Garcia"
      ],
      units: [
        "Unit A",
        "Unit B",
        "Unit C",
        "Unit D"
      ]
    };
    res.json(staffData);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// Dialysis Flow Chart endpoints
router.get('/dialysis-flow-charts', (req: Request, res: Response) => {
  try {
    const db = readDatabase();
    res.json(db.dialysisFlowCharts || []);
  } catch (error) {
    console.error('Error fetching dialysis flow charts:', error);
    res.status(500).json({ error: 'Failed to fetch dialysis flow charts' });
  }
});

router.post('/dialysis-flow-charts', (req: Request, res: Response) => {
  try {
    const db = readDatabase();
    const dialysisFlowChart = {
      ...req.body,
      id: Date.now().toString()
    };

    db.dialysisFlowCharts.push(dialysisFlowChart);
    writeDatabase(db);

    res.status(201).json(dialysisFlowChart);
  } catch (error) {
    console.error('Error adding dialysis flow chart:', error);
    res.status(500).json({ error: 'Failed to add dialysis flow chart' });
  }
});

router.delete('/dialysis-flow-charts/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = readDatabase();

    const index = db.dialysisFlowCharts.findIndex((d: any) => d.id === id);
    if (index !== -1) {
      db.dialysisFlowCharts.splice(index, 1);
      writeDatabase(db);
      res.json({ message: `Dialysis flow chart ${id} deleted successfully` });
    } else {
      res.status(404).json({ error: 'Dialysis flow chart not found' });
    }
  } catch (error) {
    console.error('Error deleting dialysis flow chart:', error);
    res.status(500).json({ error: 'Failed to delete dialysis flow chart' });
  }
});

// Haemodialysis Records endpoints
router.get('/haemodialysis-records', (req: Request, res: Response) => {
  try {
    const db = readDatabase();
    res.json(db.haemodialysisRecords || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch haemodialysis records' });
  }
});

router.post('/haemodialysis-records', (req: Request, res: Response) => {
  try {
    const db = readDatabase();
    const newRecord = {
      ...req.body,
      id: Date.now().toString()
    };
    db.haemodialysisRecords.push(newRecord);
    writeDatabase(db);
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add haemodialysis record' });
  }
});

export default router; 