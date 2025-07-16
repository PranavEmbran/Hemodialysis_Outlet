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
