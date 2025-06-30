const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db/db.json');

function readDatabase() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    throw new Error('Failed to read database');
  }
}

function writeDatabase(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing database:', error);
    throw new Error('Failed to write database');
  }
}

function normalizeDateString(date) {
  // Accepts 'YYYY-MM-DD' or 'YYYYMMDD'
  if (!date) return '';
  if (date.includes('-')) {
    const [yyyy, mm, dd] = date.split('-');
    return `${yyyy}${mm.padStart(2, '0')}${dd.padStart(2, '0')}`;
  }
  return date;
}

function fixDuplicatePatientIds() {
  console.log('🔧 Fixing duplicate patient IDs...');
  
  const db = readDatabase();
  const seen = new Set();
  let fixedCount = 0;
  
  // First pass: collect all existing IDs
  for (const patient of db.patients) {
    if (patient.id) {
      seen.add(patient.id);
    }
  }
  
  // Second pass: fix duplicates
  for (let i = 0; i < db.patients.length; i++) {
    const patient = db.patients[i];
    if (!patient.id) continue;
    
    // Check if this ID appears more than once
    const duplicateCount = db.patients.filter(p => p.id === patient.id).length;
    
    if (duplicateCount > 1) {
      // This is a duplicate, generate new ID
      const dateStr = normalizeDateString(patient.catheterInsertionDate);
      let serial = 1;
      let newId = `${dateStr}/${String(serial).padStart(3, '0')}`;
      
      // Find next available serial
      while (seen.has(newId)) {
        serial++;
        newId = `${dateStr}/${String(serial).padStart(3, '0')}`;
      }
      
      console.log(`  Fixed duplicate patient ID for ${patient.firstName} ${patient.lastName}: ${patient.id} → ${newId}`);
      patient.id = newId;
      seen.add(newId);
      fixedCount++;
    }
  }
  
  if (fixedCount > 0) {
    writeDatabase(db);
    console.log(`✅ Fixed ${fixedCount} duplicate patient IDs`);
  } else {
    console.log('✅ No duplicate patient IDs found');
  }
  
  return fixedCount;
}

// Run the fix
fixDuplicatePatientIds(); 