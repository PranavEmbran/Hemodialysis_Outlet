import 'dotenv/config';
const useMssql = process.env.USE_MSSQL === 'true';

const service = useMssql
  ? await import('./mssqlService.js')
  : await import('./lowdbService.js');

export const getData = service.getData;
export const addData = service.addData;
export const deleteData = service.deleteData;
export const getPatientsDerived = (service as any).getPatientsDerived;
export const getSchedulesAssigned = (service as any).getSchedulesAssigned;
export const addSchedulesAssigned = (service as any).addSchedulesAssigned;
export const getCaseOpenings = (service as any).getCaseOpenings;
export const addCaseOpening = (service as any).addCaseOpening;

export const getPredialysisRecords = (service as any).getPredialysisRecords;
export const getStartDialysisRecords = (service as any).getStartDialysisRecords;
export const getInProcessRecords = (service as any).getInProcessRecords;
export const getPostDialysisRecords = (service as any).getPostDialysisRecords;

// Lookup table functions
export const getUnits = (service as any).getUnits;
export const addUnit = (service as any).addUnit;
export const updateUnit = (service as any).updateUnit;
export const deleteUnit = (service as any).deleteUnit;

export const getVascularAccesses = (service as any).getVascularAccesses;
export const addVascularAccess = (service as any).addVascularAccess;
export const updateVascularAccess = (service as any).updateVascularAccess;
export const deleteVascularAccess = (service as any).deleteVascularAccess;

export const getDialyzerTypes = (service as any).getDialyzerTypes;
export const addDialyzerType = (service as any).addDialyzerType;
export const updateDialyzerType = (service as any).updateDialyzerType;
export const deleteDialyzerType = (service as any).deleteDialyzerType;

export const getSchedulingLookup = (service as any).getSchedulingLookup;
export const addSchedulingLookup = (service as any).addSchedulingLookup;
export const updateSchedulingLookup = (service as any).updateSchedulingLookup;
export const deleteSchedulingLookup = (service as any).deleteSchedulingLookup;