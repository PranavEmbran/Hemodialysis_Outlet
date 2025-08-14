import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
// ✅ Default data structure
const defaultData = {
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
const adapter = new JSONFile(new URL('./db.json', import.meta.url));
const db = new Low(adapter, defaultData);
export const initDB = async () => {
    await db.read();
    db.data ||= defaultData; // Fallback if db.json is empty
    await db.write();
};
export default db;
