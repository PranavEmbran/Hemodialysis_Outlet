import { Router } from 'express';
import {
  getAll, add, deleteById, getPatientsDerivedHandler, getCasePatientsDerivedHandler, searchPatientsHandler, getPatientsPageHandler, getSchedulesAssignedHandler, addSchedulesAssignedHandler, getCaseOpeningsHandler, addCaseOpeningHandler, updateCaseOpeningHandler,
  savePredialysisRecord, saveStartDialysisRecord, saveInProcessRecord, savePostDialysisRecord,
  getPredialysisRecords, getStartDialysisRecords, getPostDialysisRecords,
  updatePredialysisRecord, updateStartDialysisRecord, updatePostDialysisRecord,
  getUnits, addUnit, updateUnit, deleteUnit,
  getVascularAccesses, addVascularAccess, updateVascularAccess, deleteVascularAccess,
  getSessionTimes, addSessionTime, updateSessionTime, deleteSessionTime,
  updateDialysisScheduleStatus, checkScheduleConflict, getScheduleWithRelatedRecords, getAllSchedulesWithRelatedRecords,
  getDialyzerTypes, addDialyzerType, updateDialyzerType, deleteDialyzerType,
  getSchedulingLookup, addSchedulingLookup, updateSchedulingLookup, deleteSchedulingLookup
} from '../controllers/dataController.js';

const router = Router();

// ==================== GENERAL DATA ENDPOINTS ====================

