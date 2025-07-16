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