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