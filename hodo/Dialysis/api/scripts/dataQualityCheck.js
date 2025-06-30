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

// Data validation functions
function validatePatient(patient) {
  const errors = [];
  
  if (!patient.id || typeof patient.id !== 'string') {
    errors.push('Patient ID is required and must be a string');
  }
  
  if (!patient.firstName || typeof patient.firstName !== 'string') {
    errors.push('First name is required and must be a string');
  }
  
  if (!patient.lastName || typeof patient.lastName !== 'string') {
    errors.push('Last name is required and must be a string');
  }
  
  if (!patient.gender || !['Male', 'Female', 'Other'].includes(patient.gender)) {
    errors.push('Gender must be Male, Female, or Other');
  }
  
  if (!patient.dateOfBirth || !isValidDate(patient.dateOfBirth)) {
    errors.push('Valid date of birth is required');
  }
  
  if (!patient.mobileNo || !isValidPhone(patient.mobileNo)) {
    errors.push('Valid mobile number is required');
  }
  
  if (!patient.bloodGroup || !isValidBloodGroup(patient.bloodGroup)) {
    errors.push('Valid blood group is required');
  }
  
  return { isValid: errors.length === 0, errors };
}

function validateAppointment(appointment) {
  const errors = [];
  
  if (!appointment.patientId || typeof appointment.patientId !== 'string') {
    errors.push('Patient ID is required');
  }
  
  if (!appointment.dialysisUnit || !['Unit A', 'Unit B', 'Unit C', 'Unit D'].includes(appointment.dialysisUnit)) {
    errors.push('Valid dialysis unit is required');
  }
  
  if (!appointment.date || !isValidDate(appointment.date)) {
    errors.push('Valid appointment date is required');
  }
  
  if (!appointment.time || !isValidTime(appointment.time)) {
    errors.push('Valid appointment time is required');
  }
  
  return { isValid: errors.length === 0, errors };
}

