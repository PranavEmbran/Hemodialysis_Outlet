import { Router } from 'express';
import { getAll, add, deleteById, getPatientsDerivedHandler, getSchedulesAssignedHandler, addSchedulesAssignedHandler, getCaseOpeningsHandler, addCaseOpeningHandler, savePredialysisRecord, saveStartDialysisRecord, saveInProcessRecord, savePostDialysisRecord, getPredialysisRecords, getStartDialysisRecords, getPostDialysisRecords, updatePredialysisRecord, updateStartDialysisRecord, updatePostDialysisRecord, getUnits, addUnit, updateUnit, deleteUnit, getVascularAccesses, addVascularAccess, updateVascularAccess, deleteVascularAccess, getDialyzerTypes, addDialyzerType, updateDialyzerType, deleteDialyzerType, getSchedulingLookup, addSchedulingLookup, updateSchedulingLookup, deleteSchedulingLookup } from '../controllers/dataController.js';
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
 *     summary: Get derived patient data
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
 * /api/data/schedules_assigned:
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
 *                 $ref: '#/components/schemas/ScheduleAssigned'
 */
router.get('/schedules_assigned', getSchedulesAssignedHandler);
/**
 * @swagger
 * /api/data/schedules_assigned:
 *   post:
 *     summary: Add assigned schedules
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/ScheduleAssigned'
 *     responses:
 *       200:
 *         description: Assigned schedules added
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ScheduleAssigned'
 */
router.post('/schedules_assigned', addSchedulesAssignedHandler);
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
export default router;
