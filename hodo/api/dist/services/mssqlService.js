import sql from 'mssql';
function getEnv(name) {
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
export const getData = async () => {
    // TODO: Implement MSSQL logic
    throw new Error('MSSQL service not implemented yet');
};
export const addData = async (item) => {
    // TODO: Implement MSSQL logic
    throw new Error('MSSQL service not implemented yet');
};
export const deleteData = async (id) => {
    // TODO: Implement MSSQL logic
    throw new Error('MSSQL service not implemented yet');
};
export const getPatientsDerived = async () => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
      SELECT TOP 10
        PM_Card_PK,
        PM_FirstName + ISNULL(' ' + PM_MiddleName, '') + ISNULL(' ' + PM_LastName, '') AS P_Name
      FROM PAT_Patient_Master_1;
    `);
        return result.recordset.map((row) => ({
            id: row.PM_Card_PK,
            Name: row.P_Name,
        }));
    }
    catch (err) {
        console.error('MSSQL getPatientsDerived error:', err);
        throw new Error('Failed to fetch patients from MSSQL');
    }
};
// Fetch predialysis records from MSSQL
export const getPredialysisRecords = async () => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
      SELECT * FROM PreDialysis_Records;
    `);
        return result.recordset.map((row) => ({
            id: row.id || row.ID || row.SA_ID_PK_FK,
            SA_ID_PK_FK: row.SA_ID_PK_FK,
            P_ID_FK: row.P_ID_FK,
            PreDR_Vitals_BP: row.PreDR_Vitals_BP,
            PreDR_Vitals_HeartRate: row.PreDR_Vitals_HeartRate,
            PreDR_Vitals_Temperature: row.PreDR_Vitals_Temperature,
            PreDR_Vitals_Weight: row.PreDR_Vitals_Weight,
            PreDR_Notes: row.PreDR_Notes,
        }));
    }
    catch (err) {
        console.error('MSSQL getPredialysisRecords error:', err);
        throw new Error('Failed to fetch predialysis records from MSSQL');
    }
};
// Fetch start dialysis records from MSSQL
export const getStartDialysisRecords = async () => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
      SELECT * FROM StartDialysis_Records;
    `);
        return result.recordset.map((row) => ({
            id: row.id || row.ID || row.SA_ID_PK_FK,
            SA_ID_PK_FK: row.SA_ID_PK_FK,
            Dialysis_Unit: row.Dialysis_Unit,
            SDR_Start_time: row.SDR_Start_time,
            SDR_Vascular_access: row.SDR_Vascular_access,
            Dialyzer_Type: row.Dialyzer_Type,
            SDR_Notes: row.SDR_Notes,
            // Add any other fields as needed
        }));
    }
    catch (err) {
        console.error('MSSQL getStartDialysisRecords error:', err);
        throw new Error('Failed to fetch start dialysis records from MSSQL');
    }
};
// Fetch post dialysis records from MSSQL
export const getPostDialysisRecords = async () => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
      SELECT * FROM PostDialysis_Records;
    `);
        return result.recordset.map((row) => ({
            id: row.id || row.ID || row.SA_ID_FK,
            SA_ID_FK: row.SA_ID_FK,
            P_ID_FK: row.P_ID_FK,
            PreDR_Vitals_BP: row.PreDR_Vitals_BP,
            PreDR_Vitals_HeartRate: row.PreDR_Vitals_HeartRate,
            PreDR_Vitals_Temperature: row.PreDR_Vitals_Temperature,
            PreDR_Vitals_Weight: row.PreDR_Vitals_Weight,
            PostDR_Notes: row.PostDR_Notes,
        }));
    }
    catch (err) {
        console.error('MSSQL getPostDialysisRecords error:', err);
        throw new Error('Failed to fetch post dialysis records from MSSQL');
    }
};
// Fetch in-process records from MSSQL
export const getInProcessRecords = async () => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
      SELECT * FROM InProcess_Records;
    `);
        return result.recordset.map((row) => ({
            id: row.id || row.ID || row.SA_ID_PK_FK,
            SA_ID_PK_FK: row.SA_ID_PK_FK,
            // Example: adapt fields as per your schema
            rows: row.rows,
            // Add any other fields as needed
        }));
    }
    catch (err) {
        console.error('MSSQL getInProcessRecords error:', err);
        throw new Error('Failed to fetch in-process records from MSSQL');
    }
};
export const getSchedulesAssigned = async () => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
      SELECT 
        DS_ID_PK,
        P_ID_FK,
        CONVERT(varchar, DS_Date, 23) as DS_Date,
        CONVERT(varchar, CAST(DS_Time AS TIME), 108) as DS_Time,
        Status,
        Added_by,
        CONVERT(varchar, Added_on, 120) as Added_on,
        Modified_by,
        CONVERT(varchar, Modified_on, 120) as Modified_on,
        Provider_FK,
        Outlet_FK
      FROM Dialysis_Schedules
      WHERE Status = 0;
    `);
        return result.recordset;
    }
    catch (err) {
        console.error('MSSQL getSchedulesAssigned error:', err);
        throw new Error('Failed to fetch assigned schedules from MSSQL');
    }
};
export const addSchedulesAssigned = async (sessions) => {
    try {
        const pool = await sql.connect(config);
        // Start a transaction
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            // Get the next available ID
            const idResult = await transaction.request()
                .query(`SELECT ISNULL(MAX(CAST(SUBSTRING(DS_ID_PK, 3, LEN(DS_ID_PK)) AS INT)), 0) + 1 as nextId FROM Dialysis_Schedules`);
            let nextId = idResult.recordset[0].nextId;
            const newSessions = [];
            // Insert each session
            for (const session of sessions) {
                const sessionId = `SA${String(nextId).padStart(3, '0')}`;
                await transaction.request()
                    .input('id', sql.VarChar, sessionId)
                    .input('pId', sql.VarChar, session.P_ID_FK)
                    .input('date', sql.Date, session.DS_Date)
                    .input('time', sql.Time, session.DS_Time)
                    .input('addedBy', sql.VarChar, session.Added_by || 'system')
                    .input('providerFk', sql.VarChar, session.Provider_FK || null)
                    .input('outletFk', sql.VarChar, session.Outlet_FK || null)
                    .query(`
            INSERT INTO Dialysis_Schedules 
            (DS_ID_PK, P_ID_FK, DS_Date, DS_Time, Status, Added_by, Added_on, Modified_by, Modified_on, Provider_FK, Outlet_FK)
            VALUES (@id, @pId, @date, @time, 0, @addedBy, GETDATE(), @addedBy, GETDATE(), @providerFk, @outletFk)
          `);
                newSessions.push({
                    ...session,
                    DS_ID_PK: sessionId,
                    DS_Status: 0,
                    DS_Added_on: new Date().toISOString(),
                    DS_Modified_on: new Date().toISOString()
                });
                nextId++;
            }
            await transaction.commit();
            return newSessions;
        }
        catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
    catch (err) {
        console.error('MSSQL addSchedulesAssigned error:', err);
        throw new Error('Failed to add schedules to MSSQL');
    }
};
export const getCaseOpenings = async () => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
      SELECT 
        DCO_ID_PK,
        P_ID_FK,
        DCO_Blood_Group,
        DCO_Case_nature
      FROM HD_Case_Opening;
    `);
        return result.recordset;
    }
    catch (err) {
        console.error('MSSQL getCaseOpenings error:', err);
        throw new Error('Failed to fetch case openings from MSSQL');
    }
};
export const addCaseOpening = async (caseOpening) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('P_ID_FK', sql.VarChar, caseOpening.P_ID_FK)
            .input('DCO_Blood_Group', sql.VarChar, caseOpening.DCO_Blood_Group)
            .input('DCO_Case_nature', sql.VarChar, caseOpening.DCO_Case_nature)
            .query(`
        INSERT INTO HD_Case_Opening (P_ID_FK, DCO_Blood_Group, DCO_Case_nature)
        OUTPUT INSERTED.DCO_ID_PK, INSERTED.P_ID_FK, INSERTED.DCO_Blood_Group, INSERTED.DCO_Case_nature
        VALUES (@P_ID_FK, @DCO_Blood_Group, @DCO_Case_nature)
      `);
        return result.recordset[0];
    }
    catch (error) {
        console.error('Error adding case opening:', error);
        throw error;
    }
};
// --- Units Lookup Functions ---
export const getUnits = async () => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Units_Master');
        return result.recordset;
    }
    catch (error) {
        console.error('Error fetching units:', error);
        throw error;
    }
};
export const addUnit = async (unit) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('Unit_Name', sql.VarChar, unit.Unit_Name)
            .input('Unit_Description', sql.VarChar, unit.Unit_Description || '')
            .query(`
        INSERT INTO Units_Master (Unit_Name, Unit_Description)
        OUTPUT INSERTED.*
        VALUES (@Unit_Name, @Unit_Description)
      `);
        return result.recordset[0];
    }
    catch (error) {
        console.error('Error adding unit:', error);
        throw error;
    }
};
export const updateUnit = async (unitData) => {
    try {
        const pool = await sql.connect(config);
        const { Unit_ID_PK, ...rest } = unitData;
        const result = await pool.request()
            .input('Unit_ID_PK', sql.Int, Unit_ID_PK)
            .input('Unit_Name', sql.VarChar, rest.Unit_Name)
            .input('Unit_Description', sql.VarChar, rest.Unit_Description || '')
            .query(`
        UPDATE Units_Master 
        SET Unit_Name = @Unit_Name, Unit_Description = @Unit_Description
        OUTPUT INSERTED.*
        WHERE Unit_ID_PK = @Unit_ID_PK
      `);
        if (result.recordset.length === 0) {
            throw new Error('Unit not found');
        }
        return result.recordset[0];
    }
    catch (error) {
        console.error('Error updating unit:', error);
        throw error;
    }
};
export const deleteUnit = async (id) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('Unit_ID_PK', sql.Int, id)
            .query('DELETE FROM Units_Master WHERE Unit_ID_PK = @Unit_ID_PK');
        return result.rowsAffected[0] > 0;
    }
    catch (error) {
        console.error('Error deleting unit:', error);
        throw error;
    }
};
// --- Vascular Access Lookup Functions ---
export const getVascularAccesses = async () => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Vascular_Access_Lookup');
        return result.recordset;
    }
    catch (error) {
        console.error('Error fetching vascular accesses:', error);
        throw error;
    }
};
export const addVascularAccess = async (access) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('VAL_Name', sql.VarChar, access.VAL_Name)
            .input('VAL_Description', sql.VarChar, access.VAL_Description || '')
            .query(`
        INSERT INTO Vascular_Access_Lookup (VAL_Name, VAL_Description)
        OUTPUT INSERTED.*
        VALUES (@VAL_Name, @VAL_Description)
      `);
        return result.recordset[0];
    }
    catch (error) {
        console.error('Error adding vascular access:', error);
        throw error;
    }
};
export const updateVascularAccess = async (accessData) => {
    try {
        const pool = await sql.connect(config);
        const { VAL_ID_PK, ...rest } = accessData;
        const result = await pool.request()
            .input('VAL_ID_PK', sql.Int, VAL_ID_PK)
            .input('VAL_Name', sql.VarChar, rest.VAL_Name)
            .input('VAL_Description', sql.VarChar, rest.VAL_Description || '')
            .query(`
        UPDATE Vascular_Access_Lookup 
        SET VAL_Name = @VAL_Name, VAL_Description = @VAL_Description
        OUTPUT INSERTED.*
        WHERE VAL_ID_PK = @VAL_ID_PK
      `);
        if (result.recordset.length === 0) {
            throw new Error('Vascular access not found');
        }
        return result.recordset[0];
    }
    catch (error) {
        console.error('Error updating vascular access:', error);
        throw error;
    }
};
export const deleteVascularAccess = async (id) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('VAL_ID_PK', sql.Int, id)
            .query('DELETE FROM Vascular_Access_Lookup WHERE VAL_ID_PK = @VAL_ID_PK');
        return result.rowsAffected[0] > 0;
    }
    catch (error) {
        console.error('Error deleting vascular access:', error);
        throw error;
    }
};
// --- Dialyzer Types Lookup Functions ---
export const getDialyzerTypes = async () => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Dialyzer_Type_Lookup');
        return result.recordset;
    }
    catch (error) {
        console.error('Error fetching dialyzer types:', error);
        throw error;
    }
};
export const addDialyzerType = async (type) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('DTL_Name', sql.VarChar, type.DTL_Name)
            .input('DTL_Description', sql.VarChar, type.DTL_Description || '')
            .query(`
        INSERT INTO Dialyzer_Type_Lookup (DTL_Name, DTL_Description)
        OUTPUT INSERTED.*
        VALUES (@DTL_Name, @DTL_Description)
      `);
        return result.recordset[0];
    }
    catch (error) {
        console.error('Error adding dialyzer type:', error);
        throw error;
    }
};
export const updateDialyzerType = async (typeData) => {
    try {
        const pool = await sql.connect(config);
        const { DTL_ID_PK, ...rest } = typeData;
        const result = await pool.request()
            .input('DTL_ID_PK', sql.Int, DTL_ID_PK)
            .input('DTL_Name', sql.VarChar, rest.DTL_Name)
            .input('DTL_Description', sql.VarChar, rest.DTL_Description || '')
            .query(`
        UPDATE Dialyzer_Type_Lookup 
        SET DTL_Name = @DTL_Name, DTL_Description = @DTL_Description
        OUTPUT INSERTED.*
        WHERE DTL_ID_PK = @DTL_ID_PK
      `);
        if (result.recordset.length === 0) {
            throw new Error('Dialyzer type not found');
        }
        return result.recordset[0];
    }
    catch (error) {
        console.error('Error updating dialyzer type:', error);
        throw error;
    }
};
export const deleteDialyzerType = async (id) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('DTL_ID_PK', sql.Int, id)
            .query('DELETE FROM Dialyzer_Type_Lookup WHERE DTL_ID_PK = @DTL_ID_PK');
        return result.rowsAffected[0] > 0;
    }
    catch (error) {
        console.error('Error deleting dialyzer type:', error);
        throw error;
    }
};
// --- Scheduling Lookup Functions ---
export const getSchedulingLookup = async () => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Scheduling_Lookup');
        return result.recordset;
    }
    catch (error) {
        console.error('Error fetching scheduling lookup:', error);
        throw error;
    }
};
export const addSchedulingLookup = async (lookup) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('SL_Name', sql.VarChar, lookup.SL_Name)
            .input('SL_No_of_units', sql.Int, lookup.SL_No_of_units)
            .query(`
        INSERT INTO Scheduling_Lookup (SL_Name, SL_No_of_units)
        OUTPUT INSERTED.*
        VALUES (@SL_Name, @SL_No_of_units)
      `);
        return result.recordset[0];
    }
    catch (error) {
        console.error('Error adding scheduling lookup:', error);
        throw error;
    }
};
export const updateSchedulingLookup = async (lookupData) => {
    try {
        const pool = await sql.connect(config);
        const { id, ...rest } = lookupData;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('SL_Name', sql.VarChar, rest.SL_Name)
            .input('SL_No_of_units', sql.Int, rest.SL_No_of_units)
            .query(`
        UPDATE Scheduling_Lookup 
        SET SL_Name = @SL_Name, SL_No_of_units = @SL_No_of_units
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
        if (result.recordset.length === 0) {
            throw new Error('Scheduling lookup not found');
        }
        return result.recordset[0];
    }
    catch (error) {
        console.error('Error updating scheduling lookup:', error);
        throw error;
    }
};
export const deleteSchedulingLookup = async (id) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Scheduling_Lookup WHERE id = @id');
        return result.rowsAffected[0] > 0;
    }
    catch (error) {
        console.error('Error deleting scheduling lookup:', error);
        throw error;
    }
};