function validateHistory(history) {
  const errors = [];
  
  if (!history.patientId || typeof history.patientId !== 'string') {
    errors.push('Patient ID is required');
  }
  
  if (!history.startTime || !isValidTime(history.startTime)) {
    errors.push('Valid start time is required');
  }
  
  if (!history.endTime || !isValidTime(history.endTime)) {
    errors.push('Valid end time is required');
  }
  
  if (!history.date || !isValidDate(history.date)) {
    errors.push('Valid date is required');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Helper validation functions
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

function isValidTime(timeString) {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}

function isValidPhone(phone) {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}

function isValidBloodGroup(bloodGroup) {
  const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validGroups.includes(bloodGroup);
}

function isValidBloodPressure(bp) {
  const bpRegex = /^\d{2,3}\/\d{2,3}$/;
  if (!bpRegex.test(bp)) return false;
  
  const [systolic, diastolic] = bp.split('/').map(Number);
  return systolic >= 70 && systolic <= 300 && diastolic >= 40 && diastolic <= 200;
}

// Generate data quality report
function generateDataQualityReport() {
  const db = readDatabase();
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPatients: db.patients?.length || 0,
      totalAppointments: db.appointments?.length || 0,
      totalBilling: db.billing?.length || 0,
      totalHistory: db.history?.length || 0,
      totalFlowCharts: db.dialysisFlowCharts?.length || 0,
      totalHaemodialysisRecords: db.haemodialysisRecords?.length || 0,
    },
    issues: {
      patients: [],
      appointments: [],
      billing: [],
      history: [],
      flowCharts: [],
      haemodialysisRecords: []
    },
    recommendations: []
  };

  // Analyze patients
  if (db.patients) {
    db.patients.forEach((patient, index) => {
      const validation = validatePatient(patient);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          report.issues.patients.push({
            type: 'error',
            message: error,
            recordId: patient.id,
            recordIndex: index
          });
        });
      }

      // Check for duplicate mobile numbers
      const duplicateMobile = db.patients.filter(p => p.mobileNo === patient.mobileNo);
      if (duplicateMobile.length > 1) {
        report.issues.patients.push({
          type: 'warning',
          message: 'Duplicate mobile number found',
          recordId: patient.id,
          field: 'mobileNo',
          value: patient.mobileNo
        });
      }

      // Check for missing critical fields
      if (!patient.catheterInsertionDate && !patient.fistulaCreationDate) {
        report.issues.patients.push({
          type: 'warning',
          message: 'Missing both catheter and fistula dates',
          recordId: patient.id
        });
      }
    });
  }

  // Analyze appointments
  if (db.appointments) {
    db.appointments.forEach((appointment, index) => {
      const validation = validateAppointment(appointment);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          report.issues.appointments.push({
            type: 'error',
            message: error,
            recordId: appointment.id,
            recordIndex: index
          });
        });
      }

      // Check for overlapping appointments
      const sameTimeAppointments = db.appointments.filter(a => 
        a.date === appointment.date && 
        a.time === appointment.time && 
        a.id !== appointment.id
      );
      if (sameTimeAppointments.length > 0) {
        report.issues.appointments.push({
          type: 'warning',
          message: 'Potential appointment time conflict',
          recordId: appointment.id,
          field: 'time',
          value: appointment.time
        });
      }
    });
  }

  // Analyze history
  if (db.history) {
    db.history.forEach((record, index) => {
      const validation = validateHistory(record);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          report.issues.history.push({
            type: 'error',
            message: error,
            recordId: record.id,
            recordIndex: index
          });
        });
      }

      // Check for unusual vital signs
      if (record.vitalSigns?.preDialysis) {
        const pre = record.vitalSigns.preDialysis;
        if (pre.bloodPressure && !isValidBloodPressure(pre.bloodPressure)) {
          report.issues.history.push({
            type: 'warning',
            message: 'Invalid pre-dialysis blood pressure format',
            recordId: record.id,
            field: 'vitalSigns.preDialysis.bloodPressure',
            value: pre.bloodPressure
          });
        }
        if (pre.heartRate && (pre.heartRate < 40 || pre.heartRate > 200)) {
          report.issues.history.push({
            type: 'warning',
            message: 'Unusual pre-dialysis heart rate',
            recordId: record.id,
            field: 'vitalSigns.preDialysis.heartRate',
            value: pre.heartRate
          });
        }
      }
    });
  }

  // Generate recommendations
  const totalErrors = Object.values(report.issues).flat().filter(issue => issue.type === 'error').length;
  const totalWarnings = Object.values(report.issues).flat().filter(issue => issue.type === 'warning').length;

  if (totalErrors > 0) {
    report.recommendations.push(`Fix ${totalErrors} data validation errors to ensure data integrity`);
  }

  if (totalWarnings > 0) {
    report.recommendations.push(`Review ${totalWarnings} warnings for potential data quality improvements`);
  }

  if (report.summary.totalPatients === 0) {
    report.recommendations.push('Add patient data to start using the system');
  }

  if (report.summary.totalAppointments === 0) {
    report.recommendations.push('Schedule appointments for patients');
  }

  if (report.summary.totalHistory === 0) {
    report.recommendations.push('Record dialysis session history for patients');
  }

  report.recommendations.push('Regularly backup the database to prevent data loss');
  report.recommendations.push('Implement data validation at the frontend level to prevent invalid data entry');

  return report;
}

// Print report
function printReport(report) {
  console.log('\n=== DATA QUALITY REPORT ===');
  console.log(`Generated: ${new Date(report.timestamp).toLocaleString()}`);
  
  console.log('\n--- SUMMARY ---');
  console.log(`Patients: ${report.summary.totalPatients}`);
  console.log(`Appointments: ${report.summary.totalAppointments}`);
  console.log(`Billing Records: ${report.summary.totalBilling}`);
  console.log(`History Records: ${report.summary.totalHistory}`);
  console.log(`Flow Charts: ${report.summary.totalFlowCharts}`);
  console.log(`Haemodialysis Records: ${report.summary.totalHaemodialysisRecords}`);

  console.log('\n--- ISSUES ---');
  Object.entries(report.issues).forEach(([category, issues]) => {
    if (issues.length > 0) {
      console.log(`\n${category.toUpperCase()}:`);
      issues.forEach(issue => {
        const prefix = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`  ${prefix} ${issue.message}`);
        if (issue.recordId) {
          console.log(`    Record ID: ${issue.recordId}`);
        }
        if (issue.field) {
          console.log(`    Field: ${issue.field}`);
        }
        if (issue.value) {
          console.log(`    Value: ${issue.value}`);
        }
      });
    }
  });

  console.log('\n--- RECOMMENDATIONS ---');
  report.recommendations.forEach(rec => {
    console.log(`• ${rec}`);
  });

  console.log('\n=== END REPORT ===\n');
}

// Run the report
if (require.main === module) {
  const report = generateDataQualityReport();
  printReport(report);
}

module.exports = { generateDataQualityReport, printReport }; 