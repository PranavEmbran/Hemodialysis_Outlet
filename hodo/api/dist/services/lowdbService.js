import db, { initDB } from '../db/lowdb.js';
import { nanoid } from 'nanoid';
export const getData = async () => {
    await initDB();
    await db.read();
    return db.data?.items || [];
};
export const addData = async (item) => {
    await initDB();
    await db.read();
    const newItem = { id: nanoid(), ...item };
    db.data.items.push(newItem);
    await db.write();
    return newItem;
};
export const deleteData = async (id) => {
    await initDB();
    await db.read();
    const prevLen = db.data.items.length;
    db.data.items = db.data.items.filter(item => item.id !== id);
    const changed = db.data.items.length < prevLen;
    if (changed)
        await db.write();
    return changed;
};
export const getPatientsDerived = async () => {
    await initDB();
    await db.read();
    // @ts-ignore
    return db.data?.patients_derived || [];
};
export const getSchedulesAssigned = async () => {
    await initDB();
    await db.read();
    // @ts-ignore
    return db.data?.Schedules_Assigned || [];
};
export const addSchedulesAssigned = async (sessions) => {
    await initDB();
    await db.read();
    // @ts-ignore
    const existing = db.data.Schedules_Assigned || [];
    // Find the max numeric part of existing SA_ID_PK
    let maxNum = 0;
    for (const s of existing) {
        const match = typeof s.SA_ID_PK === 'string' && s.SA_ID_PK.match(/^SA(\d{3,})$/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum)
                maxNum = num;
        }
    }
    // Assign new IDs
    const newSessions = sessions.map((session, idx) => ({
        ...session,
        SA_ID_PK: `SA${String(maxNum + idx + 1).padStart(3, '0')}`
    }));
    db.data.Schedules_Assigned = [...existing, ...newSessions];
    await db.write();
    return db.data.Schedules_Assigned;
};
export const getCaseOpenings = async () => {
    await initDB();
    await db.read();
    // @ts-ignore
    return db.data?.case_openings || [];
};
export const addCaseOpening = async (caseOpening) => {
    await initDB();
    await db.read();
    db.data.case_openings.push(caseOpening);
    await db.write();
    return caseOpening;
};
export const addPredialysisRecord = async (record) => {
    await initDB();
    await db.read();
    if (!db.data.predialysis_records)
        db.data.predialysis_records = [];
    // Optionally add an id
    const newRecord = { id: nanoid(), ...record };
    db.data.predialysis_records.push(newRecord);
    await db.write();
    return newRecord;
};
export const addStartDialysisRecord = async (record) => {
    await initDB();
    await db.read();
    if (!db.data.start_dialysis_records)
        db.data.start_dialysis_records = [];
    const newRecord = { id: nanoid(), ...record };
    db.data.start_dialysis_records.push(newRecord);
    await db.write();
    return newRecord;
};
export const addInProcessRecord = async (record) => {
    await initDB();
    await db.read();
    if (!db.data.InProcess_records)
        db.data.InProcess_records = [];
    const newRecord = { id: nanoid(), ...record };
    db.data.InProcess_records.push(newRecord);
    await db.write();
    return newRecord;
};
export const addPostDialysisRecord = async (record) => {
    await initDB();
    await db.read();
    if (!db.data.post_dialysis_records)
        db.data.post_dialysis_records = [];
    const newRecord = { id: nanoid(), ...record };
    db.data.post_dialysis_records.push(newRecord);
    await db.write();
    return newRecord;
};
