const fs = require('fs');
const path = require('path');

// Read the database
const dbPath = path.join(__dirname, '../db/db.json');
console.log('Reading database from:', dbPath);

const data = fs.readFileSync(dbPath, 'utf-8');
const db = JSON.parse(data);

console.log(`Found ${db.patients.length} patients`);

// Add isDeleted: 10 to all patients that don't have it
let updatedCount = 0;
db.patients.forEach(patient => {
  if (patient.isDeleted === undefined) {
    patient.isDeleted = 10;
    updatedCount++;
  }
});

console.log(`Updated ${updatedCount} patients with isDeleted: 10`);

// Write back to database
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Database updated successfully!'); 