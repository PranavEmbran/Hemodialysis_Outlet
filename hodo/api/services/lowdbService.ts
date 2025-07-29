import db, { initDB, Item } from '../db/lowdb.js';
import { nanoid } from 'nanoid';

export interface Patient {
  id: string;
  Name: string;
}

export const getData = async (): Promise<Item[]> => {
  await initDB();
  await db.read();
  return db.data?.items || [];
};

export const addData = async (item: Omit<Item, 'id'>): Promise<Item> => {
  await initDB();
  await db.read();
  const newItem: Item = { id: nanoid(), ...item };
  db.data!.items.push(newItem);
  await db.write();
  return newItem;
};

export const deleteData = async (id: string): Promise<boolean> => {
  await initDB();
  await db.read();
  const prevLen = db.data!.items.length;
  db.data!.items = db.data!.items.filter(item => item.id !== id);
  const changed = db.data!.items.length < prevLen;
  if (changed) await db.write();
  return changed;
};

export const getPatientsDerived = async (): Promise<Patient[]> => {
  await initDB();
  await db.read();
  // @ts-ignore
  return db.data?.patients_derived || [];
};

export interface ScheduleAssigned {
  SA_ID_PK: string;
  P_ID_FK: string;
  SA_Date: string;
  SA_Time: string;
  isDeleted: number;
  Added_by: string;
  Added_on: string;
  Modified_by: string;
  Modified_on: string;
  Provider_FK: string;
  Outlet_FK: string;
}

export const getSchedulesAssigned = async (): Promise<ScheduleAssigned[]> => {
  await initDB();
  await db.read();
  // @ts-ignore
  return db.data?.Schedules_Assigned || [];
};

