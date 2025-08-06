import type { CaseOpening, Item, Patient, DialysisSchedules } from '../db/lowdb.js';
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
      SELECT TOP 25
        PM_Card_PK,
        PM_FirstName + ISNULL(' ' + PM_MiddleName, '') + ISNULL(' ' + PM_LastName, '') AS P_Name
      FROM PAT_Patient_Master_1
      ORDER BY PM_LastModifiedOn DESC;
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
      SELECT
  pr.*,
  ds.DS_Date,
  ds.DS_Time
FROM dbo.PreDialysis_Records pr
LEFT JOIN dbo.Dialysis_Schedules ds
  ON pr.PreDR_DS_ID_FK = ds.DS_ID_PK;

    `);
    // console.log(result.recordset);
    return result.recordset.map((row: any) => ({
      
      PreDR_ID_PK: row.PreDR_ID_PK || row.ID || row.SA_ID_PK_FK,
      PreDR_DS_ID_FK: row.PreDR_DS_ID_FK,
      PreDR_P_ID_FK: row.PreDR_P_ID_FK,
      PreDR_Vitals_BP: row.PreDR_Vitals_BP,
      PreDR_Vitals_HeartRate: row.PreDR_Vitals_HeartRate,
      PreDR_Vitals_Temperature: row.PreDR_Vitals_Temperature,
      PreDR_Vitals_Weight: row.PreDR_Vitals_Weight,
      PreDR_Notes: row.PreDR_Notes,
      date: row.DS_Date
      ? row.DS_Date.toISOString().split('T')[0]
      : null,
    time: row.DS_Time
      ? row.DS_Time.toISOString().substring(11, 16) // "HH:mm"
      : null,
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
   SELECT
  sdr.SDR_ID_PK,
  sdr.SDR_DS_ID_FK,
  sdr.SDR_Dialysis_Unit,
  sdr.SDR_Start_Time,
  sdr.SDR_Vascular_Access,
  sdr.SDR_Dialyzer_Type,
  sdr.SDR_Notes,
  ds.DS_Date,
  ds.DS_Time,
  p.PM_FirstName + ISNULL(' ' + p.PM_MiddleName, '') + ISNULL(' ' + p.PM_LastName, '') AS P_Name
FROM dbo.Start_Dialysis_Records sdr
LEFT JOIN dbo.Dialysis_Schedules ds
  ON sdr.SDR_DS_ID_FK = ds.DS_ID_PK
LEFT JOIN dbo.PAT_Patient_Master_1 p
  ON sdr.SDR_P_ID_FK = p.PM_Card_PK
WHERE sdr.SDR_Status = 10;


    `);

    console.log('getStartDialysisRecords_Record:', result.recordset);
    return result.recordset.map((row: any) => ({
      SDR_ID_PK: row.SDR_ID_PK,
      SA_ID_PK_FK: row.SDR_DS_ID_FK,
      name: row.PatientName,
      SDR_Dialysis_Unit: row.SDR_Dialysis_Unit,
      SDR_Start_Time: row.SDR_Start_Time,
      SDR_Vascular_Access: row.SDR_Vascular_Access,
      SDR_Dialyzer_Type: row.SDR_Dialyzer_Type,
      SDR_Notes: row.SDR_Notes,
      // date: row.DS_Date ? row.DS_Date.toISOString().split('T')[0] : null,
      // time: row.DS_Time ? row.DS_Time.toISOString().substring(11, 16) : null,
    }));
  } catch (err: any) {
    console.error('MSSQL getStartDialysisRecords error:', err.message || err);
    throw new Error('Failed to fetch start dialysis records from MSSQL');
  }
};


