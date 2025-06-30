import { readDatabase } from '../db/dbOperations';
import { DataValidator } from './dataValidation';

export interface DataQualityReport {
  timestamp: string;
  summary: {
    totalPatients: number;
    totalAppointments: number;
    totalBilling: number;
    totalHistory: number;
    totalFlowCharts: number;
    totalHaemodialysisRecords: number;
  };
  issues: {
    patients: DataIssue[];
    appointments: DataIssue[];
    billing: DataIssue[];
    history: DataIssue[];
    flowCharts: DataIssue[];
    haemodialysisRecords: DataIssue[];
  };
  recommendations: string[];
}

export interface DataIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  recordId?: string;
  field?: string;
  value?: any;
}

export class DataQualityReporter {
  
  static generateReport(): DataQualityReport {
    const db = readDatabase();
    const report: DataQualityReport = {
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
      report.issues.patients = this.analyzePatients(db.patients);
    }

    // Analyze appointments
    if (db.appointments) {
      report.issues.appointments = this.analyzeAppointments(db.appointments);
    }

    // Analyze billing
    if (db.billing) {
      report.issues.billing = this.analyzeBilling(db.billing);
    }

    // Analyze history
    if (db.history) {
      report.issues.history = this.analyzeHistory(db.history);
    }

    // Analyze flow charts
    if (db.dialysisFlowCharts) {
      report.issues.flowCharts = this.analyzeFlowCharts(db.dialysisFlowCharts);
    }

    // Analyze haemodialysis records
    if (db.haemodialysisRecords) {
      report.issues.haemodialysisRecords = this.analyzeHaemodialysisRecords(db.haemodialysisRecords);
    }

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report);

    return report;
  }

  private static analyzePatients(patients: any[]): DataIssue[] {
    const issues: DataIssue[] = [];
    
    patients.forEach((patient, index) => {
      const validation = DataValidator.validatePatient(patient);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          issues.push({
            type: 'error',
            message: error,
            recordId: patient.id,
            field: this.extractFieldFromError(error)
          });
        });
      }

      // Check for duplicate mobile numbers
      const duplicateMobile = patients.filter(p => p.mobileNo === patient.mobileNo);
      if (duplicateMobile.length > 1) {
        issues.push({
          type: 'warning',
          message: 'Duplicate mobile number found',
          recordId: patient.id,
          field: 'mobileNo',
          value: patient.mobileNo
        });
      }

      // Check for missing critical fields
      if (!patient.catheterInsertionDate && !patient.fistulaCreationDate) {
        issues.push({
          type: 'warning',
          message: 'Missing both catheter and fistula dates',
          recordId: patient.id
        });
      }
    });

    return issues;
  }

  private static analyzeAppointments(appointments: any[]): DataIssue[] {
    const issues: DataIssue[] = [];
    
    appointments.forEach((appointment, index) => {
      const validation = DataValidator.validateAppointment(appointment);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          issues.push({
            type: 'error',
            message: error,
            recordId: appointment.id,
            field: this.extractFieldFromError(error)
          });
        });
      }

      // Check for overlapping appointments
      const sameTimeAppointments = appointments.filter(a => 
        a.date === appointment.date && 
        a.time === appointment.time && 
        a.id !== appointment.id
      );
      if (sameTimeAppointments.length > 0) {
        issues.push({
          type: 'warning',
          message: 'Potential appointment time conflict',
          recordId: appointment.id,
          field: 'time',
          value: appointment.time
        });
      }
    });

    return issues;
  }

  private static analyzeBilling(billing: any[]): DataIssue[] {
    const issues: DataIssue[] = [];
    
    billing.forEach((bill, index) => {
      const validation = DataValidator.validateBilling(bill);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          issues.push({
            type: 'error',
            message: error,
            recordId: bill.id,
            field: this.extractFieldFromError(error)
          });
        });
      }

      // Check for unusual amounts
      if (bill.amount > 10000) {
        issues.push({
          type: 'warning',
          message: 'Unusually high billing amount',
          recordId: bill.id,
          field: 'amount',
          value: bill.amount
        });
      }
    });

    return issues;
  }

  private static analyzeHistory(history: any[]): DataIssue[] {
    const issues: DataIssue[] = [];
    
    history.forEach((record, index) => {
      const validation = DataValidator.validateHistory(record);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          issues.push({
            type: 'error',
            message: error,
            recordId: record.id,
            field: this.extractFieldFromError(error)
          });
        });
      }

      // Check for unusual vital signs
      if (record.vitalSigns?.preDialysis) {
        const pre = record.vitalSigns.preDialysis;
        if (pre.heartRate && (pre.heartRate < 40 || pre.heartRate > 120)) {
          issues.push({
            type: 'warning',
            message: 'Unusual pre-dialysis heart rate',
            recordId: record.id,
            field: 'vitalSigns.preDialysis.heartRate',
            value: pre.heartRate
          });
        }
      }
    });

    return issues;
  }

  private static analyzeFlowCharts(charts: any[]): DataIssue[] {
    const issues: DataIssue[] = [];
    
    charts.forEach((chart, index) => {
      const validation = DataValidator.validateDialysisFlowChart(chart);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          issues.push({
            type: 'error',
            message: error,
            recordId: chart.id,
            field: this.extractFieldFromError(error)
          });
        });
      }
    });

    return issues;
  }

  private static analyzeHaemodialysisRecords(records: any[]): DataIssue[] {
    const issues: DataIssue[] = [];
    
    records.forEach((record, index) => {
      const validation = DataValidator.validateHaemodialysisRecord(record);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          issues.push({
            type: 'error',
            message: error,
            recordId: record.id,
            field: this.extractFieldFromError(error)
          });
        });
      }
    });

    return issues;
  }

  private static extractFieldFromError(error: string): string | undefined {
    // Simple field extraction from error messages
    if (error.includes('blood pressure')) return 'bloodPressure';
    if (error.includes('heart rate')) return 'heartRate';
    if (error.includes('mobile number')) return 'mobileNo';
    if (error.includes('blood group')) return 'bloodGroup';
    if (error.includes('date of birth')) return 'dateOfBirth';
    return undefined;
  }

  private static generateRecommendations(report: DataQualityReport): string[] {
    const recommendations: string[] = [];
    
    const totalErrors = Object.values(report.issues).flat().filter(issue => issue.type === 'error').length;
    const totalWarnings = Object.values(report.issues).flat().filter(issue => issue.type === 'warning').length;

    if (totalErrors > 0) {
      recommendations.push(`Fix ${totalErrors} data validation errors to ensure data integrity`);
    }

    if (totalWarnings > 0) {
      recommendations.push(`Review ${totalWarnings} warnings for potential data quality improvements`);
    }

    if (report.summary.totalPatients === 0) {
      recommendations.push('Add patient data to start using the system');
    }

    if (report.summary.totalAppointments === 0) {
      recommendations.push('Schedule appointments for patients');
    }

    if (report.summary.totalHistory === 0) {
      recommendations.push('Record dialysis session history for patients');
    }

    recommendations.push('Regularly backup the database to prevent data loss');
    recommendations.push('Implement data validation at the frontend level to prevent invalid data entry');

    return recommendations;
  }

  static printReport(report: DataQualityReport): void {
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
        });
      }
    });

    console.log('\n--- RECOMMENDATIONS ---');
    report.recommendations.forEach(rec => {
      console.log(`• ${rec}`);
    });

    console.log('\n=== END REPORT ===\n');
  }
} 