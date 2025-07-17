import { getData, addData, deleteData, getPatientsDerived, getSchedulesAssigned, addSchedulesAssigned, getCaseOpenings, addCaseOpening } from '../services/dataFactory.js';
import { addPredialysisRecord, addStartDialysisRecord, addPostDialysisRecord } from '../services/lowdbService.js';
import db from '../db/lowdb.js';
export const getAll = async (req, res) => {
    try {
        const items = await getData();
        res.json(items);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
};
export const add = async (req, res) => {
    try {
        const { name, value } = req.body;
        if (!name || typeof value !== 'number') {
            return res.status(400).json({ error: 'Invalid input' });
        }
        const newItem = await addData({ name, value });
        res.status(201).json(newItem);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to add data' });
    }
};
export const deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteData(id);
        if (deleted) {
            res.json({ success: true });
        }
        else {
            res.status(404).json({ error: 'Item not found' });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete data' });
    }
};
export const getPatientsDerivedHandler = async (req, res) => {
    try {
        const patients = await getPatientsDerived();
        res.json(patients);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
};
export const getSchedulesAssignedHandler = async (req, res) => {
    try {
        const schedules = await getSchedulesAssigned();
        res.json(schedules);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
};
export const addSchedulesAssignedHandler = async (req, res) => {
    try {
        const sessions = req.body;
        if (!Array.isArray(sessions)) {
            return res.status(400).json({ error: 'Request body must be an array of sessions' });
        }
        const updated = await addSchedulesAssigned(sessions);
        res.status(201).json(updated);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to add schedules' });
    }
};
export const getCaseOpeningsHandler = async (req, res) => {
    try {
        const caseOpenings = await getCaseOpenings();
        res.json(caseOpenings);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch case openings' });
    }
};
export const addCaseOpeningHandler = async (req, res) => {
    try {
        const { HCO_ID_PK, P_ID_FK, HCO_Blood_Group, HCO_Case_nature } = req.body;
        if (!HCO_ID_PK || !P_ID_FK || !HCO_Blood_Group || !HCO_Case_nature) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const newCaseOpening = await addCaseOpening({ HCO_ID_PK, P_ID_FK, HCO_Blood_Group, HCO_Case_nature });
        res.status(201).json(newCaseOpening);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to add case opening' });
    }
};
export const savePredialysisRecord = async (req, res) => {
    try {
        const record = req.body;
        // Basic validation
        if (!record.SA_ID_FK_PK || !record.P_ID_FK) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const saved = await addPredialysisRecord(record);
        res.status(201).json(saved);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to save predialysis record' });
    }
};
export const saveStartDialysisRecord = async (req, res) => {
    try {
        const record = req.body;
        if (!record.SA_ID_FK_PK) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const saved = await addStartDialysisRecord(record);
        res.status(201).json(saved);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to save start dialysis record' });
    }
};
export const saveInProcessRecord = async (req, res) => {
    try {
        await db.read();
        const record = req.body;
        if (!record) {
            return res.status(400).json({ error: 'Missing record data' });
        }
        if (!record.id) {
            record.id = Date.now().toString();
        }
        if (!db.data)
            db.data = { InProcess_records: [] };
        db.data.InProcess_records = db.data.InProcess_records || [];
        db.data.InProcess_records.push(record);
        await db.write();
        res.status(201).json({ message: 'In-process record saved successfully', record });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save in-process record' });
    }
};
export const savePostDialysisRecord = async (req, res) => {
    try {
        const record = req.body;
        if (!record.SA_ID_FK) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const saved = await addPostDialysisRecord(record);
        res.status(201).json(saved);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to save post dialysis record' });
    }
};