/**
 * @swagger
 * /api/data:
 *   get:
 *     tags:
 *       - General Data
 *     summary: Get all data items
 *     description: Retrieve a list of all data items in the system
 *     responses:
 *       200:
 *         description: List of all items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *             example:
 *               - id: "1"
 *                 name: "Sample Item"
 *                 createdAt: "2024-01-01T00:00:00Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/data:
 *   post:
 *     tags:
 *       - General Data
 *     summary: Create a new data item
 *     description: Add a new data item to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemInput'
 *           example:
 *             name: "New Item"
 *             description: "Item description"
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *             example:
 *               id: "123"
 *               name: "New Item"
 *               description: "Item description"
 *               createdAt: "2024-01-01T00:00:00Z"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', add);

/**
 * @swagger
 * /api/data/{id}:
 *   delete:
 *     tags:
 *       - General Data
 *     summary: Delete a data item by ID
 *     description: Remove a specific data item from the system using its unique identifier
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the data item to delete
 *         example: "123"
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Item deleted successfully"
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', deleteById);


// ==================== PATIENT MANAGEMENT ENDPOINTS ====================

/**
 * @swagger
 * /api/data/patients_derived:
 *   get:
 *     tags:
 *       - Patients
 *     summary: Get derived patient data
 *     description: Retrieve a list of derived patient data, limited to the 50 most recent patients for performance optimization
 *     responses:
 *       200:
 *         description: List of derived patients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Patient'
 *             example:
 *               - id: "P001"
 *                 Name: "John Doe"
 *                 Age: 45
 *                 Gender: "Male"
 *                 Phone: "+1234567890"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/patients_derived', getPatientsDerivedHandler);

/**
 * @swagger
 * /api/data/case_patients_derived:
 *   get:
 *     tags:
 *       - Patients
 *     summary: Get derived case patient data
 *     description: Retrieve a list of derived case patient data, limited to the 50 most recent patients with active cases
 *     responses:
 *       200:
 *         description: List of derived case patients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Patient'
 *             example:
 *               - id: "P001"
 *                 Name: "John Doe"
 *                 Age: 45
 *                 Gender: "Male"
 *                 Phone: "+1234567890"
 *                 caseStatus: "Active"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/case_patients_derived', getCasePatientsDerivedHandler);



/**
 * @swagger
 * /api/data/patients/search:
 *   get:
 *     tags:
 *       - Patients
 *     summary: Search patients by name
 *     description: Search for patients using a name query with configurable result limits
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search term for patient name (minimum 2 characters required)
 *         example: "John"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of results to return
 *         example: 20
 *     responses:
 *       200:
 *         description: List of matching patients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Patient'
 *             example:
 *               - id: "P001"
 *                 Name: "John Doe"
 *                 Age: 45
 *                 Gender: "Male"
 *               - id: "P002"
 *                 Name: "John Smith"
 *                 Age: 52
 *                 Gender: "Male"
 *       400:
 *         description: Invalid search parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Search term must be at least 2 characters long"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/patients/search', searchPatientsHandler);

/**
 * @swagger
 * /api/data/patients/page:
 *   get:
 *     tags:
 *       - Patients
 *     summary: Get paginated patient data
 *     description: Retrieve patients with pagination support for efficient data loading
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number to retrieve
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Number of patients per page
 *         example: 50
 *     responses:
 *       200:
 *         description: Paginated patient data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patients:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Patient'
 *                 totalCount:
 *                   type: integer
 *                   description: Total number of patients in the system
 *                 hasMore:
 *                   type: boolean
 *                   description: Whether there are more pages available
 *             example:
 *               patients:
 *                 - id: "P001"
 *                   Name: "John Doe"
 *                   Age: 45
 *               totalCount: 150
 *               hasMore: true
 *       400:
 *         description: Invalid pagination parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/patients/page', getPatientsPageHandler);
// ==================== DIALYSIS SCHEDULING ENDPOINTS ====================

/**
 * @swagger
 * /api/data/Dialysis_Schedules:
 *   get:
 *     tags:
 *       - Dialysis Schedules
 *     summary: Get all assigned dialysis schedules
 *     description: Retrieve a list of all assigned dialysis schedules in the system
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter schedules by patient ID
 *         example: "P001"
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter schedules by specific date (YYYY-MM-DD)
 *         example: "2024-01-15"
 *     responses:
 *       200:
 *         description: List of assigned schedules retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DialysisSchedule'
 *             example:
 *               - DS_ID_PK: "DS001"
 *                 DS_P_ID_FK: "P001"
 *                 DS_Date: "2024-01-15"
 *                 DS_Time: "08:00:00"
 *                 DS_Status: 10
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/Dialysis_Schedules', getSchedulesAssignedHandler);

/**
 * @swagger
 * /api/data/Dialysis_Schedules:
 *   post:
 *     tags:
 *       - Dialysis Schedules
 *     summary: Create new dialysis schedules
 *     description: Add one or more new dialysis schedules to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/DialysisScheduleInput'
 *           example:
 *             - DS_P_ID_FK: "P001"
 *               DS_Date: "2024-01-15"
 *               DS_Time: "08:00:00"
 *               DS_Status: 10
 *             - DS_P_ID_FK: "P001"
 *               DS_Date: "2024-01-17"
 *               DS_Time: "08:00:00"
 *               DS_Status: 10
 *     responses:
 *       201:
 *         description: Dialysis schedules created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DialysisSchedule'
 *       400:
 *         description: Invalid schedule data or scheduling conflict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/Dialysis_Schedules', addSchedulesAssignedHandler);
// ==================== CASE MANAGEMENT ENDPOINTS ====================

/**
 * @swagger
 * /api/data/case_openings:
 *   get:
 *     tags:
 *       - Case Management
 *     summary: Get all case openings
 *     description: Retrieve a list of all case openings in the system
 *     responses:
 *       200:
 *         description: List of case openings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CaseOpening'
 *             example:
 *               - DCO_ID_PK: "CO001"
 *                 DCO_P_ID_FK: "P001"
 *                 DCO_Added_On: "2024-01-01T10:00:00Z"
 *                 DCO_Status: "Active"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/case_openings', getCaseOpeningsHandler);

/**
 * @swagger
 * /api/data/case_openings:
 *   post:
 *     tags:
 *       - Case Management
 *     summary: Create a new case opening
 *     description: Add a new case opening for a patient
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CaseOpeningInput'
 *           example:
 *             DCO_P_ID_FK: "P001"
 *             DCO_Status: "Active"
 *             DCO_Notes: "Initial case opening for dialysis treatment"
 *     responses:
 *       201:
 *         description: Case opening created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CaseOpening'
 *             example:
 *               DCO_ID_PK: "CO001"
 *               DCO_P_ID_FK: "P001"
 *               DCO_Added_On: "2024-01-01T10:00:00Z"
 *               DCO_Status: "Active"
 *       400:
 *         description: Invalid case opening data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/case_openings', addCaseOpeningHandler);

/**
 * @swagger
 * /api/data/case_openings/patient/{patientId}/{caseOpeningId}:
 *   put:
 *     tags:
 *       - Case Management
 *     summary: Update a case opening
 *     description: Update an existing case opening for a specific patient
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the patient
 *         example: "P001"
 *       - in: path
 *         name: caseOpeningId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the case opening
 *         example: "CO001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CaseOpeningInput'
 *           example:
 *             DCO_Status: "Closed"
 *             DCO_Notes: "Case closed - treatment completed"
 *     responses:
 *       200:
 *         description: Case opening updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CaseOpening'
 *       400:
 *         description: Invalid case opening data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Case opening not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/case_openings/patient/:patientId/:caseOpeningId', updateCaseOpeningHandler);
// ==================== DIALYSIS RECORDS ENDPOINTS ====================

/**
 * @swagger
 * /api/data/predialysis_record:
 *   post:
 *     tags:
 *       - Dialysis Records
 *     summary: Create a predialysis record
 *     description: Save a new predialysis record with patient vitals and pre-treatment information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PredialysisRecordInput'
 *           example:
 *             patientId: "P001"
 *             scheduleId: "DS001"
 *             bloodPressure: "140/90"
 *             weight: 75.5
 *             temperature: 36.8
 *             pulse: 80
 *     responses:
 *       201:
 *         description: Predialysis record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PredialysisRecord'
 *       400:
 *         description: Invalid predialysis record data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/predialysis_record', savePredialysisRecord);

/**
 * @swagger
 * /api/data/start_dialysis_record:
 *   post:
 *     tags:
 *       - Dialysis Records
 *     summary: Create a start dialysis record
 *     description: Save a new start dialysis record with treatment initiation parameters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartDialysisRecordInput'
 *           example:
 *             patientId: "P001"
 *             scheduleId: "DS001"
 *             dialyzerType: "F8"
 *             bloodFlow: 300
 *             dialysateFlow: 500
 *             startTime: "08:00:00"
 *     responses:
 *       201:
 *         description: Start dialysis record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StartDialysisRecord'
 *       400:
 *         description: Invalid start dialysis record data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/start_dialysis_record', saveStartDialysisRecord);

/**
 * @swagger
 * /api/data/inprocess_record:
 *   post:
 *     tags:
 *       - Dialysis Records
 *     summary: Create an in-process dialysis record
 *     description: Save a new in-process record with ongoing treatment monitoring data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InProcessRecordInput'
 *           example:
 *             patientId: "P001"
 *             scheduleId: "DS001"
 *             bloodPressure: "130/85"
 *             pulse: 75
 *             fluidRemoval: 2.5
 *             recordTime: "09:30:00"
 *     responses:
 *       201:
 *         description: In-process record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InProcessRecord'
 *       400:
 *         description: Invalid in-process record data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/inprocess_record', saveInProcessRecord);

/**
 * @swagger
 * /api/data/post_dialysis_record:
 *   post:
 *     tags:
 *       - Dialysis Records
 *     summary: Create a post-dialysis record
 *     description: Save a new post-dialysis record with treatment completion information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostDialysisRecordInput'
 *           example:
 *             patientId: "P001"
 *             scheduleId: "DS001"
 *             finalWeight: 73.0
 *             totalFluidRemoved: 2.5
 *             bloodPressure: "120/80"
 *             endTime: "12:00:00"
 *     responses:
 *       201:
 *         description: Post-dialysis record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostDialysisRecord'
 *       400:
 *         description: Invalid post-dialysis record data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/post_dialysis_record', savePostDialysisRecord);
/**
 * @swagger
 * /api/data/predialysis_records:
 *   get:
 *     tags:
 *       - Dialysis Records
 *     summary: Get all predialysis records
 *     description: Retrieve a list of all predialysis records in the system
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter records by patient ID
 *         example: "P001"
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records by specific date (YYYY-MM-DD)
 *         example: "2024-01-15"
 *     responses:
 *       200:
 *         description: List of predialysis records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PredialysisRecord'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/predialysis_records', getPredialysisRecords);

/**
 * @swagger
 * /api/data/start_dialysis_records:
 *   get:
 *     tags:
 *       - Dialysis Records
 *     summary: Get all start dialysis records
 *     description: Retrieve a list of all start dialysis records in the system
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter records by patient ID
 *         example: "P001"
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records by specific date (YYYY-MM-DD)
 *         example: "2024-01-15"
 *     responses:
 *       200:
 *         description: List of start dialysis records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StartDialysisRecord'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/start_dialysis_records', getStartDialysisRecords);

/**
 * @swagger
 * /api/data/post_dialysis_records:
 *   get:
 *     tags:
 *       - Dialysis Records
 *     summary: Get all post-dialysis records
 *     description: Retrieve a list of all post-dialysis records in the system
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter records by patient ID
 *         example: "P001"
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records by specific date (YYYY-MM-DD)
 *         example: "2024-01-15"
 *     responses:
 *       200:
 *         description: List of post-dialysis records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostDialysisRecord'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/post_dialysis_records', getPostDialysisRecords);
/**
 * @swagger
 * /api/data/predialysis_record:
 *   put:
 *     tags:
 *       - Dialysis Records
 *     summary: Update a predialysis record
 *     description: Update an existing predialysis record with new vitals and pre-treatment information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PredialysisRecordInput'
 *           example:
 *             id: "PR001"
 *             bloodPressure: "135/88"
 *             weight: 75.8
 *             temperature: 37.0
 *             pulse: 82
 *     responses:
 *       200:
 *         description: Predialysis record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PredialysisRecord'
 *       400:
 *         description: Invalid predialysis record data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Predialysis record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/predialysis_record', updatePredialysisRecord);

/**
 * @swagger
 * /api/data/start_dialysis_record:
 *   put:
 *     tags:
 *       - Dialysis Records
 *     summary: Update a start dialysis record
 *     description: Update an existing start dialysis record with modified treatment parameters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartDialysisRecordInput'
 *           example:
 *             id: "SDR001"
 *             dialyzerType: "F10"
 *             bloodFlow: 320
 *             dialysateFlow: 520
 *     responses:
 *       200:
 *         description: Start dialysis record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StartDialysisRecord'
 *       400:
 *         description: Invalid start dialysis record data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Start dialysis record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/start_dialysis_record', updateStartDialysisRecord);

/**
 * @swagger
 * /api/data/post_dialysis_record:
 *   put:
 *     tags:
 *       - Dialysis Records
 *     summary: Update a post-dialysis record
 *     description: Update an existing post-dialysis record with modified completion information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostDialysisRecordInput'
 *           example:
 *             id: "PDR001"
 *             finalWeight: 72.8
 *             totalFluidRemoved: 2.7
 *             bloodPressure: "118/78"
 *     responses:
 *       200:
 *         description: Post-dialysis record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostDialysisRecord'
 *       400:
 *         description: Invalid post-dialysis record data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post-dialysis record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/post_dialysis_record', updatePostDialysisRecord);

// ==================== MASTER DATA MANAGEMENT ENDPOINTS ====================

/**
 * @swagger
 * /api/data/units:
 *   get:
 *     tags:
 *       - Units Management
 *     summary: Get all dialysis units
 *     description: Retrieve a list of all dialysis units in the facility
 *     responses:
 *       200:
 *         description: List of units retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Unit'
 *             example:
 *               - Unit_ID_PK: "U001"
 *                 Unit_Name: "Unit A"
 *                 Unit_Status: "Free"
 *                 Unit_Technitian_Assigned: "John Doe"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/units', getUnits);

/**
 * @swagger
 * /api/data/units:
 *   post:
 *     tags:
 *       - Units Management
 *     summary: Create a new dialysis unit
 *     description: Add a new dialysis unit to the facility
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnitInput'
 *           example:
 *             Unit_Name: "Unit B"
 *             Unit_Status: "Free"
 *             Unit_Planned_Maintainance_DT: "2024-02-01T10:00:00Z"
 *             Unit_Technitian_Assigned: "Jane Smith"
 *     responses:
 *       201:
 *         description: Unit created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unit'
 *       400:
 *         description: Invalid unit data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/units', addUnit);

/**
 * @swagger
 * /api/data/units:
 *   put:
 *     tags:
 *       - Units Management
 *     summary: Update a dialysis unit
 *     description: Update an existing dialysis unit's information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnitInput'
 *           example:
 *             Unit_ID_PK: "U001"
 *             Unit_Name: "Unit A - Updated"
 *             Unit_Status: "Engaged"
 *             Unit_Technitian_Assigned: "John Doe"
 *     responses:
 *       200:
 *         description: Unit updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unit'
 *       400:
 *         description: Invalid unit data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Unit not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/units', updateUnit);

/**
 * @swagger
 * /api/data/units/{id}:
 *   delete:
 *     tags:
 *       - Units Management
 *     summary: Delete a dialysis unit
 *     description: Remove a dialysis unit from the facility
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the unit to delete
 *         example: "U001"
 *     responses:
 *       200:
 *         description: Unit deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unit deleted successfully"
 *       404:
 *         description: Unit not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/units/:id', deleteUnit);

/**
 * @swagger
 * /api/data/vascular_access:
 *   get:
 *     tags:
 *       - Vascular Access Management
 *     summary: Get all vascular access types
 *     description: Retrieve a list of all vascular access types available for dialysis
 *     responses:
 *       200:
 *         description: List of vascular access types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VascularAccess'
 *             example:
 *               - VAL_Access_ID_PK: "VA001"
 *                 VAL_Access_Type: "Fistula"
 *               - VAL_Access_ID_PK: "VA002"
 *                 VAL_Access_Type: "Graft"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/vascular_access', getVascularAccesses);

/**
 * @swagger
 * /api/data/vascular_access:
 *   post:
 *     tags:
 *       - Vascular Access Management
 *     summary: Create a new vascular access type
 *     description: Add a new vascular access type to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VascularAccessInput'
 *           example:
 *             VAL_Access_Type: "Central Catheter"
 *     responses:
 *       201:
 *         description: Vascular access type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VascularAccess'
 *       400:
 *         description: Invalid vascular access data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/vascular_access', addVascularAccess);

/**
 * @swagger
 * /api/data/vascular_access:
 *   put:
 *     tags:
 *       - Vascular Access Management
 *     summary: Update a vascular access type
 *     description: Update an existing vascular access type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VascularAccessInput'
 *           example:
 *             VAL_Access_ID_PK: "VA001"
 *             VAL_Access_Type: "AV Fistula"
 *     responses:
 *       200:
 *         description: Vascular access type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VascularAccess'
 *       400:
 *         description: Invalid vascular access data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Vascular access type not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/vascular_access', updateVascularAccess);

/**
 * @swagger
 * /api/data/vascular_access/{id}:
 *   delete:
 *     tags:
 *       - Vascular Access Management
 *     summary: Delete a vascular access type
 *     description: Remove a vascular access type from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the vascular access type to delete
 *         example: "VA001"
 *     responses:
 *       200:
 *         description: Vascular access type deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vascular access type deleted successfully"
 *       404:
 *         description: Vascular access type not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/vascular_access/:id', deleteVascularAccess);

/**
 * @swagger
 * /api/data/dialyzer_types:
 *   get:
 *     tags:
 *       - Dialyzer Management
 *     summary: Get all dialyzer types
 *     description: Retrieve a list of all dialyzer types available for dialysis treatments
 *     responses:
 *       200:
 *         description: List of dialyzer types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DialyzerType'
 *             example:
 *               - DTL_Dialyzer_ID_PK: "DT001"
 *                 DTL_Dialyzer_Type: "F8"
 *               - DTL_Dialyzer_ID_PK: "DT002"
 *                 DTL_Dialyzer_Type: "F10"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/dialyzer_types', getDialyzerTypes);

/**
 * @swagger
 * /api/data/dialyzer_types:
 *   post:
 *     tags:
 *       - Dialyzer Management
 *     summary: Create a new dialyzer type
 *     description: Add a new dialyzer type to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DialyzerTypeInput'
 *           example:
 *             DTL_Dialyzer_Type: "F12"
 *     responses:
 *       201:
 *         description: Dialyzer type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DialyzerType'
 *       400:
 *         description: Invalid dialyzer type data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/dialyzer_types', addDialyzerType);

/**
 * @swagger
 * /api/data/dialyzer_types:
 *   put:
 *     tags:
 *       - Dialyzer Management
 *     summary: Update a dialyzer type
 *     description: Update an existing dialyzer type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DialyzerTypeInput'
 *           example:
 *             DTL_Dialyzer_ID_PK: "DT001"
 *             DTL_Dialyzer_Type: "F8 High Flux"
 *     responses:
 *       200:
 *         description: Dialyzer type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DialyzerType'
 *       400:
 *         description: Invalid dialyzer type data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Dialyzer type not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/dialyzer_types', updateDialyzerType);

/**
 * @swagger
 * /api/data/dialyzer_types/{id}:
 *   delete:
 *     tags:
 *       - Dialyzer Management
 *     summary: Delete a dialyzer type
 *     description: Remove a dialyzer type from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the dialyzer type to delete
 *         example: "DT001"
 *     responses:
 *       200:
 *         description: Dialyzer type deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dialyzer type deleted successfully"
 *       404:
 *         description: Dialyzer type not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/dialyzer_types/:id', deleteDialyzerType);

/**
 * @swagger
 * /api/data/scheduling_lookup:
 *   get:
 *     tags:
 *       - Scheduling Configuration
 *     summary: Get scheduling lookup configuration
 *     description: Retrieve scheduling configuration parameters including working hours, days, and unit capacity
 *     responses:
 *       200:
 *         description: Scheduling lookup configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SchedulingLookup'
 *             example:
 *               - id: 1
 *                 SL_No_of_units: 5
 *                 SL_Working_hrs: 15.0
 *                 SL_Working_days: 7
 *                 SL_Pre_dialysis_time: 1.0
 *                 SL_Dialysis_Session_Time: 5.0
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/scheduling_lookup', getSchedulingLookup);

/**
 * @swagger
 * /api/data/scheduling_lookup:
 *   post:
 *     tags:
 *       - Scheduling Configuration
 *     summary: Create scheduling lookup configuration
 *     description: Add new scheduling configuration parameters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchedulingLookupInput'
 *           example:
 *             SL_No_of_units: 6
 *             SL_Working_hrs: 16.0
 *             SL_Working_days: 6
 *             SL_Pre_dialysis_time: 1.0
 *             SL_Dialysis_Session_Time: 4.5
 *     responses:
 *       201:
 *         description: Scheduling lookup configuration created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchedulingLookup'
 *       400:
 *         description: Invalid scheduling configuration data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/scheduling_lookup', addSchedulingLookup);

/**
 * @swagger
 * /api/data/scheduling_lookup:
 *   put:
 *     tags:
 *       - Scheduling Configuration
 *     summary: Update scheduling lookup configuration
 *     description: Update existing scheduling configuration parameters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchedulingLookupInput'
 *           example:
 *             id: 1
 *             SL_No_of_units: 5
 *             SL_Working_hrs: 14.0
 *             SL_Working_days: 6
 *     responses:
 *       200:
 *         description: Scheduling lookup configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchedulingLookup'
 *       400:
 *         description: Invalid scheduling configuration data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Scheduling lookup configuration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/scheduling_lookup', updateSchedulingLookup);

/**
 * @swagger
 * /api/data/scheduling_lookup/{id}:
 *   delete:
 *     tags:
 *       - Scheduling Configuration
 *     summary: Delete scheduling lookup configuration
 *     description: Remove a scheduling lookup configuration from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the scheduling lookup configuration to delete
 *         example: "1"
 *     responses:
 *       200:
 *         description: Scheduling lookup configuration deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Scheduling lookup configuration deleted successfully"
 *       404:
 *         description: Scheduling lookup configuration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/scheduling_lookup/:id', deleteSchedulingLookup);

/**
 * @swagger
 * /api/data/session_times:
 *   get:
 *     tags:
 *       - Session Time Management
 *     summary: Get all session times
 *     description: Retrieve a list of all available session times for dialysis scheduling
 *     responses:
 *       200:
 *         description: List of session times retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SessionTime'
 *             example:
 *               - ST_Session_ID_PK: "ST001"
 *                 ST_Session_Name: "Morning"
 *                 ST_Start_Time: "08:00:00"
 *                 ST_End_Time: "12:00:00"
 *               - ST_Session_ID_PK: "ST002"
 *                 ST_Session_Name: "Afternoon"
 *                 ST_Start_Time: "13:00:00"
 *                 ST_End_Time: "17:00:00"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/session_times', getSessionTimes);

/**
 * @swagger
 * /api/data/session_times:
 *   post:
 *     tags:
 *       - Session Time Management
 *     summary: Create a new session time
 *     description: Add a new session time slot for dialysis scheduling
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SessionTimeInput'
 *           example:
 *             ST_Session_Name: "Evening"
 *             ST_Start_Time: "18:00:00"
 *             ST_End_Time: "22:00:00"
 *     responses:
 *       201:
 *         description: Session time created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionTime'
 *       400:
 *         description: Invalid session time data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/session_times', addSessionTime);

/**
 * @swagger
 * /api/data/session_times:
 *   put:
 *     tags:
 *       - Session Time Management
 *     summary: Update a session time
 *     description: Update an existing session time slot
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SessionTimeInput'
 *           example:
 *             ST_Session_ID_PK: "ST001"
 *             ST_Session_Name: "Early Morning"
 *             ST_Start_Time: "07:00:00"
 *             ST_End_Time: "11:00:00"
 *     responses:
 *       200:
 *         description: Session time updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionTime'
 *       400:
 *         description: Invalid session time data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Session time not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/session_times', updateSessionTime);

/**
 * @swagger
 * /api/data/session_times/{id}:
 *   delete:
 *     tags:
 *       - Session Time Management
 *     summary: Delete a session time
 *     description: Remove a session time slot from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the session time to delete
 *         example: "ST001"
 *     responses:
 *       200:
 *         description: Session time deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Session time deleted successfully"
 *       404:
 *         description: Session time not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/session_times/:id', deleteSessionTime);

// ==================== ADVANCED SCHEDULE MANAGEMENT ENDPOINTS ====================

/**
 * @swagger
 * /api/data/dialysis_schedules/{scheduleId}/status:
 *   put:
 *     tags:
 *       - Dialysis Schedules
 *     summary: Update dialysis schedule status
 *     description: Update the status of a specific dialysis schedule (cancel, reschedule, etc.)
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the schedule to update
 *         example: "DS001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: integer
 *                 enum: [0, 10]
 *                 description: Schedule status (0 = cancelled, 10 = scheduled)
 *             required:
 *               - status
 *           example:
 *             status: 0
 *     responses:
 *       200:
 *         description: Schedule status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Schedule status updated successfully"
 *                 scheduleId:
 *                   type: string
 *                   example: "DS001"
 *                 newStatus:
 *                   type: integer
 *                   example: 0
 *       400:
 *         description: Invalid status value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Schedule not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/dialysis_schedules/:scheduleId/status', updateDialysisScheduleStatus);

/**
 * @swagger
 * /api/data/dialysis_schedules/check-conflict:
 *   get:
 *     tags:
 *       - Dialysis Schedules
 *     summary: Check for scheduling conflicts
 *     description: Check if a proposed schedule time conflicts with existing schedules or unit capacity
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check for conflicts (YYYY-MM-DD format)
 *         example: "2024-01-15"
 *       - in: query
 *         name: time
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *         description: Time to check for conflicts (HH:MM format)
 *         example: "08:00"
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: string
 *         description: Specific unit ID to check (optional)
 *         example: "U001"
 *     responses:
 *       200:
 *         description: Conflict check completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasConflict:
 *                   type: boolean
 *                   description: Whether there is a scheduling conflict
 *                 availableUnits:
 *                   type: integer
 *                   description: Number of available units at the specified time
 *                 totalUnits:
 *                   type: integer
 *                   description: Total number of units in the facility
 *                 conflictDetails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       unitId:
 *                         type: string
 *                       patientId:
 *                         type: string
 *                       scheduleId:
 *                         type: string
 *             example:
 *               hasConflict: false
 *               availableUnits: 3
 *               totalUnits: 5
 *               conflictDetails: []
 *       400:
 *         description: Invalid date or time format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/dialysis_schedules/check-conflict', checkScheduleConflict);

/**
 * @swagger
 * /api/data/dialysis_schedules/{scheduleId}/with-records:
 *   get:
 *     tags:
 *       - Dialysis Schedules
 *     summary: Get schedule with related treatment records
 *     description: Retrieve a specific schedule along with all related treatment records (pre-dialysis, start, in-process, post-dialysis)
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the schedule
 *         example: "DS001"
 *     responses:
 *       200:
 *         description: Schedule with related records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schedule:
 *                   $ref: '#/components/schemas/DialysisSchedule'
 *                 predialysisRecord:
 *                   $ref: '#/components/schemas/PredialysisRecord'
 *                 startDialysisRecord:
 *                   $ref: '#/components/schemas/StartDialysisRecord'
 *                 inProcessRecords:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InProcessRecord'
 *                 postDialysisRecord:
 *                   $ref: '#/components/schemas/PostDialysisRecord'
 *                 computedStatus:
 *                   type: string
 *                   enum: ["Scheduled", "Arrived", "Initiated", "Completed", "Cancelled", "Missed"]
 *       404:
 *         description: Schedule not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/dialysis_schedules/:scheduleId/with-records', getScheduleWithRelatedRecords);

/**
 * @swagger
 * /api/data/dialysis_schedules/with-records:
 *   get:
 *     tags:
 *       - Dialysis Schedules
 *     summary: Get all schedules with related treatment records
 *     description: Retrieve all schedules along with their related treatment records and computed status
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter schedules by patient ID
 *         example: "P001"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["Scheduled", "Arrived", "Initiated", "Completed", "Cancelled", "Missed"]
 *         description: Filter schedules by computed status
 *         example: "Completed"
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter schedules from this date (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter schedules to this date (YYYY-MM-DD)
 *         example: "2024-01-31"
 *     responses:
 *       200:
 *         description: All schedules with related records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   DS_ID_PK:
 *                     type: string
 *                   DS_P_ID_FK:
 *                     type: string
 *                   DS_Date:
 *                     type: string
 *                     format: date
 *                   DS_Time:
 *                     type: string
 *                   DS_Status:
 *                     type: integer
 *                   computed_status:
 *                     type: string
 *                     enum: ["Scheduled", "Arrived", "Initiated", "Completed", "Cancelled", "Missed"]
 *                   PatientName:
 *                     type: string
 *                   hasRecords:
 *                     type: object
 *                     properties:
 *                       predialysis:
 *                         type: boolean
 *                       startDialysis:
 *                         type: boolean
 *                       inProcess:
 *                         type: boolean
 *                       postDialysis:
 *                         type: boolean
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/dialysis_schedules/with-records', getAllSchedulesWithRelatedRecords);

export default router; 