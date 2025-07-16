import type { Item } from '../db/lowdb.js';
import type { Patient } from '../db/lowdb.js';
import type { ScheduleAssigned } from '../db/lowdb.js';

export const getData = async (): Promise<Item[]> => {
  // TODO: Implement MSSQL logic
  throw new Error('MSSQL service not implemented yet');
};

export const addData = async (item: Omit<Item, 'id'>): Promise<Item> => {
  // TODO: Implement MSSQL logic
  throw new Error('MSSQL service not implemented yet');
};

export const deleteData = async (id: string): Promise<boolean> => {
  // TODO: Implement MSSQL logic
  throw new Error('MSSQL service not implemented yet');
};

export const getPatientsDerived = async (): Promise<Patient[]> => {
  // TODO: Implement MSSQL logic
  throw new Error('MSSQL service not implemented yet');
};

export const getSchedulesAssigned = async (): Promise<ScheduleAssigned[]> => {
  // TODO: Implement MSSQL logic
  throw new Error('MSSQL service not implemented yet');
};

export const addSchedulesAssigned = async (sessions: ScheduleAssigned[]): Promise<ScheduleAssigned[]> => {
  // TODO: Implement MSSQL logic
  throw new Error('MSSQL service not implemented yet');
};