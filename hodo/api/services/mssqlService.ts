import type { Item } from '../db/lowdb.js';
import type { Patient } from '../db/lowdb.js';
import type { ScheduleAssigned } from '../db/lowdb.js';
import sql from 'mssql';

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const config = {
  user: getEnv('MSSQL_USER'),
  password: getEnv('MSSQL_PASSWORD'),
  server: getEnv('MSSQL_SERVER'),
  database: getEnv('MSSQL_DATABASE'),
  port: parseInt(process.env.MSSQL_PORT || '1433', 10),
  options: {
    encrypt: false, // Set to true if using Azure
    trustServerCertificate: true,
  },
};

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
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT TOP 10
        PM_Card_PK,
        PM_FirstName + ISNULL(' ' + PM_MiddleName, '') + ISNULL(' ' + PM_LastName, '') AS P_Name
      FROM PAT_Patient_Master_1;
    `);
    return result.recordset.map((row: any) => ({
      id: row.PM_Card_PK,
      Name: row.P_Name,
    }));
  } catch (err) {
    console.error('MSSQL getPatientsDerived error:', err);
    throw new Error('Failed to fetch patients from MSSQL');
  }
};

export const getSchedulesAssigned = async (): Promise<ScheduleAssigned[]> => {
  // TODO: Implement MSSQL logic
  throw new Error('MSSQL service not implemented yet');
};

export const addSchedulesAssigned = async (sessions: ScheduleAssigned[]): Promise<ScheduleAssigned[]> => {
  // TODO: Implement MSSQL logic
  throw new Error('MSSQL service not implemented yet');
};