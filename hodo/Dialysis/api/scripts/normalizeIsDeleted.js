const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db/db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

function ensureIsDeleted(arr) {
  return arr.map(item =>
    typeof item.isDeleted === 'undefined' ? { ...item, isDeleted: 10 } : item
  );
}

db.patients = ensureIsDeleted(db.patients || []);
db.appointments = ensureIsDeleted(db.appointments || []);
db.history = ensureIsDeleted(db.history || []);
db.billing = ensureIsDeleted(db.billing || []);
db.dialysisFlowCharts = ensureIsDeleted(db.dialysisFlowCharts || []);
db.haemodialysisRecords = ensureIsDeleted(db.haemodialysisRecords || []);

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('All records normalized with isDeleted field.'); 