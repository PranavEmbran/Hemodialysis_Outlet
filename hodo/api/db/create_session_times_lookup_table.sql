-- Create Session_Times_Lookup table
-- This table stores the session times that can be selected during scheduling

CREATE TABLE Session_Times_Lookup (
    ST_ID_PK INT IDENTITY(1,1) PRIMARY KEY,
    ST_Session_Name NVARCHAR(50) NOT NULL,
    ST_Start_Time NVARCHAR(10) NOT NULL,
    ST_Status INT DEFAULT 10,
    ST_Created_Date DATETIME DEFAULT GETDATE(),
    ST_Modified_Date DATETIME DEFAULT GETDATE()
);

-- Insert default session times
INSERT INTO Session_Times_Lookup (ST_Session_Name, ST_Start_Time, ST_Status) VALUES
('1st', '08:00', 10),
('2nd', '12:00', 10),
('3rd', '16:00', 10);

-- Add indexes for better performance
CREATE INDEX IX_Session_Times_Lookup_Status ON Session_Times_Lookup(ST_Status);
CREATE INDEX IX_Session_Times_Lookup_Session_Name ON Session_Times_Lookup(ST_Session_Name);

-- Add comments to describe the table
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Lookup table for dialysis session times used in scheduling', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'Session_Times_Lookup';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Primary key for session time record', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'Session_Times_Lookup',
    @level2type = N'COLUMN', @level2name = N'ST_ID_PK';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Name of the session (e.g., 1st, 2nd, 3rd)', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'Session_Times_Lookup',
    @level2type = N'COLUMN', @level2name = N'ST_Session_Name';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Start time in HH:MM format (e.g., 08:00, 12:00, 16:00)', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'Session_Times_Lookup',
    @level2type = N'COLUMN', @level2name = N'ST_Start_Time';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Status: 10=Active, 0=Inactive', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'Session_Times_Lookup',
    @level2type = N'COLUMN', @level2name = N'ST_Status';

-- Verify the table was created successfully
SELECT 'Session_Times_Lookup table created successfully' AS Result;
SELECT * FROM Session_Times_Lookup;