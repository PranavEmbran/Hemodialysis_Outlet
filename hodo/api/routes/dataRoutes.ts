import { Router } from 'express';
import { getAll, add, deleteById, getPatientsDerivedHandler, getSchedulesAssignedHandler, addSchedulesAssignedHandler } from '../controllers/dataController.js';

const router = Router();

router.get('/', getAll);
router.post('/', add);
router.delete('/:id', deleteById);
router.get('/patients_derived', getPatientsDerivedHandler);
router.get('/schedules_assigned', getSchedulesAssignedHandler);
router.post('/schedules_assigned', addSchedulesAssignedHandler);

export default router; 