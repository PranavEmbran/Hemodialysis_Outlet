-- ===========================================
-- 00_script.sql - Create Dialysis_Case_Opening table
-- ===========================================

-- Step 1: Create Dialysis_Case_Opening Table
IF NOT EXISTS (
    SELECT 1 FROM sysobjects
    WHERE name = 'Dialysis_Case_Opening'
      AND type = 'U'
)
BEGIN
    CREATE TABLE dbo.Dialysis_Case_Opening (
       DCO_ID_PK BIGINT IDENTITY(1,1) PRIMARY KEY,            -- Primary key

        DCO_P_ID_FK BIGINT NOT NULL,                          -- FK to patient master
        DCO_Blood_Group VARCHAR(5) NULL,                      -- Blood group
        DCO_Case_Nature VARCHAR(20) NULL,                     -- Acute, Chronic

        DCO_Status TINYINT DEFAULT 10,                        -- 10 = active, 0 = soft deleted

        DCO_Added_By BIGINT NULL,
        DCO_Added_On DATETIME DEFAULT GETDATE(),
        DCO_Modified_By BIGINT NULL,
        DCO_Modified_On DATETIME NULL,

        DCO_Provider_FK BIGINT NULL,
        DCO_Outlet_FK BIGINT NULL,

        -- Foreign Key to Patient Master (NO DELETE CASCADE)
        CONSTRAINT FK_DialysisCaseOpening_Patient FOREIGN KEY (DCO_P_ID_FK)
            REFERENCES dbo.PAT_Patient_Master_1(PM_Card_PK)
            ON UPDATE CASCADE
    );
END;
GO


-- ===========================================
-- Create Table: Dialysis_Schedules
-- ===========================================

IF NOT EXISTS (
    SELECT 1 FROM sysobjects
    WHERE name = 'Dialysis_Schedules'
      AND type = 'U'
)
BEGIN
    CREATE TABLE dbo.Dialysis_Schedules (
        DS_ID_PK BIGINT IDENTITY(1,1) PRIMARY KEY,          -- Primary Key

        DS_P_ID_FK BIGINT NOT NULL,                         -- FK to patient master
        DS_Date DATE NOT NULL,                              -- Scheduled date
        DS_Time TIME NOT NULL,                              -- Scheduled time

        DS_Status TINYINT DEFAULT 10,                       -- 10 = active, 0 = soft deleted

        DS_Added_By BIGINT NULL,
        DS_Added_On DATETIME DEFAULT GETDATE(),
        DS_Modified_By BIGINT NULL,
        DS_Modified_On DATETIME NULL,

        DS_Provider_FK BIGINT NULL,
        DS_Outlet_FK BIGINT NULL,

        -- Foreign Key to Patient Master (no delete cascade)
        CONSTRAINT FK_DialysisSchedules_Patient FOREIGN KEY (DS_P_ID_FK)
            REFERENCES dbo.PAT_Patient_Master_1(PM_Card_PK)
            ON UPDATE CASCADE
    );
END;
GO


-- ========================================
-- Table: Scheduling_Lookup
-- Purpose: Stores system-wide dialysis scheduling configuration
-- ========================================

IF NOT EXISTS (
    SELECT 1 FROM sysobjects
    WHERE name = 'Scheduling_Lookup'
      AND type = 'U'
)
BEGIN
    CREATE TABLE dbo.Scheduling_Lookup (
        SL_ID_PK INT IDENTITY(1,1) PRIMARY KEY,
        SL_No_of_units INT NOT NULL,
        SL_Working_hrs DECIMAL(4,2) NOT NULL,
        SL_Working_days INT NOT NULL,
        SL_Pre_dialysis_time DECIMAL(4,2) NOT NULL,
        SL_Dialysis_Session_Time DECIMAL(4,2) NOT NULL
    );
END
GO

-- Insert only if no row exists
IF NOT EXISTS (SELECT 1 FROM dbo.Scheduling_Lookup)
BEGIN
    INSERT INTO dbo.Scheduling_Lookup (
        SL_No_of_units,
        SL_Working_hrs,
        SL_Working_days,
        SL_Pre_dialysis_time,
        SL_Dialysis_Session_Time
    ) VALUES (
        6, 16.00, 7, 1.00, 4.00
    );