// Fetch post dialysis records from MSSQL
export const getPostDialysisRecords = async (): Promise<any[]> => {
  try {
    const pool = await sql.connect(config);
    // const result = await pool.request().query(`
    //   SELECT * FROM PostDialysis_Records;
    // `);
    const result = await pool.request().query(`

      SELECT
      pr.*,
      ds.DS_Date,
      ds.DS_Time
    FROM dbo.PostDialysis_Records pr
    LEFT JOIN dbo.Dialysis_Schedules ds
      ON pr.PostDR_DS_ID_FK = ds.DS_ID_PK;

      `);
    return result.recordset.map((row: any) => ({
      PostDR_ID_PK: row.id || row.ID || row.SA_ID_FK,
      PostDR_DS_ID_FK: row.PostDR_DS_ID_FK,
      PostDR_P_ID_FK: row.PostDR_P_ID_FK,
      PostDR_Vitals_BP: row.PostDR_Vitals_BP,
      PostDR_Vitals_HeartRate: row.PostDR_Vitals_HeartRate,
      PostDR_Vitals_Temperature: row.PostDR_Vitals_Temperature,
      PostDR_Vitals_Weight: row.PostDR_Vitals_Weight,
      PostDR_Notes: row.PostDR_Notes,
      date: row.DS_Date
      ? row.DS_Date.toISOString().split('T')[0]
      : null,
    time: row.DS_Time
      ? row.DS_Time.toISOString().substring(11, 16) // "HH:mm"
      : null,
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
      id: row.id || row.ID || row.SA_ID_PK_FK,
      SA_ID_PK_FK: row.SA_ID_PK_FK,
      // Example: adapt fields as per your schema
      rows: row.rows,
      // Add any other fields as needed
    }));
  } catch (err) {
    console.error('MSSQL getInProcessRecords error:', err);
    throw new Error('Failed to fetch in-process records from MSSQL');
  }
};

export const getSchedulesAssigned = async (): Promise<DialysisSchedules[]> => {
  try {
    const pool = await sql.connect(config);
    // const result = await pool.request().query(`
    //   SELECT * FROM Dialysis_Schedules;

    // `);
    const result = await pool.request().query(`
     SELECT 
        DS_ID_PK,
        DS_P_ID_FK,
        CONVERT(VARCHAR, DS_Date, 23) AS DS_Date,
        CONVERT(VARCHAR, DS_Time, 108) AS DS_Time,
        DS_Status,
        DS_Added_By,
        REPLACE(CONVERT(VARCHAR, DS_Added_On, 120), ' ', 'T') AS DS_Added_on,
        DS_Modified_By,
        REPLACE(CONVERT(VARCHAR, DS_Modified_On, 120), ' ', 'T') AS DS_Modified_on,
        DS_Provider_FK,
        DS_Outlet_FK,
        PM.PM_FirstName + 
          ISNULL(' ' + PM.PM_MiddleName, '') + 
          ISNULL(' ' + PM.PM_LastName, '') AS PatientName
      FROM 
        Dialysis_Schedules DS
      JOIN 
        PAT_Patient_Master_1 PM ON PM.PM_Card_PK = DS.DS_P_ID_FK
      WHERE DS_Status = 10
      ORDER BY DS_Date DESC, DS_Time DESC;

    `);

    //************************************************** */
    //************************************************** */
    // Why 'T' is required for the UI:
    // JavaScript’s Date constructor (and new Date(...)) expects ISO 8601 format, which looks like:

    // ts
    // Copy
    // Edit
    // '2025-07-31T14:30:00' // ✅ Valid
    // '2025-07-31 14:30:00' // ❌ Invalid or inconsistent in many browsers
    // Without the 'T', some browsers treat the date-time string as invalid, or even assume it’s in UTC, which may:

    // lead to incorrect rendering,

    // or fail entirely (e.g., Invalid Date).
    //************************************************** */
    //************************************************** */



    return result.recordset;
  } catch (err) {
    console.error('MSSQL getSchedulesAssigned error:', err);
    throw new Error('Failed to fetch assigned schedules from MSSQL');
  }
};

