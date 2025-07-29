The getSchedulingLookup function in MSSQL service currently performs:

const result = await pool.request().query('SELECT * FROM Scheduling_Lookup');

This will fetch all columns from the Scheduling_Lookup table.

However, if the MSSQL table does not have the columns:

SL_Working_hrs
SL_Working_days
SL_Pre_dialysis_time
SL_Dialysis_Session_Time
...then these fields will not be returned, and your frontend will fall back to LowDB or display missing data.