import { Router } from 'express';
import { getAll, add, deleteById, getPatientsDerivedHandler } from '../controllers/dataController.js';
const router = Router();
router.get('/', getAll);
router.post('/', add);
router.delete('/:id', deleteById);
router.get('/patients_derived', getPatientsDerivedHandler);
export default router;