export const addSchedulesAssigned = async (sessions: DialysisSchedules[]): Promise<DialysisSchedules[]> => {
  try {
    const pool = await sql.connect(config);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const newSessions = [];
      // Transform and validate payload to match MSSQL schema
      for (const session of sessions) {

        const DS_P_ID_FK = Number(session.DS_P_ID_FK);
        const DS_Date = session.DS_Date;
        const DS_Time = session.DS_Time;
        const DS_Status = typeof session.DS_Status === 'number' ? session.DS_Status : 10;

        const DS_Added_by = session.DS_Added_by !== null ? Number(session.DS_Added_by) : null;
        const DS_Modified_by = session.DS_Modified_by !== null ? Number(session.DS_Modified_by) : null;

        const DS_Added_On = session.DS_Added_on ?? null;
        const DS_Modified_On = session.DS_Modified_on ?? null;

        const DS_Provider_FK = session.DS_Provider_FK !== null ? Number(session.DS_Provider_FK) : null;
        const DS_Outlet_FK = session.DS_Outlet_FK !== null ? Number(session.DS_Outlet_FK) : null;


        // Map/convert fields for MSSQL
        // const DS_P_ID_FK = Number(session.DS_P_ID_FK ?? session.DS_P_ID_FK);
        // const DS_Date = session.DS_Date;
        // const DS_Time = session.DS_Time;
        // const DS_Status = typeof session.DS_Status === 'number' ? session.DS_Status : 10;
        // const DS_Added_by = Number(session.DS_Added_by ?? session.DS_Added_by ?? null);
        // const DS_Provider_FK = session.DS_Provider_FK ? Number(session.DS_Provider_FK) : null;
        // const DS_Outlet_FK = session.DS_Outlet_FK ? Number(session.DS_Outlet_FK) : null;
        // Validate required fields

        if (!DS_P_ID_FK || !DS_Date || !DS_Time) {
          throw new Error(`Missing required fields: DS_P_ID_FK=${DS_P_ID_FK}, DS_Date=${DS_Date}, DS_Time=${DS_Time}`);
        }
        // Ensure DS_Time is in 'HH:mm:ss' format
        let formattedTime: string;
        if (Object.prototype.toString.call(DS_Time) === '[object Date]') {
          const dateObj = DS_Time as unknown as Date;
          if (isNaN(dateObj.getTime())) {
            throw new Error('DS_Time is an invalid Date object');
          }
          // Get hours, minutes, seconds and pad to two digits
          const hh = String(dateObj.getHours()).padStart(2, '0');
          const mm = String(dateObj.getMinutes()).padStart(2, '0');
          const ss = String(dateObj.getSeconds()).padStart(2, '0');
          formattedTime = `${hh}:${mm}:${ss}`;
        } else if (typeof DS_Time === 'string') {
          // Acceptable formats: 'H:m', 'HH:mm', 'HH:mm:ss', etc.
          const timeMatch = DS_Time.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
          if (timeMatch) {
            let hh = parseInt(timeMatch[1], 10);
            let mm = parseInt(timeMatch[2], 10);
            let ss = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
            // Validate ranges
            if (hh < 0 || hh > 23 || mm < 0 || mm > 59 || ss < 0 || ss > 59) {
              throw new Error(`Invalid DS_Time value: ${DS_Time}`);
            }
            formattedTime = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
          } else {
            throw new Error(`Invalid DS_Time format: ${DS_Time}`);
          }
        } else {
          throw new Error(`DS_Time must be a Date or string, got: ${typeof DS_Time}`);
        }
        console.log('DS_Time formatted value:', formattedTime, 'Original:', DS_Time);
        try {
          const result = await transaction.request()
            .input('DS_P_ID_FK', sql.BigInt, DS_P_ID_FK)
            .input('DS_Date', sql.Date, DS_Date)
            // .input('DS_Time', sql.Time, new Date('1970-01-01T08:00:00'))
            .input(
              'DS_Time',
              sql.Time,
              Object.prototype.toString.call(DS_Time) === '[object Date]'
                ? DS_Time
                : new Date(`1970-01-01T${formattedTime}`)
            )




            .input('DS_Status', sql.TinyInt, DS_Status)
            // .input('DS_Added_On', sql.Date, DS_Added_On)
            .input('DS_Added_By', sql.BigInt, DS_Added_by)

            .input('DS_Modified_By', sql.BigInt, DS_Modified_by)
            .input('DS_Modified_On', sql.Date, DS_Modified_On)
            .input('DS_Provider_FK', sql.BigInt, DS_Provider_FK)
            .input('DS_Outlet_FK', sql.BigInt, DS_Outlet_FK)

            // .input('DS_Modified_by', sql.BigInt, DS_Modified_by)
            // .input('DS_Modified_on', sql.Date, DS_Modified_on)
            // .input('DS_Provider_FK', sql.BigInt, DS_Provider_FK)
            // .input('DS_Outlet_FK', sql.BigInt, DS_Outlet_FK)

            .query(`
              INSERT INTO dbo.Dialysis_Schedules (
                DS_P_ID_FK,
                DS_Date,
                DS_Time,
                DS_Status,
                DS_Added_By,
                DS_Modified_By,
                DS_Modified_On,
                DS_Provider_FK,
                DS_Outlet_FK
              )
              OUTPUT 
                INSERTED.DS_ID_PK,
                INSERTED.DS_P_ID_FK,
                INSERTED.DS_Date,
                INSERTED.DS_Time,
                INSERTED.DS_Status,
                INSERTED.DS_Added_By,
                INSERTED.DS_Modified_By,
                INSERTED.DS_Modified_On,
                INSERTED.DS_Provider_FK,
                INSERTED.DS_Outlet_FK
              VALUES (
                @DS_P_ID_FK,
                @DS_Date,
                @DS_Time,
                @DS_Status,
                @DS_Added_By,
                @DS_Modified_By,
                @DS_Modified_On,
                @DS_Provider_FK,
                @DS_Outlet_FK
              );
            `);
          newSessions.push(result.recordset[0]);
        } catch (insertErr) {
          console.error('MSSQL addSchedulesAssigned insert error:', insertErr);
          throw insertErr;
        }
      }
      await transaction.commit();
      return newSessions;
    } catch (err) {
      await transaction.rollback();
      console.error('MSSQL addSchedulesAssigned transaction error:', err);
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
        'DCO' + RIGHT('0000' + CAST(DCO.DCO_ID_PK AS VARCHAR), 4) AS DCO_Formatted_ID,
        DCO.*,
        PM.PM_FirstName + 
          ISNULL(' ' + PM.PM_MiddleName, '') + 
          ISNULL(' ' + PM.PM_LastName, '') AS PatientName
      FROM 
        Dialysis_Case_Opening DCO
      JOIN 
        PAT_Patient_Master_1 PM ON PM.PM_Card_PK = DCO.DCO_P_ID_FK
      ORDER BY 
        DCO.DCO_Added_On ASC;


    `);
    // const result = await pool.request().query(`
    //   SELECT 
    //   'DCO' + RIGHT('0000' + CAST(DCO_ID_PK AS VARCHAR), 4) AS DCO_Formatted_ID,
    //   *  
    //   FROM Dialysis_Case_Opening
    //   ORDER BY DCO_Added_On ASC;

    // `);

    //     const result = await pool.request().query(`
    //       SELECT *
    // FROM dbo.Dialysis_Case_Opening
    // ORDER BY DCO_Added_On DESC;
    //     `);

    // const result = await pool.request().query(`
    //   SELECT 
    //     DCO_ID_PK,
    //     P_ID_FK,
    //     DCO_Blood_Group,
    //     DCO_Case_nature
    //   FROM HD_Case_Opening;
    // `);
    return result.recordset;
  } catch (err) {
    console.error('MSSQL getCaseOpenings error:', err);
    throw new Error('Failed to fetch case openings from MSSQL');
  }
};

