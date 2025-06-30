import fs from 'fs';
import path from 'path';

const dbPath = path.join(__dirname, '../db/db.json');

function getDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

export function generatePatientId(registrationDate: string): string {
  // registrationDate: 'YYYY-MM-DD'
  const dateObj = new Date(registrationDate);
  const dateStr = getDateString(dateObj);

  let serial = 0;
  let candidateId = '';
  let foundDuplicate = true;

  while (foundDuplicate) {
    // Always re-read the latest db.json before each attempt
    const dbRaw = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(dbRaw);
    if (!db.patientSerials) db.patientSerials = {};
    if (!db.patients) db.patients = [];
    serial = db.patientSerials[dateStr] || 0;
    serial += 1;
    const serialStr = String(serial).padStart(3, '0');
    candidateId = `${dateStr}/${serialStr}`;
    foundDuplicate = db.patients.some((p: any) => p.id === candidateId);
    if (!foundDuplicate) {
      db.patientSerials[dateStr] = serial;
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
      break;
    } else {
      // If duplicate, increment serial and try again
      db.patientSerials[dateStr] = serial;
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    }
  }
  return candidateId;
}