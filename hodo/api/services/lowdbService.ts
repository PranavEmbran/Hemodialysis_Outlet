import db, { initDB, Item } from '../db/lowdb.js';
import { nanoid } from 'nanoid';
import type { CaseOpening } from '../db/lowdb';

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

// Placeholder functions for compatibility with MSSQL service
export const searchPatients = async (searchTerm: string, limit: number = 20): Promise<Patient[]> => {
  const patients = await getPatientsDerived();
  const searchLower = searchTerm.toLowerCase();
  
  return patients.filter(p => {
    // Search by patient ID
    const idMatch = p.id.toString().toLowerCase().includes(searchLower);
    // Search by patient name
    const nameMatch = p.Name.toLowerCase().includes(searchLower);
    
    return idMatch || nameMatch;
  })
  .sort((a, b) => {
    // Prioritize exact ID matches, then ID starts with, then name matches
    const aIdExact = a.id.toString().toLowerCase() === searchLower;
    const bIdExact = b.id.toString().toLowerCase() === searchLower;
    if (aIdExact && !bIdExact) return -1;
    if (!aIdExact && bIdExact) return 1;
    
    const aIdStarts = a.id.toString().toLowerCase().startsWith(searchLower);
    const bIdStarts = b.id.toString().toLowerCase().startsWith(searchLower);
    if (aIdStarts && !bIdStarts) return -1;
    if (!aIdStarts && bIdStarts) return 1;
    
    return a.Name.localeCompare(b.Name);
  })
  .slice(0, limit);
};

export const getPatientsPage = async (page: number = 1, pageSize: number = 50): Promise<{patients: Patient[], totalCount: number, hasMore: boolean}> => {
  const patients = await getPatientsDerived();
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPatients = patients.slice(startIndex, endIndex);
  
  return {
    patients: paginatedPatients,
    totalCount: patients.length,
    hasMore: endIndex < patients.length
  };
};

export interface DialysisSchedules {
  DS_ID_PK: string;
  DS_P_ID_FK: string;
  DS_Date: string;
  DS_Time: string;
  DS_Status: number;
  DS_Added_by: string;
  DS_Added_on: string;
  DS_Modified_by: string;
  DS_Modified_on: string;
  DS_Provider_FK: string;
  DS_Outlet_FK: string;
}

// export const getSchedulesAssigned = async (): Promise<DialysisSchedules[]> => {
//   await initDB();
//   await db.read();
//   // @ts-ignore
//   const arr = db.data?.Dialysis_Schedules || [];
//   return arr.map((item: any) => ({
//     DS_ID_PK: item.DS_ID_PK ?? "",
//     DS_P_ID_FK: item.DS_P_ID_FK ?? "",
//     DS_Date: item.DS_Date ?? "",
//     DS_Time: item.DS_Time ?? "",
//     DS_Status: item.DS_Status ?? 0,
//     DS_Added_by: item.DS_Added_by ?? "",
//     DS_Added_on: item.DS_Added_on ?? "",
//     DS_Modified_by: item.DS_Modified_by ?? "",
//     DS_Modified_on: item.DS_Modified_on ?? "",
//     DS_Provider_FK: item.DS_Provider_FK ?? "",
//     DS_Outlet_FK: item.DS_Outlet_FK ?? "",
//   }));
// };
export const getSchedulesAssigned = async (): Promise<DialysisSchedules[]> => {
  await initDB();
  await db.read();
  // @ts-ignore
  const arr = db.data?.Dialysis_Schedules || [];
  return arr.map((item: any) => ({
    DS_ID_PK: item.DS_ID_PK ?? "",
    // Map DS_P_ID_FK from either DS_P_ID_FK or P_ID_FK for compatibility
    DS_P_ID_FK: item.DS_P_ID_FK ?? item.P_ID_FK ?? "",
    DS_Date: item.DS_Date ?? "",
    DS_Time: item.DS_Time ?? "",
    DS_Status: item.DS_Status ?? item.Status ?? 0,
    DS_Added_by: item.DS_Added_by ?? item.Added_by ?? "",
    DS_Added_on: item.DS_Added_on ?? item.Added_on ?? "",
    DS_Modified_by: item.DS_Modified_by ?? item.Modified_by ?? "",
    DS_Modified_on: item.DS_Modified_on ?? item.Modified_on ?? "",
    DS_Provider_FK: item.DS_Provider_FK ?? item.Provider_FK ?? "",
    DS_Outlet_FK: item.DS_Outlet_FK ?? item.Outlet_FK ?? "",
  }));
};