export const addCaseOpening = async (caseOpening: CaseOpening): Promise<CaseOpening | { alreadyExists: boolean; message: string }> => {
  try {
    const pool = await sql.connect(config);


    // Check if case already exists
    const existing = await pool.request()
      .input('DCO_P_ID_FK', sql.BigInt, caseOpening.DCO_P_ID_FK)
      .query('SELECT 1 FROM Dialysis_Case_Opening WHERE DCO_P_ID_FK = @DCO_P_ID_FK');

    if (existing.recordset.length > 0) {
      return { alreadyExists: true, message: 'Case already opened for this patient' };
    }

    const result = await pool.request()
      .input('DCO_P_ID_FK', sql.BigInt, caseOpening.DCO_P_ID_FK)
      .input('DCO_Blood_Group', sql.VarChar(5), caseOpening.DCO_Blood_Group)
      .input('DCO_Case_Nature', sql.VarChar(20), caseOpening.DCO_Case_Nature)
      .query(`
        INSERT INTO Dialysis_Case_Opening (
          DCO_P_ID_FK,
          DCO_Blood_Group,
          DCO_Case_Nature
        )
        OUTPUT INSERTED.DCO_ID_PK, INSERTED.DCO_P_ID_FK, INSERTED.DCO_Blood_Group, INSERTED.DCO_Case_Nature
        VALUES (
          @DCO_P_ID_FK,
          @DCO_Blood_Group,
          @DCO_Case_Nature
        );
      `);


    // const result = await pool.request()
    //   .input('DCO_P_ID_FK', sql.BigInt, caseOpening.DCO_P_ID_FK)
    //   .input('DCO_Blood_Group', sql.VarChar(5), caseOpening.DCO_Blood_Group)
    //   .input('DCO_Case_Nature', sql.VarChar(20), caseOpening.DCO_Case_Nature)
    //   .query(`
    //     INSERT INTO Dialysis_Case_Opening (
    //       DCO_P_ID_FK,
    //       DCO_Blood_Group,
    //       DCO_Case_Nature
    //     )
    //     OUTPUT INSERTED.DCO_ID_PK, INSERTED.DCO_P_ID_FK, INSERTED.DCO_Blood_Group, INSERTED.DCO_Case_Nature
    //     VALUES (
    //       @DCO_P_ID_FK,
    //       @DCO_Blood_Group,
    //       @DCO_Case_Nature
    //     );
    //   `);
    return result.recordset[0];
  } catch (error) {
    console.error('Error adding case opening:', error);
    throw error;
  }
};


