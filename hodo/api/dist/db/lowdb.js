import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
// ✅ Default data structure
const defaultData = {
    items: [],
    patients_derived: [],
    Schedules_Assigned: [],
    case_openings: [],
    predialysis_records: [],
    start_dialysis_records: [],
    InProcess_records: [],
    post_dialysis_records: [],
    units: [],
    vascular_access: [],
    dialyzer_types: [],
    scheduling_lookup: []
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
