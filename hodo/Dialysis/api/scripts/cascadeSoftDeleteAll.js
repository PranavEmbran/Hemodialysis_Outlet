const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db/db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

function markDeleted(arr, patientId) {
  return arr.map(item =>
    (item.patientId === patientId || item.id === patientId)
      ? { ...item, isDeleted: 0 }
      : item
  );
}

const softDeletedPatients = (db.patients || []).filter(p => p.isDeleted === 0);

for (const patient of softDeletedPatients) {
  const id = patient.id;
  db.appointments = markDeleted(db.appointments || [], id);
  db.history = markDeleted(db.history || [], id);
  db.billing = markDeleted(db.billing || [], id);
  db.dialysisFlowCharts = markDeleted(db.dialysisFlowCharts || [], id);
  db.haemodialysisRecords = markDeleted(db.haemodialysisRecords || [], id);
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Cascade soft delete applied to all related records for existing soft-deleted patients.'); 