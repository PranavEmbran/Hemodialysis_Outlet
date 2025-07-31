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