END
GO



-- ========================================
-- Table: Units_Master
-- Purpose: Stores dialysis machine unit information
-- ========================================

IF NOT EXISTS (
    SELECT 1 FROM sysobjects
    WHERE name = 'Units_Master'
      AND type = 'U'
)
BEGIN
    CREATE TABLE dbo.Units_Master (
        Unit_ID_PK BIGINT IDENTITY(1,1) PRIMARY KEY,
        Unit_Name VARCHAR(50) NOT NULL,
        Unit_Availability_Status VARCHAR(20) NOT NULL,
        Unit_Planned_Maintainance_DT DATETIME NOT NULL,
        Unit_Technitian_Assigned VARCHAR(50) NOT NULL,
        Unit_Status TINYINT NOT NULL DEFAULT 10  -- 10 = active, 0 = soft deleted
    );
END
GO



-- ========================================
-- Table: Vascular_Access_Lookup
-- Purpose: Stores vascular access types
-- ========================================

IF NOT EXISTS (
    SELECT 1 FROM sysobjects
    WHERE name = 'Vascular_Access_Lookup'
      AND type = 'U'
)
BEGIN
    CREATE TABLE dbo.Vascular_Access_Lookup (
        VAL_Access_ID_PK INT IDENTITY(1,1) PRIMARY KEY,
        VAL_Access_Type VARCHAR(50) NOT NULL,
        VAL_Status TINYINT NOT NULL DEFAULT 10     -- 10 = active, 0 = soft deleted
    );
END
GO
    


-- ========================================
-- Table: Dialyzer_Type_Lookup
-- Purpose: Stores dialyzer specifications
-- ========================================

IF NOT EXISTS (
    SELECT 1 FROM sysobjects
    WHERE name = 'Dialyzer_Type_Lookup'
      AND type = 'U'
)
BEGIN
    CREATE TABLE dbo.Dialyzer_Type_Lookup (
        DTL_ID_PK INT IDENTITY(1,1) PRIMARY KEY,
        DTL_Dialyzer_Name VARCHAR(100) NOT NULL,
        DTL_Membrane_Type VARCHAR(50) NOT NULL,
        DTL_Flux_Type VARCHAR(50) NOT NULL,
        DTL_Surface_Area DECIMAL(4,2) NOT NULL,
        DTL_Status TINYINT DEFAULT 10 -- 10 = active, 0 = soft-deleted
    );
END
GO



-- ===========================================
-- 00_script.sql - Create PreDialysis_Records table
-- ===========================================

IF NOT EXISTS (
    SELECT 1 FROM sysobjects
    WHERE name = 'PreDialysis_Records'
      AND type = 'U'
)
BEGIN
    CREATE TABLE dbo.PreDialysis_Records (
        PreDR_ID_PK BIGINT IDENTITY(1,1) PRIMARY KEY,           -- Primary Key

        PreDR_DS_ID_FK BIGINT NOT NULL,                            -- FK to Dialysis_Schedules
        PreDR_P_ID_FK BIGINT NOT NULL,                                -- FK to patient master

        PreDR_Vitals_BP VARCHAR(10) NULL,                       -- Blood Pressure
        PreDR_Vitals_HeartRate VARCHAR(10) NULL,                -- Heart Rate
        PreDR_Vitals_Temperature VARCHAR(10) NULL,              -- Temperature
        PreDR_Vitals_Weight VARCHAR(10) NULL,                   -- Weight
        PreDR_Notes VARCHAR(MAX) NULL,                          -- Notes

        PreDR_Status TINYINT DEFAULT 10,                              -- 10 = active, 0 = soft deleted

        PreDR_Added_By BIGINT NULL,
        PreDR_Added_On DATETIME DEFAULT GETDATE(),
        PreDR_Modified_By BIGINT NULL,
        PreDR_Modified_On DATETIME NULL,

        PreDR_Provider_FK BIGINT NULL,
        PreDR_Outlet_FK BIGINT NULL,

        -- Foreign Keys (no cascading updates to avoid cycles)
        CONSTRAINT FK_PreDialysis_ScheduleAssigned FOREIGN KEY (PreDR_DS_ID_FK)
            REFERENCES dbo.Dialysis_Schedules(DS_ID_PK),

        CONSTRAINT FK_PreDialysis_Patient FOREIGN KEY (PreDR_P_ID_FK)
            REFERENCES dbo.PAT_Patient_Master_1(PM_Card_PK)
    );
