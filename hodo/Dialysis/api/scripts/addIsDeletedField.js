const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db/db.json');

function updatePatientRecords() {
  try {
    console.log('Reading database...');
    const data = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(data);
    
    console.log(`Found ${db.patients.length} patients`);
    
    // Add isDeleted: 10 to all existing patient records
    let updatedCount = 0;
    db.patients = db.patients.map(patient => {
      if (patient.isDeleted === undefined) {
        patient.isDeleted = 10; // Mark as active
        updatedCount++;
      }
      return patient;
    });
    
    // Write back to database
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    
    console.log(`Updated ${updatedCount} patient records with isDeleted: 10`);
    console.log('Database updated successfully!');
    
  } catch (error) {
    console.error('Error updating database:', error);
  }
}

updatePatientRecords(); 