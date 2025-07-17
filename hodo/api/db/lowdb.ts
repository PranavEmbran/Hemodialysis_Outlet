import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

export interface Item {
  id: string;
  name: string;
  value: number;
}

export interface DBData {
  items: Item[];
  patients_derived: Patient[];
  Schedules_Assigned: ScheduleAssigned[];
  case_openings: CaseOpening[];
}

export interface Patient {
  id: string;
  Name: string;
}

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

export interface CaseOpening {
  HCO_ID_PK: string;
  P_ID_FK: string;
  HCO_Blood_Group: string;
  HCO_Case_nature: string;
}

// ✅ Default data structure
const defaultData: DBData = { items: [], patients_derived: [], Schedules_Assigned: [], case_openings: [] };

// ✅ Pass both adapter and defaultData
const adapter = new JSONFile<DBData>(new URL('./db.json', import.meta.url));
const db = new Low<DBData>(adapter, defaultData);

export const initDB = async () => {
  await db.read();
  db.data ||= defaultData; // Fallback if db.json is empty
  await db.write();
};

export default db;
