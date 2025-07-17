import { Router } from 'express';
import { getAll, add, deleteById, getPatientsDerivedHandler, getSchedulesAssignedHandler, addSchedulesAssignedHandler, getCaseOpeningsHandler, addCaseOpeningHandler, savePredialysisRecord, saveStartDialysisRecord, saveInProcessRecord, savePostDialysisRecord } from '../controllers/dataController.js';

const router = Router();

router.get('/', getAll);
router.post('/', add);
router.delete('/:id', deleteById);
router.get('/patients_derived', getPatientsDerivedHandler);
router.get('/schedules_assigned', getSchedulesAssignedHandler);
router.post('/schedules_assigned', addSchedulesAssignedHandler);
router.get('/case_openings', getCaseOpeningsHandler);
router.post('/case_openings', addCaseOpeningHandler);
router.post('/predialysis_record', savePredialysisRecord);
router.post('/start_dialysis_record', saveStartDialysisRecord);
router.post('/inprocess_record', saveInProcessRecord);
router.post('/post_dialysis_record', savePostDialysisRecord);

export default router; 