END;
GO





-- ===========================================
-- 00_script.sql - Create PostDialysis_Records tablePostDR
-- ===========================================

IF NOT EXISTS (
    SELECT 1 FROM sysobjects
    WHERE name = 'PostDialysis_Records'
      AND type = 'U'
)
BEGIN
    CREATE TABLE dbo.PostDialysis_Records (
        PostDR_ID_PK BIGINT IDENTITY(1,1) PRIMARY KEY,           -- Primary Key

        PostDR_DS_ID_FK BIGINT NOT NULL,                            -- FK to Dialysis_Schedules
        PostDR_P_ID_FK BIGINT NOT NULL,                                -- FK to patient master

        PostDR_Vitals_BP VARCHAR(10) NULL,                       -- Blood Pressure
        PostDR_Vitals_HeartRate VARCHAR(10) NULL,                -- Heart Rate
        PostDR_Vitals_Temperature VARCHAR(10) NULL,              -- Temperature
        PostDR_Vitals_Weight VARCHAR(10) NULL,                   -- Weight
        PostDR_Notes VARCHAR(MAX) NULL,                          -- Notes

        PostDR_Status TINYINT DEFAULT 10,                              -- 10 = active, 0 = soft deleted

        PostDR_Added_By BIGINT NULL,
        PostDR_Added_On DATETIME DEFAULT GETDATE(),
        PostDR_Modified_By BIGINT NULL,
        PostDR_Modified_On DATETIME NULL,

        PostDR_Provider_FK BIGINT NULL,
        PostDR_Outlet_FK BIGINT NULL,

        -- Foreign Keys (no cascading updates to avoid cycles)
        CONSTRAINT FK_PostDialysis_ScheduleAssigned FOREIGN KEY (PostDR_DS_ID_FK)
            REFERENCES dbo.Dialysis_Schedules(DS_ID_PK),

        CONSTRAINT FK_PostDialysis_Patient FOREIGN KEY (PostDR_P_ID_FK)
            REFERENCES dbo.PAT_Patient_Master_1(PM_Card_PK)
    );
END;
GO


-- ===========================================
-- 01_script.sql - Create Start_Dialysis_Records table
-- ===========================================

IF NOT EXISTS (
    SELECT 1 FROM sysobjects
    WHERE name = 'Start_Dialysis_Records'
      AND type = 'U'
)
BEGIN
    CREATE TABLE dbo.Start_Dialysis_Records (
        SDR_ID_PK BIGINT IDENTITY(1,1) PRIMARY KEY,              -- Primary Key

        SDR_DS_ID_FK BIGINT NOT NULL,                            -- FK to Dialysis_Schedules
        SDR_P_ID_FK BIGINT NOT NULL,                             -- FK to patient master

        SDR_Dialysis_Unit VARCHAR(50) NOT NULL,                  -- Dialysis Unit name or ID
        SDR_Start_Time TIME NULL,                                -- Start time of dialysis
        SDR_Vascular_Access VARCHAR(50) NULL,                    -- Vascular access type
        SDR_Dialyzer_Type VARCHAR(50) NULL,                      -- Dialyzer type
        SDR_Notes VARCHAR(MAX) NULL,                             -- Additional notes

        SDR_Status TINYINT DEFAULT 10,                           -- 10 = active, 0 = soft deleted

        SDR_Added_By BIGINT NULL,
        SDR_Added_On DATETIME DEFAULT GETDATE(),
        SDR_Modified_By BIGINT NULL,
        SDR_Modified_On DATETIME NULL,

        SDR_Provider_FK BIGINT NULL,
        SDR_Outlet_FK BIGINT NULL,

        -- Foreign Keys
        CONSTRAINT FK_SDR_ScheduleAssigned FOREIGN KEY (SDR_DS_ID_FK)
            REFERENCES dbo.Dialysis_Schedules(DS_ID_PK),

        CONSTRAINT FK_SDR_Patient FOREIGN KEY (SDR_P_ID_FK)
            REFERENCES dbo.PAT_Patient_Master_1(PM_Card_PK)
    );
END;
GO



