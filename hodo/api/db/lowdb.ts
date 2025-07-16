import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

export interface Item {
  id: string;
  name: string;
  value: number;
}

export interface DBData {
  items: Item[];
}

export interface Patient {
  id: string;
  Name: string;
}

// ✅ Default data structure
const defaultData: DBData = { items: [] };

// ✅ Pass both adapter and defaultData
const adapter = new JSONFile<DBData>(new URL('./db.json', import.meta.url));
const db = new Low<DBData>(adapter, defaultData);

export const initDB = async () => {
  await db.read();
  db.data ||= defaultData; // Fallback if db.json is empty
  await db.write();
};

export default db;
