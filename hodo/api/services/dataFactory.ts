import 'dotenv/config';
const useMssql = process.env.USE_MSSQL === 'true';

const service = useMssql
  ? await import('./mssqlService.js')
  : await import('./lowdbService.js');

export const getData = service.getData;
export const addData = service.addData;
export const deleteData = service.deleteData;
export const getPatientsDerived = (service as any).getPatientsDerived;