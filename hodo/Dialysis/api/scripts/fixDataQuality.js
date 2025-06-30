const fs = require('fs');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '../db/db.json');

// Read database
function readDatabase() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { patients: [], appointments: [], billing: [], history: [], dialysisFlowCharts: [], haemodialysisRecords: [] };
  }
}

// Write database
function writeDatabase(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
}

// Generate unique mobile number
function generateUniqueMobile(existingMobiles) {
  const baseNumbers = [
    '9876543210', '9876543211', '9876543212', '9876543213', '9876543214',
    '9876543215', '9876543216', '9876543217', '9876543218', '9876543219',
    '9876543220', '9876543221', '9876543222', '9876543223', '9876543224',
    '6549873210', '6549873211', '6549873212', '6549873213', '6549873214',
    '6549873215', '6549873216', '6549873217', '6549873218', '6549873219',
    '6549873220', '6549873221', '6549873222', '6549873223', '6549873224'
  ];
  
  for (const number of baseNumbers) {
    if (!existingMobiles.includes(number)) {
      return number;
    }
  }
  
  // If all base numbers are used, generate a random one
  let randomNumber;
  do {
    randomNumber = '9' + Math.floor(Math.random() * 9000000000 + 1000000000).toString();
  } while (existingMobiles.includes(randomNumber));
  
  return randomNumber;
}

// Fix duplicate mobile numbers
function fixDuplicateMobileNumbers() {
  console.log('🔧 Fixing duplicate mobile numbers...');
  
  const db = readDatabase();
  const usedMobiles = new Set();
  let fixedCount = 0;
  
  if (db.patients) {
    db.patients.forEach(patient => {
      if (usedMobiles.has(patient.mobileNo)) {
        // Generate new unique mobile number
        const newMobile = generateUniqueMobile(Array.from(usedMobiles));
        console.log(`  Fixed duplicate mobile for ${patient.firstName} ${patient.lastName}: ${patient.mobileNo} → ${newMobile}`);
        patient.mobileNo = newMobile;
        fixedCount++;
      }
      usedMobiles.add(patient.mobileNo);
    });
  }
  
  if (fixedCount > 0) {
    writeDatabase(db);
    console.log(`✅ Fixed ${fixedCount} duplicate mobile numbers`);
  } else {
    console.log('✅ No duplicate mobile numbers found');
  }
  
  return fixedCount;
}

// Add missing catheter/fistula dates
function addMissingMedicalDates() {
  console.log('🔧 Adding missing medical dates...');
  
  const db = readDatabase();
  let fixedCount = 0;
  
  if (db.patients) {
    db.patients.forEach(patient => {
      if (!patient.catheterInsertionDate && !patient.fistulaCreationDate) {
        // Add default dates (1 year ago)
        const defaultDate = new Date();
        defaultDate.setFullYear(defaultDate.getFullYear() - 1);
        const dateString = defaultDate.toISOString().split('T')[0];
        
        patient.catheterInsertionDate = dateString;
        patient.fistulaCreationDate = dateString;
        
        console.log(`  Added medical dates for ${patient.firstName} ${patient.lastName}: ${dateString}`);
        fixedCount++;
      }
    });
  }
  
  if (fixedCount > 0) {
    writeDatabase(db);
    console.log(`✅ Added medical dates for ${fixedCount} patients`);
  } else {
    console.log('✅ All patients have medical dates');
  }
  
  return fixedCount;
}

// Standardize date formats
function standardizeDateFormats() {
  console.log('🔧 Standardizing date formats...');
  
  const db = readDatabase();
  let fixedCount = 0;
  
  // Helper function to standardize date
  function standardizeDate(dateString) {
    if (!dateString) return dateString;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toISOString().split('T')[0];
    } catch (error) {
      return dateString;
    }
  }
  
  // Fix patient dates
  if (db.patients) {
    db.patients.forEach(patient => {
      const originalDateOfBirth = patient.dateOfBirth;
      const originalCatheterDate = patient.catheterInsertionDate;
      const originalFistulaDate = patient.fistulaCreationDate;
      
      patient.dateOfBirth = standardizeDate(patient.dateOfBirth);
      patient.catheterInsertionDate = standardizeDate(patient.catheterInsertionDate);
      patient.fistulaCreationDate = standardizeDate(patient.fistulaCreationDate);
      
      if (originalDateOfBirth !== patient.dateOfBirth || 
          originalCatheterDate !== patient.catheterInsertionDate ||
          originalFistulaDate !== patient.fistulaCreationDate) {
        console.log(`  Standardized dates for ${patient.firstName} ${patient.lastName}`);
        fixedCount++;
      }
    });
  }
  
  // Fix appointment dates
  if (db.appointments) {
    db.appointments.forEach(appointment => {
      const originalDate = appointment.date;
      appointment.date = standardizeDate(appointment.date);
      
      if (originalDate !== appointment.date) {
        console.log(`  Standardized appointment date: ${originalDate} → ${appointment.date}`);
        fixedCount++;
      }
    });
  }
  
  // Fix history dates
  if (db.history) {
    db.history.forEach(record => {
      const originalDate = record.date;
      record.date = standardizeDate(record.date);
      
      if (originalDate !== record.date) {
        console.log(`  Standardized history date: ${originalDate} → ${record.date}`);
        fixedCount++;
      }
    });
  }
  
  if (fixedCount > 0) {
    writeDatabase(db);
    console.log(`✅ Standardized ${fixedCount} date formats`);
  } else {
    console.log('✅ All dates are already in standard format');
  }
  
  return fixedCount;
}

