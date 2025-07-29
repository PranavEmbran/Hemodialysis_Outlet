import type { Request, Response } from 'express';
import { getData, addData, deleteData, getPatientsDerived, getSchedulesAssigned, addSchedulesAssigned, getCaseOpenings, addCaseOpening } from '../services/dataFactory.js';
import * as lowdbService from '../services/lowdbService.js';
import * as mssqlService from '../services/mssqlService.js';
import db from '../db/lowdb.js';
import { addPostDialysisRecord, addPredialysisRecord, addStartDialysisRecord } from '../services/lowdbService.js';

const useMSSQL = process.env.USE_MSSQL === 'true';

export const getAll = async (req: Request, res: Response) => {
  try {
    const items = await getData();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};

export const add = async (req: Request, res: Response) => {
  try {
    const { name, value } = req.body;
    if (!name || typeof value !== 'number') {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const newItem = await addData({ name, value });
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add data' });
  }
};

export const deleteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteData(id);
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete data' });
  }
};

export const getPatientsDerivedHandler = async (req: Request, res: Response) => {
  try {
    const patients = await getPatientsDerived();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

export const getSchedulesAssignedHandler = async (req: Request, res: Response) => {
  try {
    const schedules = await getSchedulesAssigned();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
};

export const addSchedulesAssignedHandler = async (req: Request, res: Response) => {
  try {
    const sessions = req.body;
    if (!Array.isArray(sessions)) {
      return res.status(400).json({ error: 'Request body must be an array of sessions' });
    }
    const updated = await addSchedulesAssigned(sessions);
    res.status(201).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add schedules' });
  }
};

export const getCaseOpeningsHandler = async (req: Request, res: Response) => {
  try {
    const caseOpenings = await getCaseOpenings();
    res.json(caseOpenings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch case openings' });
  }
};

export const addCaseOpeningHandler = async (req: Request, res: Response) => {
  try {
    const { HCO_ID_PK, P_ID_FK, HCO_Blood_Group, HCO_Case_nature } = req.body;
    if (!HCO_ID_PK || !P_ID_FK || !HCO_Blood_Group || !HCO_Case_nature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newCaseOpening = await addCaseOpening({ HCO_ID_PK, P_ID_FK, HCO_Blood_Group, HCO_Case_nature });
    res.status(201).json(newCaseOpening);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add case opening' });
  }
};

export const savePredialysisRecord = async (req: Request, res: Response) => {
  try {
    const record = req.body;
    // Basic validation
    if (!record.SA_ID_FK_PK || !record.P_ID_FK) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const saved = await addPredialysisRecord(record);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save predialysis record' });
  }
};

export const saveStartDialysisRecord = async (req: Request, res: Response) => {
  try {
    const record = req.body;
    if (!record.SA_ID_FK_PK) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const saved = await addStartDialysisRecord(record);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save start dialysis record' });
  }
};

export const getInProcessRecords = async (req: Request, res: Response) => {
  try {
    let records;
    if (useMSSQL) {
      records = await mssqlService.getInProcessRecords();
    } else {
      await db.read();
      records = db.data?.InProcess_records || [];
    }
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch in-process records' });
  }
};

export const saveInProcessRecord = async (req: Request, res: Response) => {
  try {
    await db.read();
    const record = req.body;
    if (!record) {
      return res.status(400).json({ error: 'Missing record data' });
    }
    if (!record.id) {
      record.id = Date.now().toString();
    }
    if (!db.data) db.data = { InProcess_records: [] } as any;
    db.data.InProcess_records = db.data.InProcess_records || [];
    db.data.InProcess_records.push(record);
    await db.write();
    res.status(201).json({ message: 'In-process record saved successfully', record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save in-process record' });
  }
};

export const savePostDialysisRecord = async (req: Request, res: Response) => {
  try {
    const record = req.body;
    if (!record.SA_ID_FK) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const saved = await addPostDialysisRecord(record);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save post dialysis record' });
  }
};

export const getPredialysisRecords = async (req: Request, res: Response) => {
  try {
    let records;
    if (useMSSQL) {
      records = await mssqlService.getPredialysisRecords();
    } else {
      await db.read();
      records = db.data?.predialysis_records || [];
    }
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch predialysis records' });
  }
};

export const getStartDialysisRecords = async (req: Request, res: Response) => {
  try {
    let records;
    if (useMSSQL) {
      records = await mssqlService.getStartDialysisRecords();
    } else {
      await db.read();
      records = db.data?.start_dialysis_records || [];
    }
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch start dialysis records' });
  }
};

export const getPostDialysisRecords = async (req: Request, res: Response) => {
  try {
    let records;
    if (useMSSQL) {
      records = await mssqlService.getPostDialysisRecords();
    } else {
      await db.read();
      records = db.data?.post_dialysis_records || [];
    }
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post dialysis records' });
  }
};

export const updatePredialysisRecord = async (req: Request, res: Response) => {
  try {
    const { id, ...rest } = req.body;
    await db.read();
    const idx = db.data.predialysis_records.findIndex((r: any) => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Record not found' });
    db.data.predialysis_records[idx] = { ...db.data.predialysis_records[idx], ...rest };
    await db.write();
    res.json(db.data.predialysis_records[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update predialysis record' });
  }
};

export const updateStartDialysisRecord = async (req: Request, res: Response) => {
  try {
    const { id, ...rest } = req.body;
    await db.read();
    const idx = db.data.start_dialysis_records.findIndex((r: any) => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Record not found' });
    db.data.start_dialysis_records[idx] = { ...db.data.start_dialysis_records[idx], ...rest };
    await db.write();
    res.json(db.data.start_dialysis_records[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update start dialysis record' });
  }
};

export const updatePostDialysisRecord = async (req: Request, res: Response) => {
  try {
    const { id, ...rest } = req.body;
    await db.read();
    const idx = db.data.post_dialysis_records.findIndex((r: any) => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Record not found' });
    db.data.post_dialysis_records[idx] = { ...db.data.post_dialysis_records[idx], ...rest };
    await db.write();
    res.json(db.data.post_dialysis_records[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update post dialysis record' });
  }
};

// --- Units CRUD ---
export const getUnits = async (req: Request, res: Response) => {
  try {
    await db.read();
    if (!db.data.units) db.data.units = [];
    res.json(db.data.units);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch units' });
  }
};

export const addUnit = async (req: Request, res: Response) => {
  try {
    await db.read();
    if (!db.data.units) db.data.units = [];
    const unit = req.body;
    if (!unit.Unit_ID_PK) unit.Unit_ID_PK = Date.now();
    db.data.units.push(unit);
    // Sync scheduling_lookup[0].SL_No_of_units
    if (db.data.scheduling_lookup && db.data.scheduling_lookup.length > 0) {
      db.data.scheduling_lookup[0].SL_No_of_units = db.data.units.length;
    }
    await db.write();
    res.status(201).json(unit);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add unit' });
  }
};

export const updateUnit = async (req: Request, res: Response) => {
  try {
    await db.read();
    if (!db.data.units) db.data.units = [];
    const { Unit_ID_PK, ...rest } = req.body;
    const idx = db.data.units.findIndex(u => u.Unit_ID_PK == Unit_ID_PK);
    if (idx === -1) return res.status(404).json({ error: 'Unit not found' });
    db.data.units[idx] = { ...db.data.units[idx], ...rest, Unit_ID_PK };
    // Sync scheduling_lookup[0].SL_No_of_units
    if (db.data.scheduling_lookup && db.data.scheduling_lookup.length > 0) {
      db.data.scheduling_lookup[0].SL_No_of_units = db.data.units.length;
    }
    await db.write();
    res.json(db.data.units[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update unit' });
  }
};

export const deleteUnit = async (req: Request, res: Response) => {
  try {
    await db.read();
    if (!db.data.units) db.data.units = [];
    const id = req.params.id;
    const idx = db.data.units.findIndex(u => u.Unit_ID_PK == id);
    if (idx === -1) return res.status(404).json({ error: 'Unit not found' });
    db.data.units.splice(idx, 1);
    // Sync scheduling_lookup[0].SL_No_of_units
    if (db.data.scheduling_lookup && db.data.scheduling_lookup.length > 0) {
      db.data.scheduling_lookup[0].SL_No_of_units = db.data.units.length;
    }
    await db.write();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete unit' });
  }
};

// --- Vascular Access CRUD ---
export const getVascularAccesses = async (req: Request, res: Response) => {
  try {
    await db.read();
    if (!db.data.vascular_access) db.data.vascular_access = [];
    res.json(db.data.vascular_access);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vascular access types' });
  }
};

export const addVascularAccess = async (req: Request, res: Response) => {
  try {
    await db.read();
    if (!db.data.vascular_access) db.data.vascular_access = [];
    const access = req.body;
    if (!access.VAL_Access_ID_PK) access.VAL_Access_ID_PK = Date.now();
    db.data.vascular_access.push(access);
    await db.write();
    res.status(201).json(access);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add vascular access type' });
  }
};

export const updateVascularAccess = async (req: Request, res: Response) => {
  try {
    await db.read();
    if (!db.data.vascular_access) db.data.vascular_access = [];
    const { VAL_Access_ID_PK, ...rest } = req.body;
    const idx = db.data.vascular_access.findIndex(a => a.VAL_Access_ID_PK == VAL_Access_ID_PK);
    if (idx === -1) return res.status(404).json({ error: 'Vascular access type not found' });
    db.data.vascular_access[idx] = { ...db.data.vascular_access[idx], ...rest, VAL_Access_ID_PK };
    await db.write();
    res.json(db.data.vascular_access[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update vascular access type' });
  }
};

export const deleteVascularAccess = async (req: Request, res: Response) => {
  try {
    await db.read();
    if (!db.data.vascular_access) db.data.vascular_access = [];
    const id = req.params.id;
    const idx = db.data.vascular_access.findIndex(a => a.VAL_Access_ID_PK == id);
    if (idx === -1) return res.status(404).json({ error: 'Vascular access type not found' });
    db.data.vascular_access.splice(idx, 1);
    await db.write();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vascular access type' });
  }
};

// --- Dialyzer Types CRUD ---
export const getDialyzerTypes = async (req: Request, res: Response) => {
  try {
    await db.read();
    if (!db.data.dialyzer_types) db.data.dialyzer_types = [];
    res.json(db.data.dialyzer_types);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dialyzer types' });
  }
};

export const addDialyzerType = async (req: Request, res: Response) => {
  try {
    await db.read();
    if (!db.data.dialyzer_types) db.data.dialyzer_types = [];
    const dialyzer = req.body;
    if (!dialyzer.DTL_ID_PK) dialyzer.DTL_ID_PK = Date.now();
    db.data.dialyzer_types.push(dialyzer);
    await db.write();
    res.status(201).json(dialyzer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add dialyzer type' });
  }
};

export const updateDialyzerType = async (req: Request, res: Response) => {
  try {
    await db.read();
    if (!db.data.dialyzer_types) db.data.dialyzer_types = [];
    const { DTL_ID_PK, ...rest } = req.body;
    const idx = db.data.dialyzer_types.findIndex(d => d.DTL_ID_PK == DTL_ID_PK);
    if (idx === -1) return res.status(404).json({ error: 'Dialyzer type not found' });
    db.data.dialyzer_types[idx] = { ...db.data.dialyzer_types[idx], ...rest, DTL_ID_PK };
    await db.write();
    res.json(db.data.dialyzer_types[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update dialyzer type' });
  }
};

export const deleteDialyzerType = async (req: Request, res: Response) => {
  try {
    await db.read();
    if (!db.data.dialyzer_types) db.data.dialyzer_types = [];
    const id = req.params.id;
    const idx = db.data.dialyzer_types.findIndex(d => d.DTL_ID_PK == id);
    if (idx === -1) return res.status(404).json({ error: 'Dialyzer type not found' });
    db.data.dialyzer_types.splice(idx, 1);
    await db.write();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete dialyzer type' });
  }
};

// --- Scheduling Lookup CRUD ---
export const getSchedulingLookup = async (req: Request, res: Response) => {
  try {
    await db.read();
    if (!db.data.scheduling_lookup) db.data.scheduling_lookup = [];
    res.json(db.data.scheduling_lookup);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scheduling lookup' });
  }
};

export const addSchedulingLookup = async (req: Request, res: Response) => {
  try {
    await db.read();
    if (!db.data.scheduling_lookup) db.data.scheduling_lookup = [];
    const entry = req.body;
    if (!entry.id) entry.id = Date.now();
    db.data.scheduling_lookup.push(entry);
    await db.write();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add scheduling lookup entry' });
  }
};

export const updateSchedulingLookup = async (req: Request, res: Response) => {
  try {
    await db.read();
    if (!db.data.scheduling_lookup) db.data.scheduling_lookup = [];
    const { id, ...rest } = req.body;
    const idx = db.data.scheduling_lookup.findIndex(e => e.id == id);
    if (idx === -1) return res.status(404).json({ error: 'Scheduling lookup entry not found' });
    db.data.scheduling_lookup[idx] = { ...db.data.scheduling_lookup[idx], ...rest, id };
    await db.write();
    res.json(db.data.scheduling_lookup[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update scheduling lookup entry' });
  }
};

export const deleteSchedulingLookup = async (req: Request, res: Response) => {
  try {
    await db.read();
    if (!db.data.scheduling_lookup) db.data.scheduling_lookup = [];
    const id = req.params.id;
    const idx = db.data.scheduling_lookup.findIndex(e => e.id == id);
    if (idx === -1) return res.status(404).json({ error: 'Scheduling lookup entry not found' });
    db.data.scheduling_lookup.splice(idx, 1);
    await db.write();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete scheduling lookup entry' });
  }
}; 