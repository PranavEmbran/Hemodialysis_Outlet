-- SQL script to add status columns if they don't exist
-- Run this on your MSSQL database to ensure status columns are present

-- Add status column to PreDialysis_Records if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PreDialysis_Records') AND name = 'PreDR_Status')
BEGIN
    ALTER TABLE PreDialysis_Records ADD PreDR_Status INT DEFAULT 10;
    UPDATE PreDialysis_Records SET PreDR_Status = 10 WHERE PreDR_Status IS NULL;
END

-- Add status column to Start_Dialysis_Records if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Start_Dialysis_Records') AND name = 'SDR_Status')
BEGIN
    ALTER TABLE Start_Dialysis_Records ADD SDR_Status INT DEFAULT 10;
    UPDATE Start_Dialysis_Records SET SDR_Status = 10 WHERE SDR_Status IS NULL;
END

-- Add status column to PostDialysis_Records if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PostDialysis_Records') AND name = 'PostDR_Status')
BEGIN
    ALTER TABLE PostDialysis_Records ADD PostDR_Status INT DEFAULT 10;
    UPDATE PostDialysis_Records SET PostDR_Status = 10 WHERE PostDR_Status IS NULL;
END

-- Add modified timestamp columns if they don't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PreDialysis_Records') AND name = 'PreDR_Modified_On')
BEGIN
    ALTER TABLE PreDialysis_Records ADD PreDR_Modified_On DATETIME DEFAULT GETDATE();
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Start_Dialysis_Records') AND name = 'SDR_Modified_On')
BEGIN
    ALTER TABLE Start_Dialysis_Records ADD SDR_Modified_On DATETIME DEFAULT GETDATE();
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PostDialysis_Records') AND name = 'PostDR_Modified_On')
BEGIN
    ALTER TABLE PostDialysis_Records ADD PostDR_Modified_On DATETIME DEFAULT GETDATE();
END

PRINT 'Status and modified timestamp columns added successfully!';