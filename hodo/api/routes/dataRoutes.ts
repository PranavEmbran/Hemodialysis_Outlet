import { Router } from 'express';
import {
  getAll, add, deleteById, getPatientsDerivedHandler, getSchedulesAssignedHandler, addSchedulesAssignedHandler, getCaseOpeningsHandler, addCaseOpeningHandler,
  savePredialysisRecord, saveStartDialysisRecord, saveInProcessRecord, savePostDialysisRecord,
  getPredialysisRecords, getStartDialysisRecords, getPostDialysisRecords,
  updatePredialysisRecord, updateStartDialysisRecord, updatePostDialysisRecord,
  getUnits, addUnit, updateUnit, deleteUnit,
  getVascularAccesses, addVascularAccess, updateVascularAccess, deleteVascularAccess,
  getDialyzerTypes, addDialyzerType, updateDialyzerType, deleteDialyzerType,
  getSchedulingLookup, addSchedulingLookup, updateSchedulingLookup, deleteSchedulingLookup
} from '../controllers/dataController.js';

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
router.get('/predialysis_records', getPredialysisRecords);
router.get('/start_dialysis_records', getStartDialysisRecords);
router.get('/post_dialysis_records', getPostDialysisRecords);
router.put('/predialysis_record', updatePredialysisRecord);
router.put('/start_dialysis_record', updateStartDialysisRecord);
router.put('/post_dialysis_record', updatePostDialysisRecord);

router.get('/units', getUnits);
router.post('/units', addUnit);
router.put('/units', updateUnit);
router.delete('/units/:id', deleteUnit);

router.get('/vascular_access', getVascularAccesses);
router.post('/vascular_access', addVascularAccess);
router.put('/vascular_access', updateVascularAccess);
router.delete('/vascular_access/:id', deleteVascularAccess);

router.get('/dialyzer_types', getDialyzerTypes);
router.post('/dialyzer_types', addDialyzerType);
router.put('/dialyzer_types', updateDialyzerType);
router.delete('/dialyzer_types/:id', deleteDialyzerType);

router.get('/scheduling_lookup', getSchedulingLookup);
router.post('/scheduling_lookup', addSchedulingLookup);
router.put('/scheduling_lookup', updateSchedulingLookup);
router.delete('/scheduling_lookup/:id', deleteSchedulingLookup);

export default router; 