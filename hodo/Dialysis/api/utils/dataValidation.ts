// Data validation schemas and functions
export class DataValidator {
  
  // Patient validation
  static validatePatient(patient: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
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
    
    if (!patient.dateOfBirth || !this.isValidDate(patient.dateOfBirth)) {
      errors.push('Valid date of birth is required');
    }
    
    if (!patient.mobileNo || !this.isValidPhone(patient.mobileNo)) {
      errors.push('Valid mobile number is required');
    }
    
    if (!patient.bloodGroup || !this.isValidBloodGroup(patient.bloodGroup)) {
      errors.push('Valid blood group is required');
    }
    
    if (patient.catheterInsertionDate && !this.isValidDate(patient.catheterInsertionDate)) {
      errors.push('Valid catheter insertion date is required');
    }
    
    if (patient.fistulaCreationDate && !this.isValidDate(patient.fistulaCreationDate)) {
      errors.push('Valid fistula creation date is required');
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  // Appointment validation
  static validateAppointment(appointment: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!appointment.patientId || typeof appointment.patientId !== 'string') {
      errors.push('Patient ID is required');
    }
    
    if (!appointment.dialysisUnit || !['Unit A', 'Unit B', 'Unit C', 'Unit D'].includes(appointment.dialysisUnit)) {
      errors.push('Valid dialysis unit is required');
    }
    
    if (!appointment.date || !this.isValidDate(appointment.date)) {
      errors.push('Valid appointment date is required');
    }
    
    if (!appointment.time || !this.isValidTime(appointment.time)) {
      errors.push('Valid appointment time is required');
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  // Billing validation
  static validateBilling(billing: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!billing.patientId || typeof billing.patientId !== 'string') {
      errors.push('Patient ID is required');
    }
    
    if (!billing.sessionDate || !this.isValidDate(billing.sessionDate)) {
      errors.push('Valid session date is required');
    }
    
    if (!billing.sessionDuration || typeof billing.sessionDuration !== 'number' || billing.sessionDuration <= 0) {
      errors.push('Valid session duration is required');
    }
    
    if (!billing.amount || typeof billing.amount !== 'number' || billing.amount < 0) {
      errors.push('Valid amount is required');
    }
    
    if (!billing.status || !['PAID', 'PENDING', 'CANCELLED'].includes(billing.status)) {
      errors.push('Valid status is required');
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  // History validation
  static validateHistory(history: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!history.patientId || typeof history.patientId !== 'string') {
      errors.push('Patient ID is required');
    }
    
    if (!history.startTime || !this.isValidTime(history.startTime)) {
      errors.push('Valid start time is required');
    }
    
    if (!history.endTime || !this.isValidTime(history.endTime)) {
      errors.push('Valid end time is required');
    }
    
    if (!history.date || !this.isValidDate(history.date)) {
      errors.push('Valid date is required');
    }
    
    // Validate vital signs
    if (history.vitalSigns) {
      if (history.vitalSigns.preDialysis) {
        const preDialysis = history.vitalSigns.preDialysis;
        if (preDialysis.bloodPressure && !this.isValidBloodPressure(preDialysis.bloodPressure)) {
          errors.push('Valid pre-dialysis blood pressure format required (e.g., 120/80)');
        }
        if (preDialysis.heartRate && (typeof preDialysis.heartRate !== 'number' || preDialysis.heartRate < 40 || preDialysis.heartRate > 200)) {
          errors.push('Valid pre-dialysis heart rate required (40-200)');
        }
        if (preDialysis.temperature && (typeof preDialysis.temperature !== 'number' || preDialysis.temperature < 30 || preDialysis.temperature > 45)) {
          errors.push('Valid pre-dialysis temperature required (30-45°C)');
        }
        if (preDialysis.weight && (typeof preDialysis.weight !== 'number' || preDialysis.weight < 20 || preDialysis.weight > 300)) {
          errors.push('Valid pre-dialysis weight required (20-300 kg)');
        }
      }
      
      if (history.vitalSigns.postDialysis) {
        const postDialysis = history.vitalSigns.postDialysis;
        if (postDialysis.bloodPressure && !this.isValidBloodPressure(postDialysis.bloodPressure)) {
          errors.push('Valid post-dialysis blood pressure format required (e.g., 120/80)');
        }
        if (postDialysis.heartRate && (typeof postDialysis.heartRate !== 'number' || postDialysis.heartRate < 40 || postDialysis.heartRate > 200)) {
          errors.push('Valid post-dialysis heart rate required (40-200)');
        }
        if (postDialysis.temperature && (typeof postDialysis.temperature !== 'number' || postDialysis.temperature < 30 || postDialysis.temperature > 45)) {
          errors.push('Valid post-dialysis temperature required (30-45°C)');
        }
        if (postDialysis.weight && (typeof postDialysis.weight !== 'number' || postDialysis.weight < 20 || postDialysis.weight > 300)) {
          errors.push('Valid post-dialysis weight required (20-300 kg)');
        }
      }
    }
    
    // Validate lab results
    if (history.labResults) {
      const lab = history.labResults;
      if (lab.urea && (typeof lab.urea !== 'number' || lab.urea < 0 || lab.urea > 1000)) {
        errors.push('Valid urea level required (0-1000 mg/dL)');
      }
      if (lab.creatinine && (typeof lab.creatinine !== 'number' || lab.creatinine < 0 || lab.creatinine > 100)) {
        errors.push('Valid creatinine level required (0-100 mg/dL)');
      }
      if (lab.potassium && (typeof lab.potassium !== 'number' || lab.potassium < 1 || lab.potassium > 10)) {
        errors.push('Valid potassium level required (1-10 mEq/L)');
      }
      if (lab.sodium && (typeof lab.sodium !== 'number' || lab.sodium < 100 || lab.sodium > 200)) {
        errors.push('Valid sodium level required (100-200 mEq/L)');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  // Dialysis Flow Chart validation
  static validateDialysisFlowChart(chart: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!chart.patientId || typeof chart.patientId !== 'string') {
      errors.push('Patient ID is required');
    }
    
    if (!chart.date || !this.isValidDate(chart.date)) {
      errors.push('Valid date is required');
    }
    
    if (!chart.bloodAccess || !['AV Fistula', 'AV Graft', 'Catheter', 'Other'].includes(chart.bloodAccess)) {
      errors.push('Valid blood access type is required');
    }
    
    if (!chart.hdStartingTime || !this.isValidTime(chart.hdStartingTime)) {
      errors.push('Valid HD starting time is required');
    }
    
    if (!chart.hdClosingTime || !this.isValidTime(chart.hdClosingTime)) {
      errors.push('Valid HD closing time is required');
    }
    
    if (chart.bloodFlowRate && (typeof chart.bloodFlowRate !== 'string' || !this.isValidNumber(chart.bloodFlowRate))) {
      errors.push('Valid blood flow rate is required');
    }
    
    if (chart.bpBeforeDialysis && !this.isValidBloodPressure(chart.bpBeforeDialysis)) {
      errors.push('Valid BP before dialysis format required (e.g., 120/80)');
    }
    
    if (chart.bpAfterDialysis && !this.isValidBloodPressure(chart.bpAfterDialysis)) {
      errors.push('Valid BP after dialysis format required (e.g., 120/80)');
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  // Haemodialysis Record validation
  static validateHaemodialysisRecord(record: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!record.patientId || typeof record.patientId !== 'string') {
      errors.push('Patient ID is required');
    }
    
    if (!record.date || !this.isValidDate(record.date)) {
      errors.push('Valid date is required');
    }
    
    if (!record.rows || !Array.isArray(record.rows)) {
      errors.push('Rows array is required');
    }
    
    // Validate each row
    if (record.rows && Array.isArray(record.rows)) {
      record.rows.forEach((row: any, index: number) => {
        if (!row.time || !this.isValidTime(row.time)) {
          errors.push(`Row ${index + 1}: Valid time is required`);
        }
        if (row.bp && !this.isValidBloodPressure(row.bp)) {
          errors.push(`Row ${index + 1}: Valid BP format required (e.g., 120/80)`);
        }
        if (row.pulse && (typeof row.pulse !== 'string' || !this.isValidNumber(row.pulse))) {
          errors.push(`Row ${index + 1}: Valid pulse rate required`);
        }
        if (row.temperature && (typeof row.temperature !== 'string' || !this.isValidNumber(row.temperature))) {
          errors.push(`Row ${index + 1}: Valid temperature required`);
        }
      });
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  // Helper validation methods
  private static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
  
  private static isValidTime(timeString: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeString);
  }
  
  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  }
  
  private static isValidBloodGroup(bloodGroup: string): boolean {
    const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return validGroups.includes(bloodGroup);
  }
  
  private static isValidBloodPressure(bp: string): boolean {
    const bpRegex = /^\d{2,3}\/\d{2,3}$/;
    if (!bpRegex.test(bp)) return false;
    
    const [systolic, diastolic] = bp.split('/').map(Number);
    return systolic >= 70 && systolic <= 300 && diastolic >= 40 && diastolic <= 200;
  }
  
  private static isValidNumber(value: string): boolean {
    return !isNaN(Number(value)) && Number(value) >= 0;
  }
  
  // Data cleaning methods
  static cleanPatientData(patient: any): any {
    return {
      id: patient.id?.toString(),
      firstName: patient.firstName?.trim(),
      lastName: patient.lastName?.trim(),
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth,
      mobileNo: patient.mobileNo?.toString(),
      bloodGroup: patient.bloodGroup,
      catheterInsertionDate: patient.catheterInsertionDate,
      fistulaCreationDate: patient.fistulaCreationDate
    };
  }
  
  static cleanAppointmentData(appointment: any): any {
    return {
      id: appointment.id?.toString(),
      patientId: appointment.patientId?.toString(),
      dialysisUnit: appointment.dialysisUnit,
      technician: appointment.technician?.trim(),
      admittingDoctor: appointment.admittingDoctor?.trim(),
      date: appointment.date,
      time: appointment.time,
      remarks: appointment.remarks?.trim() || 'Regular dialysis session',
      patientName: appointment.patientName?.trim()
    };
  }
  
  static cleanHistoryData(history: any): any {
    return {
      id: history.id?.toString(),
      patientId: history.patientId?.toString(),
      startTime: history.startTime,
      endTime: history.endTime,
      vitalSigns: history.vitalSigns,
      labResults: history.labResults,
      treatmentParameters: history.treatmentParameters,
      nursingNotes: history.nursingNotes?.trim(),
      patientName: history.patientName?.trim(),
      date: history.date
    };
  }
} 