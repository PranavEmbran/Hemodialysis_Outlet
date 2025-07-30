import 'dotenv/config';
const useMssql = process.env.USE_MSSQL === 'true';
const service = useMssql
    ? await import('./mssqlService.js')
    : await import('./lowdbService.js');
export const getData = service.getData;
export const addData = service.addData;
export const deleteData = service.deleteData;
export const getPatientsDerived = service.getPatientsDerived;
export const getSchedulesAssigned = service.getSchedulesAssigned;
export const addSchedulesAssigned = service.addSchedulesAssigned;
export const getCaseOpenings = service.getCaseOpenings;
export const addCaseOpening = service.addCaseOpening;
export const getPredialysisRecords = service.getPredialysisRecords;
export const getStartDialysisRecords = service.getStartDialysisRecords;
export const getInProcessRecords = service.getInProcessRecords;
export const getPostDialysisRecords = service.getPostDialysisRecords;
// Lookup table functions
export const getUnits = service.getUnits;
export const addUnit = service.addUnit;
export const updateUnit = service.updateUnit;
export const deleteUnit = service.deleteUnit;
export const getVascularAccesses = service.getVascularAccesses;
export const addVascularAccess = service.addVascularAccess;
export const updateVascularAccess = service.updateVascularAccess;
export const deleteVascularAccess = service.deleteVascularAccess;
export const getDialyzerTypes = service.getDialyzerTypes;
export const addDialyzerType = service.addDialyzerType;
export const updateDialyzerType = service.updateDialyzerType;
export const deleteDialyzerType = service.deleteDialyzerType;
export const getSchedulingLookup = service.getSchedulingLookup;
export const addSchedulingLookup = service.addSchedulingLookup;
export const updateSchedulingLookup = service.updateSchedulingLookup;
export const deleteSchedulingLookup = service.deleteSchedulingLookup;