export const updateCaseOpening = async ({
  DCO_ID_PK,
  DCO_P_ID_FK,
  DCO_Blood_Group,
  DCO_Case_Nature
}: {
  DCO_ID_PK: number;
  DCO_P_ID_FK: number;
  DCO_Blood_Group?: string;
  DCO_Case_Nature?: string;
}) => {
  const pool = await sql.connect(config);

  // Update the record
  const result = await pool.request()
    .input('DCO_ID_PK', sql.BigInt, DCO_ID_PK)
    .input('DCO_P_ID_FK', sql.BigInt, DCO_P_ID_FK)
    .input('DCO_Blood_Group', sql.VarChar, DCO_Blood_Group)
    .input('DCO_Case_Nature', sql.VarChar, DCO_Case_Nature)
    .query(`
      UPDATE Dialysis_Case_Opening
      SET DCO_Blood_Group = @DCO_Blood_Group,
          DCO_Case_Nature = @DCO_Case_Nature
      WHERE DCO_ID_PK = @DCO_ID_PK AND DCO_P_ID_FK = @DCO_P_ID_FK;

      SELECT * FROM Dialysis_Case_Opening
      WHERE DCO_ID_PK = @DCO_ID_PK AND DCO_P_ID_FK = @DCO_P_ID_FK;
    `);

  if (!result.recordset.length) {
    throw new Error('Case opening not found');
  }

  return result.recordset[0];
};


// --- Units Lookup Functions ---
export const getUnits = async (): Promise<any[]> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM Units_Master where Unit_Status = 10');
    return result.recordset;
  } catch (error) {
    console.error('Error fetching units:', error);
    throw error;
  }
};

export const addUnit = async (unit: any): Promise<any> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('Unit_Name', sql.VarChar, unit.Unit_Name)
      .input('Unit_Availability_Status', sql.VarChar, unit.Unit_Availability_Status) // Map Unit_Status from frontend to Unit_Availability_Status in DB
      .input('Unit_Planned_Maintainance_DT', sql.DateTime, unit.Unit_Planned_Maintainance_DT)
      .input('Unit_Technitian_Assigned', sql.VarChar, unit.Unit_Technitian_Assigned)
      // .input('Unit_Status', sql.TinyInt, 10) // Always active
      .query(`
        INSERT INTO Units_Master
        (Unit_Name, Unit_Availability_Status, Unit_Planned_Maintainance_DT, Unit_Technitian_Assigned)
        OUTPUT INSERTED.*
        VALUES (@Unit_Name, @Unit_Availability_Status, @Unit_Planned_Maintainance_DT, @Unit_Technitian_Assigned)
      `);
    return result.recordset[0];
  } catch (error) {
    console.error('Error adding unit:', error);
    throw error;
  }
};

export const updateUnit = async (unitData: any): Promise<any> => {
  try {
    const pool = await sql.connect(config);
    const { Unit_ID_PK, ...rest } = unitData;
    console.log('Updating Unit_ID_PK:', Unit_ID_PK);
    const result = await pool.request()
      .input('Unit_ID_PK', sql.BigInt, Unit_ID_PK)
      .input('Unit_Name', sql.VarChar, rest.Unit_Name)
      .input('Unit_Availability_Status', sql.VarChar, rest.Unit_Availability_Status)
      .input('Unit_Planned_Maintainance_DT', sql.DateTime, rest.Unit_Planned_Maintainance_DT)
      .input('Unit_Technitian_Assigned', sql.VarChar, rest.Unit_Technitian_Assigned)
      .query(`
        UPDATE Units_Master
        SET Unit_Name = @Unit_Name,
            Unit_Availability_Status = @Unit_Availability_Status,
            Unit_Planned_Maintainance_DT = @Unit_Planned_Maintainance_DT,
            Unit_Technitian_Assigned = @Unit_Technitian_Assigned
        OUTPUT INSERTED.*
        WHERE Unit_ID_PK = @Unit_ID_PK
      `);
    if (result.recordset.length === 0) {
      throw new Error('Unit not found');
    }
    return result.recordset[0];
  } catch (error) {
    console.error('Error updating unit:', error);
    throw error;
  }
};

