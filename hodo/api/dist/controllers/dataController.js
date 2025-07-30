import { getData, addData, deleteData, getPatientsDerived, getSchedulesAssigned, addSchedulesAssigned, getCaseOpenings, addCaseOpening, getUnits as getUnitsService, addUnit as addUnitService, updateUnit as updateUnitService, deleteUnit as deleteUnitService, getVascularAccesses as getVascularAccessesService, addVascularAccess as addVascularAccessService, updateVascularAccess as updateVascularAccessService, deleteVascularAccess as deleteVascularAccessService, getDialyzerTypes as getDialyzerTypesService, addDialyzerType as addDialyzerTypeService, updateDialyzerType as updateDialyzerTypeService, deleteDialyzerType as deleteDialyzerTypeService, getSchedulingLookup as getSchedulingLookupService, addSchedulingLookup as addSchedulingLookupService, updateSchedulingLookup as updateSchedulingLookupService, deleteSchedulingLookup as deleteSchedulingLookupService } from '../services/dataFactory.js';
import * as mssqlService from '../services/mssqlService.js';
import db from '../db/lowdb.js';
import { addPostDialysisRecord, addPredialysisRecord, addStartDialysisRecord } from '../services/lowdbService.js';
const useMSSQL = process.env.USE_MSSQL === 'true';
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
export const getInProcessRecords = async (req, res) => {
    try {
        let records;
        if (useMSSQL) {
            records = await mssqlService.getInProcessRecords();
        }
        else {
            await db.read();
            records = db.data?.InProcess_records || [];
        }
        res.json(records);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch in-process records' });
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
export const getPredialysisRecords = async (req, res) => {
    try {
        let records;
        if (useMSSQL) {
            records = await mssqlService.getPredialysisRecords();
        }
        else {
            await db.read();
            records = db.data?.predialysis_records || [];
        }
        res.json(records);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch predialysis records' });
    }
};
export const getStartDialysisRecords = async (req, res) => {
    try {
        let records;
        if (useMSSQL) {
            records = await mssqlService.getStartDialysisRecords();
        }
        else {
            await db.read();
            records = db.data?.start_dialysis_records || [];
        }
        res.json(records);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch start dialysis records' });
    }
};
export const getPostDialysisRecords = async (req, res) => {
    try {
        let records;
        if (useMSSQL) {
            records = await mssqlService.getPostDialysisRecords();
        }
        else {
            await db.read();
            records = db.data?.post_dialysis_records || [];
        }
        res.json(records);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch post dialysis records' });
    }
};
export const updatePredialysisRecord = async (req, res) => {
    try {
        const { id, ...rest } = req.body;
        await db.read();
        const idx = db.data.predialysis_records.findIndex((r) => r.id === id);
        if (idx === -1)
            return res.status(404).json({ error: 'Record not found' });
        db.data.predialysis_records[idx] = { ...db.data.predialysis_records[idx], ...rest };
        await db.write();
        res.json(db.data.predialysis_records[idx]);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update predialysis record' });
    }
};
export const updateStartDialysisRecord = async (req, res) => {
    try {
        const { id, ...rest } = req.body;
        await db.read();
        const idx = db.data.start_dialysis_records.findIndex((r) => r.id === id);
        if (idx === -1)
            return res.status(404).json({ error: 'Record not found' });
        db.data.start_dialysis_records[idx] = { ...db.data.start_dialysis_records[idx], ...rest };
        await db.write();
        res.json(db.data.start_dialysis_records[idx]);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update start dialysis record' });
    }
};
export const updatePostDialysisRecord = async (req, res) => {
    try {
        const { id, ...rest } = req.body;
        await db.read();
        const idx = db.data.post_dialysis_records.findIndex((r) => r.id === id);
        if (idx === -1)
            return res.status(404).json({ error: 'Record not found' });
        db.data.post_dialysis_records[idx] = { ...db.data.post_dialysis_records[idx], ...rest };
        await db.write();
        res.json(db.data.post_dialysis_records[idx]);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update post dialysis record' });
    }
};
// --- Units CRUD ---
export const getUnits = async (req, res) => {
    try {
        const units = await getUnitsService();
        res.json(units);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch units' });
    }
};
export const addUnit = async (req, res) => {
    try {
        const unit = await addUnitService(req.body);
        res.json(unit);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to add unit' });
    }
};
export const updateUnit = async (req, res) => {
    try {
        const unit = await updateUnitService(req.body);
        res.json(unit);
    }
    catch (err) {
        if (err instanceof Error && err.message === 'Unit not found') {
            res.status(404).json({ error: 'Unit not found' });
        }
        else {
            res.status(500).json({ error: 'Failed to update unit' });
        }
    }
};
export const deleteUnit = async (req, res) => {
    try {
        const deleted = await deleteUnitService(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Unit not found' });
        }
        res.json({ message: 'Unit deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete unit' });
    }
};
// --- Vascular Access CRUD ---
export const getVascularAccesses = async (req, res) => {
    try {
        const accesses = await getVascularAccessesService();
        res.json(accesses);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch vascular accesses' });
    }
};
export const addVascularAccess = async (req, res) => {
    try {
        const access = await addVascularAccessService(req.body);
        res.json(access);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to add vascular access' });
    }
};
export const updateVascularAccess = async (req, res) => {
    try {
        const access = await updateVascularAccessService(req.body);
        res.json(access);
    }
    catch (err) {
        if (err instanceof Error && err.message === 'Vascular access not found') {
            res.status(404).json({ error: 'Vascular access not found' });
        }
        else {
            res.status(500).json({ error: 'Failed to update vascular access' });
        }
    }
};
export const deleteVascularAccess = async (req, res) => {
    try {
        const deleted = await deleteVascularAccessService(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Vascular access not found' });
        }
        res.json({ message: 'Vascular access deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete vascular access' });
    }
};
// --- Dialyzer Types CRUD ---
export const getDialyzerTypes = async (req, res) => {
    try {
        const types = await getDialyzerTypesService();
        res.json(types);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch dialyzer types' });
    }
};
export const addDialyzerType = async (req, res) => {
    try {
        const type = await addDialyzerTypeService(req.body);
        res.json(type);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to add dialyzer type' });
    }
};
export const updateDialyzerType = async (req, res) => {
    try {
        const type = await updateDialyzerTypeService(req.body);
        res.json(type);
    }
    catch (err) {
        if (err instanceof Error && err.message === 'Dialyzer type not found') {
            res.status(404).json({ error: 'Dialyzer type not found' });
        }
        else {
            res.status(500).json({ error: 'Failed to update dialyzer type' });
        }
    }
};
export const deleteDialyzerType = async (req, res) => {
    try {
        const deleted = await deleteDialyzerTypeService(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Dialyzer type not found' });
        }
        res.json({ message: 'Dialyzer type deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete dialyzer type' });
    }
};
// --- Scheduling Lookup CRUD ---
export const getSchedulingLookup = async (req, res) => {
    try {
        const lookups = await getSchedulingLookupService();
        res.json(lookups);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch scheduling lookup' });
    }
};
export const addSchedulingLookup = async (req, res) => {
    try {
        const lookup = await addSchedulingLookupService(req.body);
        res.json(lookup);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to add scheduling lookup' });
    }
};
export const updateSchedulingLookup = async (req, res) => {
    try {
        const lookup = await updateSchedulingLookupService(req.body);
        res.json(lookup);
    }
    catch (err) {
        if (err instanceof Error && err.message === 'Scheduling lookup not found') {
            res.status(404).json({ error: 'Scheduling lookup not found' });
        }
        else {
            res.status(500).json({ error: 'Failed to update scheduling lookup' });
        }
    }
};
export const deleteSchedulingLookup = async (req, res) => {
    try {
        const deleted = await deleteSchedulingLookupService(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Scheduling lookup not found' });
        }
        res.json({ message: 'Scheduling lookup deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete scheduling lookup' });
    }
};
