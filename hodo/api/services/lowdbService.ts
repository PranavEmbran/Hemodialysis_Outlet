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