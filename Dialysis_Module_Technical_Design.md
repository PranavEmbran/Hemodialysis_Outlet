# Dialysis Management Module – Technical Design Document

## Executive Summary

This document outlines the technical design for the Dialysis Management Module within the HODO hospital management system. The module will integrate seamlessly with existing HODO components (patients, appointments, billing, history) while following Gall's Law principles for incremental development.

---

## 1. Database Table Structure & Design Principles

### 1.1 Core Tables

#### `dialysis_sessions`
**Purpose**: Primary table for tracking individual dialysis treatment sessions

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | VARCHAR(50) | PRIMARY KEY | Unique session identifier |
| `patient_id` | VARCHAR(50) | FOREIGN KEY → patients.id | Reference to patient |
| `session_date` | DATE | NOT NULL | Date of treatment |
| `start_time` | TIME | NOT NULL | Session start time |
| `end_time` | TIME | NULL | Session end time |
| `dialysis_unit` | VARCHAR(50) | NOT NULL | Unit where treatment occurred |
| `technician_id` | VARCHAR(50) | FOREIGN KEY → staff.id | Assigned technician |
| `admitting_doctor` | VARCHAR(100) | NOT NULL | Doctor who ordered treatment |
| `status` | ENUM | NOT NULL | 'Scheduled', 'In Progress', 'Completed', 'Cancelled' |
| `session_duration` | INT | NULL | Duration in minutes |
| `treatment_type` | VARCHAR(50) | NOT NULL | 'Hemodialysis', 'Peritoneal' |
| `is_deleted` | TINYINT | DEFAULT 0 | Soft delete flag |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### `dialysis_vitals`
**Purpose**: Store pre and post-dialysis vital signs

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | VARCHAR(50) | PRIMARY KEY | Unique vital record ID |
| `session_id` | VARCHAR(50) | FOREIGN KEY → dialysis_sessions.id | Session reference |
| `vital_type` | ENUM | NOT NULL | 'Pre', 'Post' |
| `blood_pressure` | VARCHAR(20) | NULL | Systolic/Diastolic |
| `heart_rate` | INT | NULL | BPM |
| `temperature` | DECIMAL(4,1) | NULL | Celsius |
| `weight` | DECIMAL(5,2) | NULL | Kilograms |
| `recorded_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Vital recording time |

#### `dialysis_treatment_parameters`
**Purpose**: Store treatment-specific parameters

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | VARCHAR(50) | PRIMARY KEY | Unique parameter record ID |
| `session_id` | VARCHAR(50) | FOREIGN KEY → dialysis_sessions.id | Session reference |
| `dialyzer` | VARCHAR(100) | NULL | Dialyzer used |
| `blood_flow` | INT | NULL | mL/min |
| `dialysate_flow` | INT | NULL | mL/min |
| `ultrafiltration` | DECIMAL(5,2) | NULL | Liters removed |
| `anticoagulant` | VARCHAR(50) | NULL | Type used |
| `anticoagulant_dose` | DECIMAL(5,2) | NULL | Dose in units |

#### `dialysis_machines`
**Purpose**: Track dialysis machine inventory and status

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | VARCHAR(50) | PRIMARY KEY | Machine identifier |
| `machine_name` | VARCHAR(100) | NOT NULL | Machine name/number |
| `dialysis_unit` | VARCHAR(50) | NOT NULL | Unit location |
| `status` | ENUM | NOT NULL | 'Available', 'In Use', 'Maintenance', 'Out of Service' |
| `last_maintenance` | DATE | NULL | Last maintenance date |
| `next_maintenance` | DATE | NULL | Scheduled maintenance |
| `is_active` | TINYINT | DEFAULT 1 | Active status |

### 1.2 Normalization Strategy

**1NF Compliance**: All tables are in 1NF with atomic values
**2NF Compliance**: No partial dependencies on composite keys
**3NF Compliance**: No transitive dependencies

### 1.3 Indexes for Performance

- Primary indexes on patient_id and session_date for fast patient history lookups
- Index on status for filtering active/completed sessions
- Index on dialysis_unit for unit-specific queries
- Composite index on session_id and vital_type for vital signs queries
- Index on machine status and unit for availability queries

### 1.4 Data Integrity Constraints

- Foreign key constraints linking sessions to patients and staff
- Check constraints for session duration (0-480 minutes)
- Check constraints for vital signs ranges (heart rate 0-300, temperature 30-45°C)
- Unique constraints on session_id and vital_type combination
- Not null constraints on required fields

---

## 2. Frontend Workflow Data

### 2.1 Dashboard Data Requirements

**Daily Schedule View**: Combines session data with patient information and machine status for real-time schedule display

**Patient Treatment History**: Aggregates session data with vital signs for comprehensive patient timeline

**Machine Utilization**: Tracks machine status and usage patterns for capacity planning

**Staff Workload**: Monitors technician assignments and workload distribution

### 2.2 Data Joins and Relationships

- Sessions join with patients for patient information
- Sessions join with machines for equipment tracking
- Vitals join with sessions for treatment monitoring
- Treatment parameters join with sessions for detailed analysis

### 2.3 Caching Strategy

- Session data cached for 5 minutes
- Patient history cached for 15 minutes
- Machine status cached for 2 minutes
- Staff schedules cached for 30 minutes

---

## 3. Basic CRUD API Endpoints

### 3.1 Session Management

- GET /api/dialysis/sessions - List all sessions with filtering
- GET /api/dialysis/sessions/:id - Get specific session details
- POST /api/dialysis/sessions - Create new session
- PUT /api/dialysis/sessions/:id - Update session information
- DELETE /api/dialysis/sessions/:id - Soft delete session
- PATCH /api/dialysis/sessions/:id/status - Update session status

### 3.2 Vitals Management

- GET /api/dialysis/sessions/:id/vitals - Get session vital signs
- POST /api/dialysis/sessions/:id/vitals - Add vital signs
- PUT /api/dialysis/sessions/:id/vitals - Update vital signs

### 3.3 Machine Management

- GET /api/dialysis/machines - List all machines with status
- GET /api/dialysis/machines/:id - Get machine details
- PUT /api/dialysis/machines/:id/status - Update machine status

### 3.4 Input Validation and Error Handling

- Required field validation for all session data
- Date and time format validation
- Range validation for vital signs
- Conflict detection for scheduling
- Comprehensive error messages for user feedback

---

## 4. Special Data Endpoints

### 4.1 Reports

- GET /api/dialysis/reports/daily-usage - Daily machine utilization report
- GET /api/dialysis/reports/patient-history - Patient treatment history report
- GET /api/dialysis/reports/outcomes - Treatment outcomes by type
- GET /api/dialysis/reports/machine-status - Machine availability report

### 4.2 Analytics

- GET /api/dialysis/analytics/utilization - Machine utilization trends
- GET /api/dialysis/analytics/outcomes - Treatment success rates
- GET /api/dialysis/analytics/workload - Staff workload distribution

### 4.3 Drill-down Data

- GET /api/dialysis/patients/:id/timeline - Complete patient timeline
- GET /api/dialysis/sessions/:id/details - Detailed session information
- GET /api/dialysis/units/:id/performance - Unit performance metrics

---

## 5. Request and Response JSON

### 5.1 Create Session Request

Session creation requires patient ID, date, time, unit, treatment type, and technician assignment with optional remarks.

### 5.2 Session Response

Response includes session ID, patient information, scheduling details, status, and timestamps.

### 5.3 Error Response Format

Standardized error responses include error code, message, and detailed field-specific validation errors.

### 5.4 Pagination Strategy

- Default page size of 20 records
- Cursor-based pagination for large datasets
- Metadata includes total count and page information

---

## 6. System Impact Across HODO

### 6.1 Billing Integration

- Automatic billing record creation when sessions complete
- Integration with existing billing table structure
- Automatic charge calculation based on treatment type
- Status synchronization between dialysis and billing systems

### 6.2 EMR Integration

- Vital signs automatically sync to patient EMR
- Treatment history appears in patient medical records
- Session details integrated with existing history table
- Real-time updates to patient health records

### 6.3 Appointment Integration

- Dialysis sessions appear in appointment calendar
- Conflict detection prevents double-booking
- Integration with existing appointment system
- Shared scheduling interface

### 6.4 Alerts and Notifications

- Abnormal vital signs trigger automatic alerts
- Missed session notifications for no-show patients
- Machine maintenance alerts for upcoming service
- Staff notification system for schedule changes

---

## 7. Activation / Deactivation

### 7.1 Configuration-Based Activation

Module activation controlled through environment variables and configuration settings with granular feature control.

### 7.2 Graceful Degradation

**When disabled**:
- API endpoints return service unavailable status
- Frontend components display module disabled message
- Existing data remains view-only
- No new sessions can be created

**Database behavior**:
- Existing records remain accessible in read-only mode
- No new records can be created
- Soft delete prevents data loss

### 7.3 Core System Protection

- Independent operation ensures core HODO functions unaffected
- Isolated database structure prevents impact on core tables
- Feature flags provide granular control over module features

---

## 8. Testing Strategy & Development Approach

### 8.1 Unit Testing Strategy

**Database Layer Tests**:
- CRUD operations for all tables
- Constraint validation testing
- Foreign key relationship testing
- Data integrity verification

**API Layer Tests**:
- Endpoint functionality verification
- Input validation testing
- Error handling verification
- Response format validation

**Business Logic Tests**:
- Treatment calculation algorithms
- Scheduling conflict detection
- Billing calculation logic
- Vital signs validation

### 8.2 Integration Testing Strategy

**Module Integration Tests**:
- Dialysis module interaction with existing HODO modules
- Data flow between dialysis and billing systems
- EMR synchronization testing
- Appointment system integration

**End-to-End Flow Tests**:
- Complete patient registration to billing workflow
- Session scheduling to completion process
- Vital signs recording and EMR sync
- Machine assignment and status tracking

### 8.3 Development Approach (Following Gall's Law)

#### Phase 1: Minimal Viable Product (Week 1-2)
**Goal**: Basic patient-session relationship

**Deliverables**:
- Dialysis sessions table creation
- Basic CRUD operations implementation
- Simple session management API
- Basic frontend form for session creation
- Unit tests for all components

#### Phase 2: Scheduling System (Week 3-4)
**Goal**: Add scheduling and workflow

**Deliverables**:
- Dialysis machines table creation
- Scheduling logic implementation
- Conflict detection system
- Schedule dashboard creation
- Integration tests with existing modules

#### Phase 3: Billing Integration (Week 5-6)
**Goal**: Integrate with existing billing system

**Deliverables**:
- Dialysis sessions to billing connection
- Automatic billing trigger implementation
- Billing dashboard creation
- End-to-end workflow testing

#### Phase 4: Advanced Features (Week 7-8)
**Goal**: Analytics and reporting

**Deliverables**:
- Analytics endpoints implementation
- Reporting dashboard creation
- Data export features
- Performance testing completion

### 8.4 Testing Checklist for Each Phase

#### Phase 1 Checklist
- Unit tests pass for session CRUD operations
- Database constraints work correctly
- API endpoints return expected responses
- Frontend form submits data correctly
- Error handling works for invalid data
- Integration with existing patient data works

#### Phase 2 Checklist
- Scheduling logic prevents conflicts
- Machine availability is tracked correctly
- Schedule dashboard displays data correctly
- Integration with existing appointment system works
- Performance tests pass for schedule queries

#### Phase 3 Checklist
- Billing records are created automatically
- Billing amounts are calculated correctly
- Billing dashboard shows dialysis charges
- End-to-end workflow completes successfully
- Data consistency maintained across modules

#### Phase 4 Checklist
- Analytics endpoints return correct data
- Reports generate without errors
- Dashboard performance meets requirements
- All features work together seamlessly
- System handles expected load

### 8.5 Continuous Testing Strategy

- Automated tests run on every commit
- Integration tests run before deployment
- Performance tests run weekly
- User acceptance tests run before each phase completion

---

## Conclusion

This technical design provides a solid foundation for the Dialysis Management Module that integrates seamlessly with the existing HODO system. The incremental development approach ensures each component is thoroughly tested before moving to the next phase, following Gall's Law principles.

The module will enhance HODO's capabilities while maintaining system stability and data integrity. Each phase builds upon the previous one, ensuring a robust and reliable dialysis management system. 