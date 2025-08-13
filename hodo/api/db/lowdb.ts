import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import type { PredialysisRecord, StartDialysisRecord, InProcessRecord, PostDialysisRecord } from '../services/lowdbService.js';

export interface Item {
  id: string;
  name: string;
  value: number;
}

export interface DBData {
  items: Item[];
  patients_derived: Patient[];
  Dialysis_Schedules: DialysisSchedules[];
  case_openings: CaseOpening[];
  predialysis_records: PredialysisRecord[];
  start_dialysis_records: StartDialysisRecord[];
  InProcess_records: InProcessRecord[];
  post_dialysis_records: PostDialysisRecord[];
  units: any[];
  vascular_access: any[];
  dialyzer_types: any[];
  scheduling_lookup: any[];
  session_times: any[];
}

export interface Patient {
  id: string;
  Name: string;
}

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

export interface CaseOpening {
  DCO_ID_PK?: string | number; // optional for creation, set by DB
  DCO_P_ID_FK: string | number;
  DCO_Blood_Group?: string | null;
  DCO_Case_Nature?: string | null;
}

// ✅ Default data structure
const defaultData: DBData = {
  items: [],
  patients_derived: [],
  Dialysis_Schedules: [],
  case_openings: [],
  predialysis_records: [],
  start_dialysis_records: [],
  InProcess_records: [],
  post_dialysis_records: [],
  units: [],
  vascular_access: [],
  dialyzer_types: [],
  scheduling_lookup: [],
  session_times: [
    { ST_ID_PK: 1, ST_Session_Name: '1st', ST_Start_Time: '08:00' },
    { ST_ID_PK: 2, ST_Session_Name: '2nd', ST_Start_Time: '12:00' },
    { ST_ID_PK: 3, ST_Session_Name: '3rd', ST_Start_Time: '16:00' }
  ]
};

// ✅ Pass both adapter and defaultData
const adapter = new JSONFile<DBData>(new URL('./db.json', import.meta.url));
const db = new Low<DBData>(adapter, defaultData);

export const initDB = async () => {
  await db.read();
  db.data ||= defaultData; // Fallback if db.json is empty
  await db.write();
};

export default db;