export const addSchedulesAssigned = async (sessions: ScheduleAssigned[]): Promise<ScheduleAssigned[]> => {
  await initDB();
  await db.read();
  // @ts-ignore
  const existing = db.data!.Schedules_Assigned || [];
  // Find the max numeric part of existing SA_ID_PK
  let maxNum = 0;
  for (const s of existing) {
    const match = typeof s.SA_ID_PK === 'string' && s.SA_ID_PK.match(/^SA(\d{3,})$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  // Assign new IDs
  const newSessions = sessions.map((session, idx) => ({
    ...session,
    SA_ID_PK: `SA${String(maxNum + idx + 1).padStart(3, '0')}`
  }));
  db.data!.Schedules_Assigned = [...existing, ...newSessions];
  await db.write();
  return db.data!.Schedules_Assigned;
};

export interface CaseOpening {
  HCO_ID_PK: string;
  P_ID_FK: string;
  HCO_Blood_Group: string;
  HCO_Case_nature: string;
}

export const getCaseOpenings = async (): Promise<CaseOpening[]> => {
  await initDB();
  await db.read();
  // @ts-ignore
  return db.data?.case_openings || [];
};

export const addCaseOpening = async (caseOpening: CaseOpening): Promise<CaseOpening> => {
  await initDB();
  await db.read();
  db.data!.case_openings.push(caseOpening);
  await db.write();
  return caseOpening;
};

export interface PredialysisRecord {
  SA_ID_FK_PK: string;
  P_ID_FK: string;
  PreDR_Vitals_BP: string;
  PreDR_Vitals_HeartRate: string;
  PreDR_Vitals_Temperature: string;
  PreDR_Vitals_Weight: string;
  PreDR_Notes: string;
}

export const addPredialysisRecord = async (record: PredialysisRecord): Promise<PredialysisRecord> => {
  await initDB();
  await db.read();
  if (!db.data!.predialysis_records) db.data!.predialysis_records = [];
  // Optionally add an id
  const newRecord = { id: nanoid(), ...record };
  db.data!.predialysis_records.push(newRecord);
  await db.write();
  return newRecord;
};

export interface StartDialysisRecord {
  SA_ID_FK_PK: string;
  Dialysis_Unit: string;
  SDR_Start_time: string;
  SDR_Vascular_access: string;
  Dialyzer_Type: string;
  SDR_Notes: string;
}

export const addStartDialysisRecord = async (record: StartDialysisRecord): Promise<StartDialysisRecord> => {
  await initDB();
  await db.read();
  if (!db.data!.start_dialysis_records) db.data!.start_dialysis_records = [];
  const newRecord = { id: nanoid(), ...record };
  db.data!.start_dialysis_records.push(newRecord);
  await db.write();
  return newRecord;
};

export interface InProcessRecord {
  SA_ID_FK_PK: string;
  rows: any[];
}

export const addInProcessRecord = async (record: InProcessRecord): Promise<InProcessRecord> => {
  await initDB();
  await db.read();
  if (!db.data!.InProcess_records) db.data!.InProcess_records = [];
  const newRecord = { id: nanoid(), ...record };
  db.data!.InProcess_records.push(newRecord);
  await db.write();
  return newRecord;
};

export interface PostDialysisRecord {
  SA_ID_FK: string;
  P_ID_FK: string;
  PreDR_Vitals_BP: string;
  PreDR_Vitals_HeartRate: string;
  PreDR_Vitals_Temperature: string;
  PreDR_Vitals_Weight: string;
  PostDR_Notes: string;
}

export const addPostDialysisRecord = async (record: PostDialysisRecord): Promise<PostDialysisRecord> => {
  await initDB();
  await db.read();
  if (!db.data.post_dialysis_records) db.data.post_dialysis_records = [];
  db.data.post_dialysis_records.push(record);
  await db.write();
  return record;
};

// --- Units Lookup Functions ---
export const getUnits = async (): Promise<any[]> => {
  await initDB();
  await db.read();
  return db.data?.units || [];
};

export const addUnit = async (unit: any): Promise<any> => {
  await initDB();
  await db.read();
  if (!db.data.units) db.data.units = [];
  if (!unit.Unit_ID_PK) unit.Unit_ID_PK = Date.now();
  db.data.units.push(unit);
  await db.write();
  return unit;
};

export const updateUnit = async (unitData: any): Promise<any> => {
  await initDB();
  await db.read();
  if (!db.data.units) db.data.units = [];
  const { Unit_ID_PK, ...rest } = unitData;
  const idx = db.data.units.findIndex(u => u.Unit_ID_PK == Unit_ID_PK);
  if (idx === -1) throw new Error('Unit not found');
  db.data.units[idx] = { ...db.data.units[idx], ...rest, Unit_ID_PK };
  await db.write();
  return db.data.units[idx];
};

export const deleteUnit = async (id: string): Promise<boolean> => {
  await initDB();
  await db.read();
  if (!db.data.units) db.data.units = [];
  const idx = db.data.units.findIndex(u => u.Unit_ID_PK == id);
  if (idx === -1) return false;
  db.data.units.splice(idx, 1);
  await db.write();
  return true;
};

// --- Vascular Access Lookup Functions ---
export const getVascularAccesses = async (): Promise<any[]> => {
  await initDB();
  await db.read();
  return db.data?.vascular_access || [];
};

export const addVascularAccess = async (access: any): Promise<any> => {
  await initDB();
  await db.read();
  if (!db.data.vascular_access) db.data.vascular_access = [];
  if (!access.VAL_ID_PK) access.VAL_ID_PK = Date.now();
  db.data.vascular_access.push(access);
  await db.write();
  return access;
};

export const updateVascularAccess = async (accessData: any): Promise<any> => {
  await initDB();
  await db.read();
  if (!db.data.vascular_access) db.data.vascular_access = [];
  const { VAL_ID_PK, ...rest } = accessData;
  const idx = db.data.vascular_access.findIndex((v: any) => v.VAL_ID_PK == VAL_ID_PK);
  if (idx === -1) throw new Error('Vascular access not found');
  db.data.vascular_access[idx] = { ...db.data.vascular_access[idx], ...rest, VAL_ID_PK };
  await db.write();
  return db.data.vascular_access[idx];
};

export const deleteVascularAccess = async (id: string): Promise<boolean> => {
  await initDB();
  await db.read();
  if (!db.data.vascular_access) db.data.vascular_access = [];
  const idx = db.data.vascular_access.findIndex((v: any) => v.VAL_ID_PK == id);
  if (idx === -1) return false;
  db.data.vascular_access.splice(idx, 1);
  await db.write();
  return true;
};

// --- Dialyzer Types Lookup Functions ---
export const getDialyzerTypes = async (): Promise<any[]> => {
  await initDB();
  await db.read();
  return db.data?.dialyzer_types || [];
};

export const addDialyzerType = async (type: any): Promise<any> => {
  await initDB();
  await db.read();
  if (!db.data.dialyzer_types) db.data.dialyzer_types = [];
  if (!type.DTL_ID_PK) type.DTL_ID_PK = Date.now();
  db.data.dialyzer_types.push(type);
  await db.write();
  return type;
};

export const updateDialyzerType = async (typeData: any): Promise<any> => {
  await initDB();
  await db.read();
  if (!db.data.dialyzer_types) db.data.dialyzer_types = [];
  const { DTL_ID_PK, ...rest } = typeData;
  const idx = db.data.dialyzer_types.findIndex(d => d.DTL_ID_PK == DTL_ID_PK);
  if (idx === -1) throw new Error('Dialyzer type not found');
  db.data.dialyzer_types[idx] = { ...db.data.dialyzer_types[idx], ...rest, DTL_ID_PK };
  await db.write();
  return db.data.dialyzer_types[idx];
};

export const deleteDialyzerType = async (id: string): Promise<boolean> => {
  await initDB();
  await db.read();
  if (!db.data.dialyzer_types) db.data.dialyzer_types = [];
  const idx = db.data.dialyzer_types.findIndex(d => d.DTL_ID_PK == id);
  if (idx === -1) return false;
  db.data.dialyzer_types.splice(idx, 1);
  await db.write();
  return true;
};

// --- Scheduling Lookup Functions ---
export const getSchedulingLookup = async (): Promise<any[]> => {
  await initDB();
  await db.read();
  return db.data?.scheduling_lookup || [];
};

export const addSchedulingLookup = async (lookup: any): Promise<any> => {
  await initDB();
  await db.read();
  if (!db.data.scheduling_lookup) db.data.scheduling_lookup = [];
  if (!lookup.id) lookup.id = Date.now();
  db.data.scheduling_lookup.push(lookup);
  await db.write();
  return lookup;
};

export const updateSchedulingLookup = async (lookupData: any): Promise<any> => {
  await initDB();
  await db.read();
  if (!db.data.scheduling_lookup) db.data.scheduling_lookup = [];
  const { id, ...rest } = lookupData;
  const idx = db.data.scheduling_lookup.findIndex(s => s.id == id);
  if (idx === -1) throw new Error('Scheduling lookup not found');
  db.data.scheduling_lookup[idx] = { ...db.data.scheduling_lookup[idx], ...rest, id };
  await db.write();
  return db.data.scheduling_lookup[idx];
};

export const deleteSchedulingLookup = async (id: string): Promise<boolean> => {
  await initDB();
  await db.read();
  if (!db.data.scheduling_lookup) db.data.scheduling_lookup = [];
  const idx = db.data.scheduling_lookup.findIndex(s => s.id == id);
  if (idx === -1) return false;
  db.data.scheduling_lookup.splice(idx, 1);
  await db.write();
  return true;
};