import { getData, addData, deleteData, getPatientsDerived, getSchedulesAssigned, addSchedulesAssigned, getCaseOpenings, addCaseOpening, getUnits as getUnitsService, addUnit as addUnitService, updateUnit as updateUnitService, deleteUnit as deleteUnitService, getVascularAccesses as getVascularAccessesService, addVascularAccess as addVascularAccessService, updateVascularAccess as updateVascularAccessService, deleteVascularAccess as deleteVascularAccessService, getSessionTimes as getSessionTimesService, addSessionTime as addSessionTimeService, updateSessionTime as updateSessionTimeService, deleteSessionTime as deleteSessionTimeService, getDialyzerTypes as getDialyzerTypesService, addDialyzerType as addDialyzerTypeService, updateDialyzerType as updateDialyzerTypeService, deleteDialyzerType as deleteDialyzerTypeService, getSchedulingLookup as getSchedulingLookupService, addSchedulingLookup as addSchedulingLookupService, updateSchedulingLookup as updateSchedulingLookupService, deleteSchedulingLookup as deleteSchedulingLookupService, updateDialysisScheduleStatus as updateDialysisScheduleStatusService, checkScheduleConflict as checkScheduleConflictService, getScheduleWithRelatedRecords as getScheduleWithRelatedRecordsService, addPredialysisRecord, addStartDialysisRecord, addPostDialysisRecord, updatePredialysisRecord as updatePredialysisRecordService, updateStartDialysisRecord as updateStartDialysisRecordService, updatePostDialysisRecord as updatePostDialysisRecordService } from '../services/dataFactory.js';
import * as lowdbService from '../services/lowdbService.js';
const { updateCaseOpening } = lowdbService;
import * as mssqlService from '../services/mssqlService.js';
import db from '../db/lowdb.js';
// import { addPostDialysisRecord, addPredialysisRecord, addStartDialysisRecord } from '../services/lowdbService.js';
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
// Search patients by name
export const searchPatientsHandler = async (req, res) => {
    try {
        const { q: searchTerm, limit } = req.query;
        if (!searchTerm || typeof searchTerm !== 'string') {
            return res.status(400).json({ error: 'Search term (q) is required' });
        }
        if (searchTerm.length < 2) {
            return res.status(400).json({ error: 'Search term must be at least 2 characters' });
        }
        const searchLimit = limit ? parseInt(limit, 10) : 20;
        if (useMSSQL) {
            const patients = await mssqlService.searchPatients(searchTerm, searchLimit);
            res.json(patients);
        }
        else {
            // Fallback to regular getPatientsDerived for non-MSSQL
            const patients = await getPatientsDerived();
            const filtered = patients.filter((p) => p.Name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, searchLimit);
            res.json(filtered);
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to search patients' });
    }
};
// Get paginated patients
export const getPatientsPageHandler = async (req, res) => {
    try {
        const { page, pageSize } = req.query;
        const pageNum = page ? parseInt(page, 10) : 1;
        const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 50;
        if (pageNum < 1 || pageSizeNum < 1 || pageSizeNum > 100) {
            return res.status(400).json({ error: 'Invalid page or pageSize parameters' });
        }
        if (useMSSQL) {
            const result = await mssqlService.getPatientsPage(pageNum, pageSizeNum);
            res.json(result);
        }
        else {
            // Fallback for non-MSSQL
            const patients = await getPatientsDerived();
            const startIndex = (pageNum - 1) * pageSizeNum;
            const endIndex = startIndex + pageSizeNum;
            const paginatedPatients = patients.slice(startIndex, endIndex);
            res.json({
                patients: paginatedPatients,
                totalCount: patients.length,
                hasMore: endIndex < patients.length
            });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch patients page' });
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
// Handler to update a case opening
export const updateCaseOpeningHandler = async (req, res) => {
    try {
        const { patientId, caseOpeningId } = req.params;
        let updated;
        if (useMSSQL) {
            // Ensure IDs are numbers for MSSQL
            updated = await mssqlService.updateCaseOpening({
                DCO_P_ID_FK: Number(patientId),
                DCO_ID_PK: Number(caseOpeningId),
                ...req.body
            });
        }
        else {
            updated = await updateCaseOpening({ ...req.body, DCO_P_ID_FK: patientId, DCO_ID_PK: caseOpeningId });
        }
        res.json(updated);
    }
    catch (err) {
        if (err instanceof Error && err.message === 'Case opening not found') {
            res.status(404).json({ error: 'Case opening not found' });
        }
        else {
            res.status(500).json({ error: 'Failed to update case opening' });
        }
    }
};
export const addCaseOpeningHandler = async (req, res) => {
    try {
        const { DCO_P_ID_FK, DCO_Blood_Group, DCO_Case_Nature } = req.body;
        if (DCO_P_ID_FK === undefined ||
            DCO_Blood_Group === undefined ||
            DCO_Case_Nature === undefined) {
            return res.status(400).json({ error: 'Missing required fields: DCO_P_ID_FK, DCO_Blood_Group, DCO_Case_Nature' });
        }
        // Only pass the allowed fields
        const newCaseOpening = await addCaseOpening({
            DCO_P_ID_FK,
            DCO_Blood_Group,
            DCO_Case_Nature
        });
        // Handle already exists case
        if ('alreadyExists' in newCaseOpening && newCaseOpening.alreadyExists) {
            return res.status(200).json(newCaseOpening); // Send with 200 to prevent frontend throwing an error
        }
        res.status(201).json(newCaseOpening);
    }
    catch (err) {
        if (err instanceof Error && err.message.startsWith('Missing required fields')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to add case opening' });
    }
};
export const savePredialysisRecord = async (req, res) => {
    try {
        const record = req.body;
        console.log('POST /api/data/predialysis_record called, body:', req.body);
        // Basic validation
        // if (!record.DS_ID_FK_PK || !record.P_ID_FK) {
        //   return res.status(400).json({ error: 'Missing required fields' });
        // }
        if (!record.SA_ID_PK_FK) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // PreDR_ID_PK will be generated in the service if not provided
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
        if (!record.SA_ID_PK_FK) {
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
        console.log('savePostDialysisRecord called, body:', req.body);
        // if (!record.SA_ID_FK) {
        //   return res.status(400).json({ error: 'Missing required fields' });
        // }
        if (!record.SA_ID_PK_FK) {
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
        const result = await updatePredialysisRecordService(req.body);
        res.json(result);
    }
    catch (err) {
        console.error('Error updating predialysis record:', err);
        res.status(500).json({ error: err.message || 'Failed to update predialysis record' });
    }
};
export const updateStartDialysisRecord = async (req, res) => {
    try {
        const result = await updateStartDialysisRecordService(req.body);
        res.json(result);
    }
    catch (err) {
        console.error('Error updating start dialysis record:', err);
        res.status(500).json({ error: err.message || 'Failed to update start dialysis record' });
    }
};
export const updatePostDialysisRecord = async (req, res) => {
    try {
        const result = await updatePostDialysisRecordService(req.body);
        res.json(result);
    }
    catch (err) {
        console.error('Error updating post dialysis record:', err);
        res.status(500).json({ error: err.message || 'Failed to update post dialysis record' });
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
// --- Session Times CRUD ---
export const getSessionTimes = async (req, res) => {
    try {
        const sessionTimes = await getSessionTimesService();
        res.json(sessionTimes);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch session times' });
    }
};
export const addSessionTime = async (req, res) => {
    try {
        const sessionTime = await addSessionTimeService(req.body);
        res.json(sessionTime);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to add session time' });
    }
};
export const updateSessionTime = async (req, res) => {
    try {
        const sessionTime = await updateSessionTimeService(req.body);
        res.json(sessionTime);
    }
    catch (err) {
        if (err instanceof Error && err.message === 'Session time not found') {
            res.status(404).json({ error: 'Session time not found' });
        }
        else {
            res.status(500).json({ error: 'Failed to update session time' });
        }
    }
};
export const deleteSessionTime = async (req, res) => {
    try {
        const deleted = await deleteSessionTimeService(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Session time not found' });
        }
        res.json({ message: 'Session time deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete session time' });
    }
};
// --- Dialysis Schedules CRUD ---
export const updateDialysisScheduleStatus = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { status } = req.body;
        if (status === undefined || ![0, 10].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be 0 (cancelled) or 10 (scheduled)' });
        }
        const schedule = await updateDialysisScheduleStatusService(scheduleId, status);
        res.json(schedule);
    }
    catch (err) {
        if (err instanceof Error && err.message === 'Schedule not found') {
            res.status(404).json({ error: 'Schedule not found' });
        }
        else {
            res.status(500).json({ error: 'Failed to update schedule status' });
        }
    }
};
export const checkScheduleConflict = async (req, res) => {
    try {
        const { date, time, unitId } = req.query;
        if (!date || !time) {
            return res.status(400).json({ error: 'Date and time are required' });
        }
        const hasConflict = await checkScheduleConflictService(date, time, unitId);
        res.json({ hasConflict });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to check schedule conflict' });
    }
};
export const getScheduleWithRelatedRecords = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const schedules = await getScheduleWithRelatedRecordsService(scheduleId);
        res.json(schedules);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get schedule with related records' });
    }
};
export const getAllSchedulesWithRelatedRecords = async (req, res) => {
    try {
        const schedules = await getScheduleWithRelatedRecordsService();
        res.json(schedules);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get schedules with related records' });
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
