import { Router } from 'express';
import {
  getAll, add, deleteById, getPatientsDerivedHandler, searchPatientsHandler, getPatientsPageHandler, getSchedulesAssignedHandler, addSchedulesAssignedHandler, getCaseOpeningsHandler, addCaseOpeningHandler, updateCaseOpeningHandler,
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

/**
 * @swagger
 * /api/data:
 *   get:
 *     summary: Get all items
 *     responses:
 *       200:
 *         description: List of all items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get('/', getAll);
/**
 * @swagger
 * /api/data:
 *   post:
 *     summary: Add a new item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemInput'
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 */
router.post('/', add);
/**
 * @swagger
 * /api/data/{id}:
 *   delete:
 *     summary: Delete an item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
 */
router.delete('/:id', deleteById);


/**
 * @swagger
 * /api/data/patients_derived:
 *   get:
 *     summary: Get derived patient data (limited to 50 recent patients)
 *     responses:
 *       200:
 *         description: List of derived patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Patient'
 */
router.get('/patients_derived', getPatientsDerivedHandler);

/**
 * @swagger
 * /api/data/patients/search:
 *   get:
 *     summary: Search patients by name
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search term (minimum 2 characters)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Maximum number of results to return
 *     responses:
 *       200:
 *         description: List of matching patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Invalid search parameters
 */
router.get('/patients/search', searchPatientsHandler);

/**
 * @swagger
 * /api/data/patients/page:
 *   get:
 *     summary: Get paginated patient data
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Number of patients per page
 *     responses:
 *       200:
 *         description: Paginated patient data
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
 *                   description: Total number of patients
 *                 hasMore:
 *                   type: boolean
 *                   description: Whether there are more pages available
 *       400:
 *         description: Invalid pagination parameters
 */
router.get('/patients/page', getPatientsPageHandler);
/**
 * @swagger
 * /api/data/Dialysis_Schedules:
 *   get:
 *     summary: Get assigned schedules
 *     responses:
 *       200:
 *         description: List of assigned schedules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DialysisSchedules'
 */
router.get('/Dialysis_Schedules', getSchedulesAssignedHandler);
/**
 * @swagger
 * /api/data/Dialysis_Schedules:
 *   post:
 *     summary: Add assigned schedules
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/DialysisSchedules'
 *     responses:
 *       200:
 *         description: Assigned schedules added
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DialysisSchedules'
 */
router.post('/Dialysis_Schedules', addSchedulesAssignedHandler);
/**
 * @swagger
 * /api/data/case_openings:
 *   get:
 *     summary: Get case openings
 *     responses:
 *       200:
 *         description: List of case openings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CaseOpening'
 */
router.get('/case_openings', getCaseOpeningsHandler);
/**
 * @swagger
 * /api/data/case_openings:
 *   post:
 *     summary: Add a case opening
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CaseOpeningInput'
 *     responses:
 *       201:
 *         description: Case opening added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CaseOpening'
 */
router.post('/case_openings', addCaseOpeningHandler);
/**
 * @swagger
 * /api/data/case_openings/patient/{patientId}/{caseOpeningId}:
 *   put:
 *     summary: Update a case opening
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The patient ID
 *       - in: path
 *         name: caseOpeningId
 *         required: true
 *         schema:
 *           type: string
 *         description: The case opening ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CaseOpeningInput'
 *     responses:
 *       200:
 *         description: Case opening updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CaseOpening'
 *       404:
 *         description: Case opening not found
 */
router.put('/case_openings/patient/:patientId/:caseOpeningId', updateCaseOpeningHandler);
/**
 * @swagger
 * /api/data/predialysis_record:
 *   post:
 *     summary: Save a predialysis record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PredialysisRecordInput'
 *     responses:
 *       201:
 *         description: Predialysis record saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PredialysisRecord'
 */
router.post('/predialysis_record', savePredialysisRecord);
/**
 * @swagger
 * /api/data/start_dialysis_record:
 *   post:
 *     summary: Save a start dialysis record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartDialysisRecordInput'
 *     responses:
 *       201:
 *         description: Start dialysis record saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StartDialysisRecord'
 */
router.post('/start_dialysis_record', saveStartDialysisRecord);
/**
 * @swagger
 * /api/data/inprocess_record:
 *   post:
 *     summary: Save an in-process record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InProcessRecordInput'
 *     responses:
 *       201:
 *         description: In-process record saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InProcessRecord'
 */
router.post('/inprocess_record', saveInProcessRecord);
/**
 * @swagger
 * /api/data/post_dialysis_record:
 *   post:
 *     summary: Save a post dialysis record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostDialysisRecordInput'
 *     responses:
 *       201:
 *         description: Post dialysis record saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostDialysisRecord'
 */
router.post('/post_dialysis_record', savePostDialysisRecord);
/**
 * @swagger
 * /api/data/predialysis_records:
 *   get:
 *     summary: Get all predialysis records
 *     responses:
 *       200:
 *         description: List of predialysis records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PredialysisRecord'
 */
router.get('/predialysis_records', getPredialysisRecords);
/**
 * @swagger
 * /api/data/start_dialysis_records:
 *   get:
 *     summary: Get all start dialysis records
 *     responses:
 *       200:
 *         description: List of start dialysis records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StartDialysisRecord'
 */
router.get('/start_dialysis_records', getStartDialysisRecords);
/**
 * @swagger
 * /api/data/post_dialysis_records:
 *   get:
 *     summary: Get all post dialysis records
 *     responses:
 *       200:
 *         description: List of post dialysis records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostDialysisRecord'
 */
router.get('/post_dialysis_records', getPostDialysisRecords);
/**
 * @swagger
 * /api/data/predialysis_record:
 *   put:
 *     summary: Update a predialysis record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PredialysisRecordInput'
 *     responses:
 *       200:
 *         description: Predialysis record updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PredialysisRecord'
 */
router.put('/predialysis_record', updatePredialysisRecord);
/**
 * @swagger
 * /api/data/start_dialysis_record:
 *   put:
 *     summary: Update a start dialysis record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartDialysisRecordInput'
 *     responses:
 *       200:
 *         description: Start dialysis record updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StartDialysisRecord'
 */
router.put('/start_dialysis_record', updateStartDialysisRecord);
/**
 * @swagger
 * /api/data/post_dialysis_record:
 *   put:
 *     summary: Update a post dialysis record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostDialysisRecordInput'
 *     responses:
 *       200:
 *         description: Post dialysis record updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostDialysisRecord'
 */
router.put('/post_dialysis_record', updatePostDialysisRecord);

/**
 * @swagger
 * /api/data/units:
 *   get:
 *     summary: Get all units
 *     responses:
 *       200:
 *         description: List of units
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Unit'
 */
router.get('/units', getUnits);
/**
 * @swagger
 * /api/data/units:
 *   post:
 *     summary: Add a unit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnitInput'
 *     responses:
 *       201:
 *         description: Unit added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unit'
 */
router.post('/units', addUnit);
/**
 * @swagger
 * /api/data/units:
 *   put:
 *     summary: Update a unit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnitInput'
 *     responses:
 *       200:
 *         description: Unit updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unit'
 */
router.put('/units', updateUnit);
/**
 * @swagger
 * /api/data/units/{id}:
 *   delete:
 *     summary: Delete a unit by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unit ID
 *     responses:
 *       200:
 *         description: Unit deleted
 *       404:
 *         description: Unit not found
 */
router.delete('/units/:id', deleteUnit);

/**
 * @swagger
 * /api/data/vascular_access:
 *   get:
 *     summary: Get all vascular access
 *     responses:
 *       200:
 *         description: List of vascular access
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VascularAccess'
 */
router.get('/vascular_access', getVascularAccesses);
/**
 * @swagger
 * /api/data/vascular_access:
 *   post:
 *     summary: Add a vascular access
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VascularAccessInput'
 *     responses:
 *       201:
 *         description: Vascular access added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VascularAccess'
 */
router.post('/vascular_access', addVascularAccess);
/**
 * @swagger
 * /api/data/vascular_access:
 *   put:
 *     summary: Update a vascular access
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VascularAccessInput'
 *     responses:
 *       200:
 *         description: Vascular access updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VascularAccess'
 */
router.put('/vascular_access', updateVascularAccess);
/**
 * @swagger
 * /api/data/vascular_access/{id}:
 *   delete:
 *     summary: Delete a vascular access by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The vascular access ID
 *     responses:
 *       200:
 *         description: Vascular access deleted
 *       404:
 *         description: Vascular access not found
 */
router.delete('/vascular_access/:id', deleteVascularAccess);

/**
 * @swagger
 * /api/data/dialyzer_types:
 *   get:
 *     summary: Get all dialyzer types
 *     responses:
 *       200:
 *         description: List of dialyzer types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DialyzerType'
 */
router.get('/dialyzer_types', getDialyzerTypes);
/**
 * @swagger
 * /api/data/dialyzer_types:
 *   post:
 *     summary: Add a dialyzer type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DialyzerTypeInput'
 *     responses:
 *       201:
 *         description: Dialyzer type added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DialyzerType'
 */
router.post('/dialyzer_types', addDialyzerType);
/**
 * @swagger
 * /api/data/dialyzer_types:
 *   put:
 *     summary: Update a dialyzer type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DialyzerTypeInput'
 *     responses:
 *       200:
 *         description: Dialyzer type updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DialyzerType'
 */
router.put('/dialyzer_types', updateDialyzerType);
/**
 * @swagger
 * /api/data/dialyzer_types/{id}:
 *   delete:
 *     summary: Delete a dialyzer type by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The dialyzer type ID
 *     responses:
 *       200:
 *         description: Dialyzer type deleted
 *       404:
 *         description: Dialyzer type not found
 */
router.delete('/dialyzer_types/:id', deleteDialyzerType);

/**
 * @swagger
 * /api/data/scheduling_lookup:
 *   get:
 *     summary: Get all scheduling lookup
 *     responses:
 *       200:
 *         description: List of scheduling lookup
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SchedulingLookup'
 */
router.get('/scheduling_lookup', getSchedulingLookup);
/**
 * @swagger
 * /api/data/scheduling_lookup:
 *   post:
 *     summary: Add a scheduling lookup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchedulingLookupInput'
 *     responses:
 *       201:
 *         description: Scheduling lookup added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchedulingLookup'
 */
router.post('/scheduling_lookup', addSchedulingLookup);
/**
 * @swagger
 * /api/data/scheduling_lookup:
 *   put:
 *     summary: Update a scheduling lookup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchedulingLookupInput'
 *     responses:
 *       200:
 *         description: Scheduling lookup updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchedulingLookup'
 */
router.put('/scheduling_lookup', updateSchedulingLookup);
/**
 * @swagger
 * /api/data/scheduling_lookup/{id}:
 *   delete:
 *     summary: Delete a scheduling lookup by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The scheduling lookup ID
 *     responses:
 *       200:
 *         description: Scheduling lookup deleted
 *       404:
 *         description: Scheduling lookup not found
 */
router.delete('/scheduling_lookup/:id', deleteSchedulingLookup);

/**
 * @swagger
 * /api/data/session_times:
 *   get:
 *     summary: Get all session times
 *     responses:
 *       200:
 *         description: List of session times
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SessionTime'
 */
router.get('/session_times', getSessionTimes);
/**
 * @swagger
 * /api/data/session_times:
 *   post:
 *     summary: Add a session time
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SessionTimeInput'
 *     responses:
 *       201:
 *         description: Session time added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionTime'
 */
router.post('/session_times', addSessionTime);
/**
 * @swagger
 * /api/data/session_times:
 *   put:
 *     summary: Update a session time
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SessionTimeInput'
 *     responses:
 *       200:
 *         description: Session time updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionTime'
 */
router.put('/session_times', updateSessionTime);
/**
 * @swagger
 * /api/data/session_times/{id}:
 *   delete:
 *     summary: Delete a session time by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The session time ID
 *     responses:
 *       200:
 *         description: Session time deleted
 *       404:
 *         description: Session time not found
 */
router.delete('/session_times/:id', deleteSessionTime);

/**
 * @swagger
 * /api/data/dialysis_schedules/{scheduleId}/status:
 *   put:
 *     summary: Update dialysis schedule status
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The schedule ID
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
 *                 description: 0 for cancelled, 10 for scheduled
 *     responses:
 *       200:
 *         description: Schedule status updated successfully
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Schedule not found
 */
router.put('/dialysis_schedules/:scheduleId/status', updateDialysisScheduleStatus);

/**
 * @swagger
 * /api/data/dialysis_schedules/check-conflict:
 *   get:
 *     summary: Check for schedule conflicts
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         description: Date in YYYY-MM-DD format
 *       - in: query
 *         name: time
 *         required: true
 *         schema:
 *           type: string
 *         description: Time in HH:MM format
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: string
 *         description: Unit ID (optional)
 *     responses:
 *       200:
 *         description: Conflict check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasConflict:
 *                   type: boolean
 */
router.get('/dialysis_schedules/check-conflict', checkScheduleConflict);

/**
 * @swagger
 * /api/data/dialysis_schedules/{scheduleId}/with-records:
 *   get:
 *     summary: Get schedule with related records
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The schedule ID
 *     responses:
 *       200:
 *         description: Schedule with related records
 */
router.get('/dialysis_schedules/:scheduleId/with-records', getScheduleWithRelatedRecords);

/**
 * @swagger
 * /api/data/dialysis_schedules/with-records:
 *   get:
 *     summary: Get all schedules with related records
 *     responses:
 *       200:
 *         description: All schedules with related records and computed status
 */
router.get('/dialysis_schedules/with-records', getAllSchedulesWithRelatedRecords);

export default router; 