// Main function to run all fixes
function runAllFixes() {
  console.log('🚀 Starting data quality fixes...\n');
  
  const startTime = Date.now();
  
  const mobileFixes = fixDuplicateMobileNumbers();
  console.log('');
  
  const dateFixes = addMissingMedicalDates();
  console.log('');
  
  const formatFixes = standardizeDateFormats();
  console.log('');
  
  const totalFixes = mobileFixes + dateFixes + formatFixes;
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('📊 SUMMARY:');
  console.log(`  Mobile number fixes: ${mobileFixes}`);
  console.log(`  Medical date fixes: ${dateFixes}`);
  console.log(`  Date format fixes: ${formatFixes}`);
  console.log(`  Total fixes: ${totalFixes}`);
  console.log(`  Time taken: ${duration}s`);
  
  if (totalFixes > 0) {
    console.log('\n✅ Database has been updated with fixes!');
  } else {
    console.log('\n✅ No fixes were needed - database is already clean!');
  }
}

// --- MIGRATION: Update patient IDs to new format ---
function migratePatientIds() {
  console.log('\uD83D\uDD27 Migrating patient IDs to new format...');
  const db = readDatabase();
  if (!db.patients) return 0;
  // Build a map of date -> patients for deterministic serial assignment
  const dateToPatients = {};
  db.patients.forEach(patient => {
    const regDate = patient.catheterInsertionDate || patient.fistulaCreationDate || '2000-01-01';
    const dateObj = new Date(regDate);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    if (!dateToPatients[dateStr]) dateToPatients[dateStr] = [];
    dateToPatients[dateStr].push(patient);
  });
  db.patientSerials = {};
  let migratedCount = 0;
  // For each date, assign serials in order of appearance
  Object.entries(dateToPatients).forEach(([dateStr, patients]) => {
    patients.forEach((patient, idx) => {
      const serial = idx + 1;
      db.patientSerials[dateStr] = serial;
      const serialStr = String(serial).padStart(3, '0');
      const newId = `${dateStr}/${serialStr}`;
      if (patient.id !== newId) {
        patient.id = newId;
        migratedCount++;
      }
    });
  });
  writeDatabase(db);
  console.log(`\u2705 Migrated ${migratedCount} patient IDs to new format.`);
  return migratedCount;
}

// Fix duplicate patient IDs
function fixDuplicatePatientIds() {
  console.log('🔧 Fixing duplicate patient IDs...');
  
  function normalizeDateString(date) {
    // Accepts 'YYYY-MM-DD' or 'YYYYMMDD'
    if (!date) return '';
    if (date.includes('-')) {
      const [yyyy, mm, dd] = date.split('-');
      return `${yyyy}${mm.padStart(2, '0')}${dd.padStart(2, '0')}`;
    }
    return date;
  }
  
  const db = readDatabase();
  const seen = new Set();
  let fixedCount = 0;
  
  for (let i = 0; i < db.patients.length; i++) {
    const patient = db.patients[i];
    if (seen.has(patient.id)) {
      // Generate a new unique ID for this date
      const dateStr = normalizeDateString(patient.catheterInsertionDate);
      let serial = 1;
      let newId = `${dateStr}/${String(serial).padStart(3, '0')}`;
      const existingIds = new Set(db.patients.map(p => p.id));
      while (existingIds.has(newId)) {
        serial++;
        newId = `${dateStr}/${String(serial).padStart(3, '0')}`;
      }
      console.log(`  Fixed duplicate patient ID for ${patient.firstName} ${patient.lastName}: ${patient.id} → ${newId}`);
      patient.id = newId;
      fixedCount++;
      seen.add(newId);
    } else {
      seen.add(patient.id);
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

// Run migration if script is executed directly
if (require.main === module) {
  runAllFixes();
  migratePatientIds();
  fixDuplicatePatientIds();
}

module.exports = {
  fixDuplicateMobileNumbers,
  addMissingMedicalDates,
  standardizeDateFormats,
  runAllFixes,
  migratePatientIds,
  fixDuplicatePatientIds
}; 