export const deleteUnit = async (id: string): Promise<boolean> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('Unit_ID_PK', sql.Int, id)
      // .query('DELETE FROM Units_Master WHERE Unit_ID_PK = @Unit_ID_PK');
      .query(`
        UPDATE Units_Master
        SET Unit_Status = 0
        WHERE Unit_ID_PK = @Unit_ID_PK
      `);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error('Error deleting unit:', error);
    throw error;
  }
};

// --- Vascular Access Lookup Functions ---
export const getVascularAccesses = async (): Promise<any[]> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM Vascular_Access_Lookup where VAL_Status = 10');
    return result.recordset;
  } catch (error) {
    console.error('Error fetching vascular accesses:', error);
    throw error;
  }
};

export const addVascularAccess = async (access: any): Promise<any> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('VAL_Access_Type', sql.VarChar, access.VAL_Access_Type)
      .query(`
        INSERT INTO Vascular_Access_Lookup (VAL_Access_Type)
        OUTPUT INSERTED.*
        VALUES (@VAL_Access_Type)
      `);
    return result.recordset[0];
  } catch (error) {
    console.error('Error adding vascular access:', error);
    throw error;
  }
};

export const updateVascularAccess = async (accessData: any): Promise<any> => {
  try {
    const pool = await sql.connect(config);
    const { VAL_Access_ID_PK, ...rest } = accessData;
    const result = await pool.request()
      .input('VAL_Access_ID_PK', sql.Int, VAL_Access_ID_PK)
      .input('VAL_Access_Type', sql.VarChar, rest.VAL_Access_Type)
      .query(`
        UPDATE Vascular_Access_Lookup 
        SET VAL_Access_Type = @VAL_Access_Type
        OUTPUT INSERTED.*
        WHERE VAL_Access_ID_PK = @VAL_Access_ID_PK
      `);
    if (result.recordset.length === 0) {
      throw new Error('Vascular access not found');
    }
    return result.recordset[0];
  } catch (error) {
    console.error('Error updating vascular access:', error);
    throw error;
  }
};

export const deleteVascularAccess = async (id: number): Promise<boolean> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('VAL_Access_ID_PK', sql.Int, id)
      .query('UPDATE Vascular_Access_Lookup SET VAL_Status = 0 WHERE VAL_Access_ID_PK = @VAL_Access_ID_PK');
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error('Error deleting vascular access:', error);
    throw error;
  }
};

// --- Dialyzer Types Lookup Functions ---
export const getDialyzerTypes = async (): Promise<any[]> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM Dialyzer_Type_Lookup where DTL_Status = 10');
    return result.recordset;
  } catch (error) {
    console.error('Error fetching dialyzer types:', error);
    throw error;
  }
};

export const addDialyzerType = async (type: any): Promise<any> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('DTL_Dialyzer_Name', sql.VarChar, type.DTL_Dialyzer_Name)
      .input('DTL_Membrane_Type', sql.VarChar, type.DTL_Membrane_Type)
      .input('DTL_Flux_Type', sql.VarChar, type.DTL_Flux_Type)
      .input('DTL_Surface_Area', sql.Decimal(4,2), type.DTL_Surface_Area)
      .query(`
        INSERT INTO Dialyzer_Type_Lookup (DTL_Dialyzer_Name, DTL_Membrane_Type, DTL_Flux_Type, DTL_Surface_Area)
        OUTPUT INSERTED.*
        VALUES (@DTL_Dialyzer_Name, @DTL_Membrane_Type, @DTL_Flux_Type, @DTL_Surface_Area)
      `);
    return result.recordset[0];
  } catch (error) {
    console.error('Error adding dialyzer type:', error);
    throw error;
  }
};