export const addSchedulesAssigned = async (sessions: DialysisSchedules[]): Promise<DialysisSchedules[]> => {
  await initDB();
  await db.read();
  // @ts-ignore
  const existing = db.data!.Dialysis_Schedules || [];
  // Find the max numeric part of existing DS_ID_PK
  let maxNum = 0;
  for (const s of existing) {
    const match = typeof s.DS_ID_PK === 'string' && s.DS_ID_PK.match(/^SA(\d{3,})$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  // Assign new IDs
  const newSessions = sessions.map((session, idx) => ({
    ...session,
    DS_ID_PK: `SA${String(maxNum + idx + 1).padStart(3, '0')}`
  }));
  db.data!.Dialysis_Schedules = [...existing, ...newSessions];
  await db.write();
  return db.data!.Dialysis_Schedules;
};

// export interface CaseOpening {
//   DCO_ID_PK: string;
//   P_ID_FK: string;
//   DCO_Blood_Group: string;
//   DCO_Case_nature: string;
// }

export const getCaseOpenings = async (): Promise<CaseOpening[]> => {
  await initDB();
  await db.read();
  // @ts-ignore
  return db.data?.case_openings || [];
};

export const addCaseOpening = async (caseOpening: Partial<CaseOpening>): Promise<CaseOpening> => {
  await initDB();
  await db.read();
  // Validate presence of required fields
  const { DCO_P_ID_FK, DCO_Blood_Group, DCO_Case_Nature } = caseOpening;
  if (DCO_P_ID_FK === undefined || DCO_Blood_Group === undefined || DCO_Case_Nature === undefined) {
    throw new Error('Missing required fields: DCO_P_ID_FK, DCO_Blood_Group, DCO_Case_Nature');
  }
  // Only allow these fields
  const newCaseOpening = {
    DCO_P_ID_FK,
    DCO_Blood_Group,
    DCO_Case_Nature
  };
  db.data!.case_openings.push(newCaseOpening);
  await db.write();
  return newCaseOpening as CaseOpening;
};

// Update a case opening by DCO_ID_PK
export const updateCaseOpening = async (caseOpening: Partial<CaseOpening> & { DCO_ID_PK: string | number, DCO_P_ID_FK: string | number }): Promise<CaseOpening> => {
  await initDB();
  await db.read();
  if (!db.data!.case_openings) db.data!.case_openings = [];
  const { DCO_ID_PK, DCO_P_ID_FK, ...rest } = caseOpening;
  const idx = db.data!.case_openings.findIndex((c: any) => c.DCO_ID_PK == DCO_ID_PK && c.DCO_P_ID_FK == DCO_P_ID_FK);
  if (idx === -1) throw new Error('Case opening not found');
  db.data!.case_openings[idx] = { ...db.data!.case_openings[idx], ...rest, DCO_ID_PK, DCO_P_ID_FK };
  await db.write();
  return db.data!.case_openings[idx];
};

export interface PredialysisRecord {
  PreDR_ID_PK: string; // primary key
  SA_ID_PK_FK: string;
  P_ID_FK: string;
  PreDR_Vitals_BP: string;
  PreDR_Vitals_HeartRate: string;
  PreDR_Vitals_Temperature: string;
  PreDR_Vitals_Weight: string;
  PreDR_Notes: string;
  PreDR_Status?: number;
}

export const addPredialysisRecord = async (record: Omit<PredialysisRecord, 'PreDR_ID_PK'> & { PreDR_ID_PK?: string }): Promise<PredialysisRecord> => {
  await initDB();
  await db.read();
  if (!db.data!.predialysis_records) db.data!.predialysis_records = [];
  // Generate PreDR_ID_PK if not provided
  const newRecord: PredialysisRecord = { PreDR_ID_PK: record.PreDR_ID_PK || nanoid(), ...record };
  // Remove id field if present
  // @ts-ignore
  delete newRecord.id;
  db.data!.predialysis_records.push(newRecord);
  await db.write();
  return newRecord;
};

export interface StartDialysisRecord {
  SA_ID_PK_FK: string;
  Dialysis_Unit: string;
  SDR_Start_time: string;
  SDR_Vascular_access: string;
  Dialyzer_Type: string;
  SDR_Notes: string;
  SDR_Status?: number;
  SDR_ID_PK?: string;
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
  SA_ID_PK_FK: string;
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
  PostDR_Status?: number;
  PostDR_ID_PK?: string;
}

export const addPostDialysisRecord = async (record: PostDialysisRecord): Promise<PostDialysisRecord> => {
  await initDB();
  await db.read();
  if (!db.data.post_dialysis_records) db.data.post_dialysis_records = [];
  db.data.post_dialysis_records.push(record);
  await db.write();
  return record;
};

// Get functions for records
export const getPredialysisRecords = async (): Promise<any[]> => {
  await initDB();
  await db.read();
  return db.data?.predialysis_records?.filter((r: any) => r.PreDR_Status !== 0) || [];
};

export const getStartDialysisRecords = async (): Promise<any[]> => {
  await initDB();
  await db.read();
  return db.data?.start_dialysis_records?.filter((r: any) => r.SDR_Status !== 0) || [];
};

export const getPostDialysisRecords = async (): Promise<any[]> => {
  await initDB();
  await db.read();
  return db.data?.post_dialysis_records?.filter((r: any) => r.PostDR_Status !== 0) || [];
};

export const getInProcessRecords = async (): Promise<any[]> => {
  await initDB();
  await db.read();
  return db.data?.InProcess_records || [];
};

// Update functions for lowdb
export const updatePredialysisRecord = async (record: any) => {
  await initDB();
  await db.read();
  const { PreDR_ID_PK, deleted, ...rest } = record;
  
  if (!db.data.predialysis_records) db.data.predialysis_records = [];
  const idx = db.data.predialysis_records.findIndex((r: any) => r.PreDR_ID_PK === PreDR_ID_PK);
  
  if (idx === -1) {
    throw new Error('Record not found');
  }

  if (deleted === true) {
    // Soft delete by setting status to 0
    db.data.predialysis_records[idx] = { 
      ...db.data.predialysis_records[idx], 
      PreDR_Status: 0 
    };
  } else {
    // Update other fields
    db.data.predialysis_records[idx] = { 
      ...db.data.predialysis_records[idx], 
      ...rest, 
      PreDR_ID_PK 
    };
  }
  
  await db.write();
  return { success: true };
};

export const updateStartDialysisRecord = async (record: any) => {
  await initDB();
  await db.read();
  const { SDR_ID_PK, deleted, ...rest } = record;
  
  if (!db.data.start_dialysis_records) db.data.start_dialysis_records = [];
  const idx = db.data.start_dialysis_records.findIndex((r: any) => r.SDR_ID_PK === SDR_ID_PK);
  
  if (idx === -1) {
    throw new Error('Record not found');
  }

  if (deleted === true) {
    // Soft delete by setting status to 0
    db.data.start_dialysis_records[idx] = { 
      ...db.data.start_dialysis_records[idx], 
      SDR_Status: 0 
    };
  } else {
    // Update other fields
    db.data.start_dialysis_records[idx] = { 
      ...db.data.start_dialysis_records[idx], 
      ...rest, 
      SDR_ID_PK 
    };
  }
  
  await db.write();
  return { success: true };
};

export const updatePostDialysisRecord = async (record: any) => {
  await initDB();
  await db.read();
  const { PostDR_ID_PK, deleted, ...rest } = record;
  
  if (!db.data.post_dialysis_records) db.data.post_dialysis_records = [];
  const idx = db.data.post_dialysis_records.findIndex((r: any) => r.PostDR_ID_PK === PostDR_ID_PK);
  
  if (idx === -1) {
    throw new Error('Record not found');
  }

  if (deleted === true) {
    // Soft delete by setting status to 0
    db.data.post_dialysis_records[idx] = { 
      ...db.data.post_dialysis_records[idx], 
      PostDR_Status: 0 
    };
  } else {
    // Update other fields
    db.data.post_dialysis_records[idx] = { 
      ...db.data.post_dialysis_records[idx], 
      ...rest, 
      PostDR_ID_PK 
    };
  }
  
  await db.write();
  return { success: true };
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

// --- Session Times Lookup Functions ---
export const getSessionTimes = async (): Promise<any[]> => {
  await initDB();
  await db.read();
  return db.data?.session_times || [];
};

export const addSessionTime = async (sessionTime: any): Promise<any> => {
  await initDB();
  await db.read();
  if (!db.data.session_times) db.data.session_times = [];
  if (!sessionTime.ST_ID_PK) sessionTime.ST_ID_PK = Date.now();
  db.data.session_times.push(sessionTime);
  await db.write();
  return sessionTime;
};

export const updateSessionTime = async (sessionTimeData: any): Promise<any> => {
  await initDB();
  await db.read();
  if (!db.data.session_times) db.data.session_times = [];
  const { ST_ID_PK, ...rest } = sessionTimeData;
  const idx = db.data.session_times.findIndex((st: any) => st.ST_ID_PK == ST_ID_PK);
  if (idx === -1) throw new Error('Session time not found');
  db.data.session_times[idx] = { ...db.data.session_times[idx], ...rest, ST_ID_PK };
  await db.write();
  return db.data.session_times[idx];
};

export const deleteSessionTime = async (id: string): Promise<boolean> => {
  await initDB();
  await db.read();
  if (!db.data.session_times) db.data.session_times = [];
  const idx = db.data.session_times.findIndex((st: any) => st.ST_ID_PK == id);
  if (idx === -1) return false;
  db.data.session_times.splice(idx, 1);
  await db.write();
  return true;
};

// --- Dialysis Schedules Functions ---
export const updateDialysisScheduleStatus = async (scheduleId: string, status: number): Promise<any> => {
  await initDB();
  await db.read();
  if (!db.data.Dialysis_Schedules) db.data.Dialysis_Schedules = [];
  const idx = db.data.Dialysis_Schedules.findIndex((ds: any) => ds.DS_ID_PK == scheduleId);
  if (idx === -1) throw new Error('Schedule not found');
  db.data.Dialysis_Schedules[idx].DS_Status = status;
  db.data.Dialysis_Schedules[idx].DS_Modified_on = new Date().toISOString();
  await db.write();
  return db.data.Dialysis_Schedules[idx];
};

export const checkScheduleConflict = async (date: string, time: string, unitId?: string): Promise<boolean> => {
  await initDB();
  await db.read();
  if (!db.data.Dialysis_Schedules) return false;
  const conflict = db.data.Dialysis_Schedules.some((ds: any) => 
    ds.DS_Date === date && 
    ds.DS_Time === time && 
    ds.DS_Status === 10
  );
  return conflict;
};

export const getScheduleWithRelatedRecords = async (scheduleId?: string): Promise<any[]> => {
  await initDB();
  await db.read();
  
  const schedules = scheduleId 
    ? db.data.Dialysis_Schedules?.filter((ds: any) => ds.DS_ID_PK == scheduleId) || []
    : db.data.Dialysis_Schedules || [];
  
  const predialysisRecords = db.data.predialysis_records || [];
  const startDialysisRecords = db.data.start_dialysis_records || [];
  const postDialysisRecords = db.data.post_dialysis_records || [];
  
  console.log('LowDB - Schedules found:', schedules.length);
  console.log('LowDB - Sample schedule:', schedules[0]);
  
  return schedules.map((ds: any) => {
    const hasPredialysis = predialysisRecords.some((pdr: any) => 
      pdr.PreDR_DS_ID_FK == ds.DS_ID_PK && pdr.PreDR_Status !== 0
    );
    const hasStartDialysis = startDialysisRecords.some((sdr: any) => 
      sdr.SDR_DS_ID_FK == ds.DS_ID_PK && sdr.SDR_Status !== 0
    );
    const hasPostDialysis = postDialysisRecords.some((podr: any) => 
      podr.PostDR_DS_ID_FK == ds.DS_ID_PK && podr.PostDR_Status !== 0
    );
    
    let computed_status = 'Scheduled';
    if (ds.DS_Status === 0) {
      computed_status = 'Cancelled';
    } else if (hasPredialysis && hasStartDialysis && hasPostDialysis) {
      computed_status = 'Completed';
    } else if (hasPredialysis && hasStartDialysis) {
      computed_status = 'Initiated';
    } else if (hasPredialysis) {
      computed_status = 'Arrived';
    } else if (new Date(ds.DS_Date) < new Date() && ds.DS_Status === 10) {
      computed_status = 'Missed';
    }
    
    const result = {
      ...ds,
      computed_status,
      has_predialysis: hasPredialysis ? 1 : null,
      has_start_dialysis: hasStartDialysis ? 1 : null,
      has_post_dialysis: hasPostDialysis ? 1 : null
    };
    
    console.log('LowDB - Computed status for schedule', ds.DS_ID_PK, ':', computed_status, 'DS_Status:', ds.DS_Status);
    
    return result;
  });
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