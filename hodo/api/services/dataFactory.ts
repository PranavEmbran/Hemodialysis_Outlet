import 'dotenv/config';
const useMssql = process.env.USE_MSSQL === 'true';

const service = useMssql
  ? await import('./mssqlService.js')
  : await import('./lowdbService.js');

export const getData = service.getData;
export const addData = service.addData;
export const deleteData = service.deleteData;
export const getPatientsDerived = (service as any).getPatientsDerived;
export const getCasePatientsDerived = (service as any).getCasePatientsDerived;
export const searchPatients = (service as any).searchPatients;
export const getPatientsPage = (service as any).getPatientsPage;
export const getSchedulesAssigned = (service as any).getSchedulesAssigned;
export const addSchedulesAssigned = (service as any).addSchedulesAssigned;
export const getCaseOpenings = (service as any).getCaseOpenings;
export const addCaseOpening = (service as any).addCaseOpening;

export const getPredialysisRecords = (service as any).getPredialysisRecords;
export const getStartDialysisRecords = (service as any).getStartDialysisRecords;
export const getInProcessRecords = (service as any).getInProcessRecords;
export const getPostDialysisRecords = (service as any).getPostDialysisRecords;

export const addPredialysisRecord = (service as any).addPredialysisRecord;
export const addStartDialysisRecord = (service as any).addStartDialysisRecord;
// export const addInProcessRecord = (service as any).addInProcessRecord;
export const addPostDialysisRecord = (service as any).addPostDialysisRecord;

export const updatePredialysisRecord = (service as any).updatePredialysisRecord;
export const updateStartDialysisRecord = (service as any).updateStartDialysisRecord;
export const updatePostDialysisRecord = (service as any).updatePostDialysisRecord;

// Lookup table functions
export const getUnits = (service as any).getUnits;
export const addUnit = (service as any).addUnit;
export const updateUnit = (service as any).updateUnit;
export const deleteUnit = (service as any).deleteUnit;

export const getVascularAccesses = (service as any).getVascularAccesses;
export const addVascularAccess = (service as any).addVascularAccess;
export const updateVascularAccess = (service as any).updateVascularAccess;
export const deleteVascularAccess = (service as any).deleteVascularAccess;

export const getSessionTimes = (service as any).getSessionTimes;
export const addSessionTime = (service as any).addSessionTime;
export const updateSessionTime = (service as any).updateSessionTime;
export const deleteSessionTime = (service as any).deleteSessionTime;

export const getDialyzerTypes = (service as any).getDialyzerTypes;
export const addDialyzerType = (service as any).addDialyzerType;
export const updateDialyzerType = (service as any).updateDialyzerType;
export const deleteDialyzerType = (service as any).deleteDialyzerType;

export const getSchedulingLookup = (service as any).getSchedulingLookup;
export const addSchedulingLookup = (service as any).addSchedulingLookup;
export const updateSchedulingLookup = (service as any).updateSchedulingLookup;
export const deleteSchedulingLookup = (service as any).deleteSchedulingLookup;

export const updateDialysisScheduleStatus = (service as any).updateDialysisScheduleStatus;
export const checkScheduleConflict = (service as any).checkScheduleConflict;
export const getScheduleWithRelatedRecords = (service as any).getScheduleWithRelatedRecords;