export const updateDialyzerType = async (typeData: any): Promise<any> => {
  try {
    const pool = await sql.connect(config);
    const { DTL_ID_PK, ...rest } = typeData;
    const result = await pool.request()
      .input('DTL_ID_PK', sql.Int, DTL_ID_PK)
      .input('DTL_Dialyzer_Name', sql.VarChar, rest.DTL_Dialyzer_Name)
      .input('DTL_Membrane_Type', sql.VarChar, rest.DTL_Membrane_Type)
      .input('DTL_Flux_Type', sql.VarChar, rest.DTL_Flux_Type)
      .input('DTL_Surface_Area', sql.Decimal(4,2), rest.DTL_Surface_Area)
      .query(`
        UPDATE Dialyzer_Type_Lookup
        SET 
          DTL_Dialyzer_Name = @DTL_Dialyzer_Name,
          DTL_Membrane_Type = @DTL_Membrane_Type,
          DTL_Flux_Type = @DTL_Flux_Type,
          DTL_Surface_Area = @DTL_Surface_Area
        OUTPUT INSERTED.*
        WHERE DTL_ID_PK = @DTL_ID_PK
      `);
    if (result.recordset.length === 0) {
      throw new Error('Dialyzer type not found');
    }
    return result.recordset[0];
  } catch (error) {
    console.error('Error updating dialyzer type:', error);
    throw error;
  }
};

export const deleteDialyzerType = async (id: string): Promise<boolean> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('DTL_ID_PK', sql.Int, id)
      .query('UPDATE Dialyzer_Type_Lookup SET DTL_Status = 0 WHERE DTL_ID_PK = @DTL_ID_PK');
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error('Error deleting dialyzer type:', error);
    throw error;
  }
};

// --- Scheduling Lookup Functions ---
export const getSchedulingLookup = async (): Promise<any[]> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM Scheduling_Lookup');
    return result.recordset;
  } catch (error) {
    console.error('Error fetching scheduling lookup:', error);
    throw error;
  }
};

export const addSchedulingLookup = async (lookup: any): Promise<any> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('SL_No_of_units', sql.Int, lookup.SL_No_of_units)
      .input('SL_Working_hrs', sql.Decimal(4,2), lookup.SL_Working_hrs)
      .input('SL_Working_days', sql.Int, lookup.SL_Working_days)
      .input('SL_Pre_dialysis_time', sql.Decimal(4,2), lookup.SL_Pre_dialysis_time)
      .input('SL_Dialysis_Session_Time', sql.Decimal(4,2), lookup.SL_Dialysis_Session_Time)
      .query(`
        INSERT INTO Scheduling_Lookup (
          SL_No_of_units,
          SL_Working_hrs,
          SL_Working_days,
          SL_Pre_dialysis_time,
          SL_Dialysis_Session_Time
        )
        OUTPUT INSERTED.*
        VALUES (
          @SL_No_of_units,
          @SL_Working_hrs,
          @SL_Working_days,
          @SL_Pre_dialysis_time,
          @SL_Dialysis_Session_Time
        )
      `);
    return result.recordset[0];
  } catch (error) {
    console.error('Error adding scheduling lookup:', error);
    throw error;
  }
};

export const updateSchedulingLookup = async (lookupData: any): Promise<any> => {
  try {
    const pool = await sql.connect(config);
    const { id, ...rest } = lookupData;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('SL_Working_hrs', sql.Decimal(4,2), rest.SL_Working_hrs)
      .input('SL_Working_days', sql.Int, rest.SL_Working_days)
      .input('SL_Pre_dialysis_time', sql.Decimal(4,2), rest.SL_Pre_dialysis_time)
      .input('SL_Dialysis_Session_Time', sql.Decimal(4,2), rest.SL_Dialysis_Session_Time)
      .query(`
        UPDATE Scheduling_Lookup 
        SET
          SL_Working_hrs = @SL_Working_hrs,
          SL_Working_days = @SL_Working_days,
          SL_Pre_dialysis_time = @SL_Pre_dialysis_time,
          SL_Dialysis_Session_Time = @SL_Dialysis_Session_Time
        OUTPUT INSERTED.*
        WHERE SL_ID_PK = 1
      `);
    if (result.recordset.length === 0) {
      throw new Error('Scheduling lookup not found');
    }
    return result.recordset[0];
  } catch (error) {
    console.error('Error updating scheduling lookup:', error);
    throw error;
  }
};

export const deleteSchedulingLookup = async (id: string): Promise<boolean> => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Scheduling_Lookup WHERE id = @id');
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error('Error deleting scheduling lookup:', error);
    throw error;
  }
};