import type { CaseOpening, Item, Patient, ScheduleAssigned } from '../db/lowdb.js';
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

// Fetch predialysis records from MSSQL
export const getPredialysisRecords = async (): Promise<any[]> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT * FROM PreDialysis_Records;
    `);
    return result.recordset.map((row: any) => ({
      id: row.id || row.ID || row.SA_ID_FK_PK,
      SA_ID_FK_PK: row.SA_ID_FK_PK,
      P_ID_FK: row.P_ID_FK,
      PreDR_Vitals_BP: row.PreDR_Vitals_BP,
      PreDR_Vitals_HeartRate: row.PreDR_Vitals_HeartRate,
      PreDR_Vitals_Temperature: row.PreDR_Vitals_Temperature,
      PreDR_Vitals_Weight: row.PreDR_Vitals_Weight,
      PreDR_Notes: row.PreDR_Notes,
    }));
  } catch (err) {
    console.error('MSSQL getPredialysisRecords error:', err);
    throw new Error('Failed to fetch predialysis records from MSSQL');
  }
};

// Fetch start dialysis records from MSSQL
export const getStartDialysisRecords = async (): Promise<any[]> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT * FROM StartDialysis_Records;
    `);
    return result.recordset.map((row: any) => ({
      id: row.id || row.ID || row.SA_ID_FK_PK,
      SA_ID_FK_PK: row.SA_ID_FK_PK,
      Dialysis_Unit: row.Dialysis_Unit,
      SDR_Start_time: row.SDR_Start_time,
      SDR_Vascular_access: row.SDR_Vascular_access,
      Dialyzer_Type: row.Dialyzer_Type,
      SDR_Notes: row.SDR_Notes,
      // Add any other fields as needed
    }));
  } catch (err) {
    console.error('MSSQL getStartDialysisRecords error:', err);
    throw new Error('Failed to fetch start dialysis records from MSSQL');
  }
};

// Fetch post dialysis records from MSSQL
export const getPostDialysisRecords = async (): Promise<any[]> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT * FROM PostDialysis_Records;
    `);
    return result.recordset.map((row: any) => ({
      id: row.id || row.ID || row.SA_ID_FK,
      SA_ID_FK: row.SA_ID_FK,
      P_ID_FK: row.P_ID_FK,
      PreDR_Vitals_BP: row.PreDR_Vitals_BP,
      PreDR_Vitals_HeartRate: row.PreDR_Vitals_HeartRate,
      PreDR_Vitals_Temperature: row.PreDR_Vitals_Temperature,
      PreDR_Vitals_Weight: row.PreDR_Vitals_Weight,
      PostDR_Notes: row.PostDR_Notes,
    }));
  } catch (err) {
    console.error('MSSQL getPostDialysisRecords error:', err);
    throw new Error('Failed to fetch post dialysis records from MSSQL');
  }
};

// Fetch in-process records from MSSQL
export const getInProcessRecords = async (): Promise<any[]> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT * FROM InProcess_Records;
    `);
    return result.recordset.map((row: any) => ({
      id: row.id || row.ID || row.SA_ID_FK_PK,
      SA_ID_FK_PK: row.SA_ID_FK_PK,
      // Example: adapt fields as per your schema
      rows: row.rows,
      // Add any other fields as needed
    }));
  } catch (err) {
    console.error('MSSQL getInProcessRecords error:', err);
    throw new Error('Failed to fetch in-process records from MSSQL');
  }
};

export const getSchedulesAssigned = async (): Promise<ScheduleAssigned[]> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT 
        SA_ID_PK,
        P_ID_FK,
        CONVERT(varchar, SA_Date, 23) as SA_Date,
        CONVERT(varchar, CAST(SA_Time AS TIME), 108) as SA_Time,
        isDeleted,
        Added_by,
        CONVERT(varchar, Added_on, 120) as Added_on,
        Modified_by,
        CONVERT(varchar, Modified_on, 120) as Modified_on,
        Provider_FK,
        Outlet_FK
      FROM Schedules_Assigned
      WHERE isDeleted = 0;
    `);
    return result.recordset;
  } catch (err) {
    console.error('MSSQL getSchedulesAssigned error:', err);
    throw new Error('Failed to fetch assigned schedules from MSSQL');
  }
};

export const addSchedulesAssigned = async (sessions: ScheduleAssigned[]): Promise<ScheduleAssigned[]> => {
  try {
    const pool = await sql.connect(config);
    
    // Start a transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      // Get the next available ID
      const idResult = await transaction.request()
        .query(`SELECT ISNULL(MAX(CAST(SUBSTRING(SA_ID_PK, 3, LEN(SA_ID_PK)) AS INT)), 0) + 1 as nextId FROM Schedules_Assigned`);
      
      let nextId = idResult.recordset[0].nextId;
      const newSessions = [];
      
      // Insert each session
      for (const session of sessions) {
        const sessionId = `SA${String(nextId).padStart(3, '0')}`;
        await transaction.request()
          .input('id', sql.VarChar, sessionId)
          .input('pId', sql.VarChar, session.P_ID_FK)
          .input('date', sql.Date, session.SA_Date)
          .input('time', sql.Time, session.SA_Time)
          .input('addedBy', sql.VarChar, session.Added_by || 'system')
          .input('providerFk', sql.VarChar, session.Provider_FK || null)
          .input('outletFk', sql.VarChar, session.Outlet_FK || null)
          .query(`
            INSERT INTO Schedules_Assigned 
            (SA_ID_PK, P_ID_FK, SA_Date, SA_Time, isDeleted, Added_by, Added_on, Modified_by, Modified_on, Provider_FK, Outlet_FK)
            VALUES (@id, @pId, @date, @time, 0, @addedBy, GETDATE(), @addedBy, GETDATE(), @providerFk, @outletFk)
          `);
        
        newSessions.push({
          ...session,
          SA_ID_PK: sessionId,
          isDeleted: 0,
          Added_on: new Date().toISOString(),
          Modified_on: new Date().toISOString()
        });
        nextId++;
      }
      
      await transaction.commit();
      return newSessions;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('MSSQL addSchedulesAssigned error:', err);
    throw new Error('Failed to add schedules to MSSQL');
  }
};

export const getCaseOpenings = async (): Promise<CaseOpening[]> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT 
        HCO_ID_PK,
        P_ID_FK,
        HCO_Blood_Group,
        HCO_Case_nature
      FROM HD_Case_Opening;
    `);
    return result.recordset;
  } catch (err) {
    console.error('MSSQL getCaseOpenings error:', err);
    throw new Error('Failed to fetch case openings from MSSQL');
  }
};

export const addCaseOpening = async (caseOpening: CaseOpening): Promise<CaseOpening> => {
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('hcoId', sql.VarChar, caseOpening.HCO_ID_PK)
      .input('pId', sql.VarChar, caseOpening.P_ID_FK)
      .input('bloodGroup', sql.VarChar, caseOpening.HCO_Blood_Group)
      .input('caseNature', sql.VarChar, caseOpening.HCO_Case_nature)
      .query(`
        INSERT INTO HD_Case_Opening 
        (HCO_ID_PK, P_ID_FK, HCO_Blood_Group, HCO_Case_nature)
        VALUES (@hcoId, @pId, @bloodGroup, @caseNature);
      `);
    
    return caseOpening;
  } catch (err) {
    console.error('MSSQL addCaseOpening error:', err);
    throw new Error('Failed to add case opening to MSSQL');
  }
};