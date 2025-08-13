import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import StepperNavigation from '../components/StepperNavigation';
import Table from '../components/Table';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import EditModal from '../components/EditModal';
import { predialysisFormConfig, startDialysisFormConfig, postDialysisFormConfig } from '../components/forms/formConfigs';
import { API_URL } from '../config';
import { toast } from 'react-toastify';

const predialysisColumns = [
  { key: 'date', header: 'Date' },
  { key: 'time', header: 'Time' },
  { key: 'PreDR_DS_ID_FK', header: 'Schedule ID' },
  { key: 'patientId', header: 'Patient ID' },
  { key: 'patientName', header: 'Patient Name' },
  { key: 'PreDR_Vitals_BP', header: 'BP' },
  { key: 'PreDR_Vitals_HeartRate', header: 'Heart Rate' },
  { key: 'PreDR_Vitals_Temperature', header: 'Temperature' },
  { key: 'PreDR_Vitals_Weight', header: 'Weight' },
  { key: 'PreDR_Notes', header: 'Notes' },
];
const startDialysisColumns = [
  { key: 'date', header: 'Date' },
  { key: 'time', header: 'Time' },
  { key: 'SA_ID_PK_FK', header: 'Schedule ID' },
  { key: 'patientId', header: 'Patient ID' },
  { key: 'patientName', header: 'Patient Name' },
  { key: 'SDR_Dialysis_Unit', header: 'Unit' },
  { key: 'SDR_Start_Time', header: 'Start Time' },
  { key: 'SDR_Vascular_Access', header: 'Vascular Access' },
  { key: 'SDR_Dialyzer_Type', header: 'Dialyzer Type' },
  { key: 'SDR_Notes', header: 'Notes' },
];
const postDialysisColumns = [
  { key: 'date', header: 'Date' },
  { key: 'time', header: 'Time' },
  { key: 'PostDR_DS_ID_FK', header: 'Schedule ID' },
  { key: 'patientId', header: 'Patient ID' },
  { key: 'patientName', header: 'Patient Name' },
  { key: 'PostDR_Vitals_BP', header: 'BP' },
  { key: 'PostDR_Vitals_HeartRate', header: 'Heart Rate' },
  { key: 'PostDR_Vitals_Temperature', header: 'Temperature' },
  { key: 'PostDR_Vitals_Weight', header: 'Weight' },
  { key: 'PostDR_Notes', header: 'Notes' },
];

const getFormConfigForStep = (step: number, options?: any) => {
  if (step === 0) return predialysisFormConfig;
  if (step === 1) {
    // Create a copy of the config with dynamic options
    const config = { ...startDialysisFormConfig };
    config.fields = config.fields.map(field => {
      if (field.name === 'SDR_Dialysis_Unit') {
        return { ...field, options: options?.units || [] };
      }
      if (field.name === 'SDR_Vascular_Access') {
        return { ...field, options: options?.accessTypes || [] };
      }
      if (field.name === 'SDR_Dialyzer_Type') {
        return { ...field, options: options?.dialyzerTypes || [] };
      }
      return field;
    });
    return config;
  }
  if (step === 2) return postDialysisFormConfig;
  return predialysisFormConfig;
};

const getEditEndpointForStep = (step: number) => {
  if (step === 0) return 'predialysis_record';
  if (step === 1) return 'start_dialysis_record';
  if (step === 2) return 'post_dialysis_record';
  return '';
};

// Helper to format time as HH:mm
// const formatTimeHHMM = (val: string) => {
//   if (!val) return '';
//   // Handles both 'HH:mm:ss.fff...' and 'HH:mm:ss' and 'HH:mm'
//   const match = val.match(/^(\d{2}:\d{2})/);
//   return match ? match[1] : val;
// };

const formatTimeHHMM = (val: string) => {
  if (!val) return '';

  // Try parsing as date/time
  const dateObj = new Date(val);
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toISOString().substring(11, 16); // HH:mm
  }

  // Fallback: match HH:mm anywhere
  const match = val.match(/(\d{2}:\d{2})/);
  return match ? match[1] : val;
};




const mapRowToFormData = (row: any, step: number, patients: any[], schedules: any[]) => {
  if (step === 0) {
    const patient = patients.find(p => p.id === row.PreDR_P_ID_FK);
    const schedule = schedules.find(s => s.DS_ID_PK === row.PreDR_DS_ID_FK);
    return {
      patientId: patient ? patient.id : row.PreDR_P_ID_FK,
      patientName: patient ? patient.name : '',
      date: schedule ? schedule.DS_Date : row.date,
      time: schedule ? schedule.DS_Time : row.time,
      PreDR_Vitals_BP: row.PreDR_Vitals_BP,
      PreDR_Vitals_HeartRate: row.PreDR_Vitals_HeartRate,
      PreDR_Vitals_Temperature: row.PreDR_Vitals_Temperature,
      PreDR_Vitals_Weight: row.PreDR_Vitals_Weight,
      PreDR_Notes: row.PreDR_Notes,
      PreDR_DS_ID_FK: row.PreDR_DS_ID_FK,
      PreDR_ID_PK: row.PreDR_ID_PK, // Ensure PreDR_ID_PK is always present
    };
  }
  if (step === 1) {
    const schedule = schedules.find(s => s.DS_ID_PK === row.SA_ID_PK_FK);
    const patient = schedule ? patients.find(p => p.id === schedule.DS_P_ID_FK) : undefined;
    return {
      patientName: patient ? patient.name : '',
      patientId: patient ? patient.id : (schedule ? schedule.DS_P_ID_FK : ''),
      date: schedule ? schedule.DS_Date : row.date,
      time: schedule ? schedule.DS_Time : row.time,
      SDR_Dialysis_Unit: row.SDR_Dialysis_Unit,
      SDR_Start_Time: formatTimeHHMM(row.SDR_Start_Time),
      SDR_Vascular_Access: row.SDR_Vascular_Access,
      SDR_Dialyzer_Type: row.SDR_Dialyzer_Type,
      SDR_Notes: row.SDR_Notes,
      SA_ID_PK_FK: row.SA_ID_PK_FK,
      SDR_ID_PK: row.SDR_ID_PK, // Use SDR_ID_PK for start dialysis records
    };
  }
  if (step === 2) {
    const patient = patients.find(p => p.id === row.PostDR_P_ID_FK);
    const schedule = schedules.find(s => s.DS_ID_PK === row.PostDR_DS_ID_FK);
    return {
      patientId: patient ? patient.id : row.PostDR_P_ID_FK,
      patientName: patient ? patient.name : '',
      date: schedule ? schedule.DS_Date : row.date,
      time: schedule ? schedule.DS_Time : row.time,
      PostDR_Vitals_BP: row.PostDR_Vitals_BP,
      PostDR_Vitals_HeartRate: row.PostDR_Vitals_HeartRate,
      PostDR_Vitals_Temperature: row.PostDR_Vitals_Temperature,
      PostDR_Vitals_Weight: row.PostDR_Vitals_Weight,
      PostDR_Notes: row.PostDR_Notes,
      PostDR_DS_ID_FK: row.PostDR_DS_ID_FK,
      PostDR_ID_PK: row.PostDR_ID_PK,
    };
  }
  return row;
};

const HDflow_Records: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [scheduleOptions, setScheduleOptions] = useState<{ value: string; label: string; patientId: string; date: string; time?: string }[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [predialysisRecords, setPredialysisRecords] = useState<any[]>([]);
  const [startDialysisRecords, setStartDialysisRecords] = useState<any[]>([]);
  const [postDialysisRecords, setPostDialysisRecords] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [formOptions, setFormOptions] = useState<{
    units: Array<{ value: string; label: string }>;
    accessTypes: Array<{ value: string; label: string }>;
    dialyzerTypes: Array<{ value: string; label: string }>;
  }>({
    units: [],
    accessTypes: [],
    dialyzerTypes: []
  });

  // Fetch form options for dropdowns
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/data/units`).then(res => res.json()),
      fetch(`${API_URL}/data/vascular_access`).then(res => res.json()),
      fetch(`${API_URL}/data/dialyzer_types`).then(res => res.json()),
    ]).then(([units, accessTypes, dialyzerTypes]) => {
      const formOptionsData = {
        units: Array.isArray(units) ? units.map((u: any) => ({ 
          value: u.Unit_Name || u.name, 
          label: u.Unit_Name || u.name 
        })) : [],
        accessTypes: Array.isArray(accessTypes) ? accessTypes.map((a: any) => ({ 
          value: a.VAL_Access_Type || a.type, 
          label: a.VAL_Access_Type || a.type 
        })) : [],
        dialyzerTypes: Array.isArray(dialyzerTypes) ? dialyzerTypes.map((d: any) => ({ 
          value: d.DTL_Dialyzer_Name || d.name, 
          label: d.DTL_Dialyzer_Name || d.name 
        })) : []
      };
      
      setFormOptions(formOptionsData);
    }).catch(error => {
      console.error('Error fetching form options:', error);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/data/Dialysis_Schedules`).then(res => res.json()),
      fetch(`${API_URL}/data/patients_derived`).then(res => res.json()),
      fetch(`${API_URL}/data/predialysis_records`).then(res => res.json()),
      fetch(`${API_URL}/data/start_dialysis_records`).then(res => res.json()),
      fetch(`${API_URL}/data/post_dialysis_records`).then(res => res.json()),
    ]).then(([schedules, patientsData, predialysis, startDialysis, postDialysis]) => {
      // Defensive: if any fetch returns an error object, replace with []
      const safeSchedules = Array.isArray(schedules) ? schedules : [];
      const safePatients = Array.isArray(patientsData) ? patientsData : [];
      const safePredialysis = Array.isArray(predialysis) ? predialysis : [];
      const safeStartDialysis = Array.isArray(startDialysis) ? startDialysis : [];
      const safePostDialysis = Array.isArray(postDialysis) ? postDialysis : [];
      setSchedules(safeSchedules);
      // setPatients(safePatients.map((p: any) => ({ PreDR_ID_PK: p.PreDR_ID_PK, name: p.Name || p.name })));
      setPatients(
        patientsData
          .filter((p: any) => !!p.id)
          .map((p: any) => ({
            id: p.id || p.PM_Card_PK,
            name: p.Name || p.PatientName || "Unnamed"
          }))
      );


      // const options = safeSchedules.filter((a: any) => a.Status === 10).map((sch: any) => {
      //   const patient = safePatients.find((p: any) => p.PreDR_ID_PK === sch.P_ID_FK);
      //   const patientLabel = patient ? (patient['Name'] || patient.name) : sch.P_ID_FK;
      //   return {
      //     value: sch.DS_ID_PK,
      //     label: `${sch.DS_ID_PK} - ${patientLabel}`,
      //     patientId: sch.P_ID_FK,
      //     date: sch.DS_Date,
      //     time: sch.DS_Time
      //   };
      // });
      const options = schedules.filter((a: any) => a.DS_Status === 10).map((sch: any) => {
        const patient = patientsData.find((pd: any) => pd.id === sch.DS_P_ID_FK);
        // console.log("&&&patient:", patient);
        // console.log("&&&sch:", sch);
        // console.log("&&&patientsData:", patientsData);

        const patientLabel = patient ? (patient['Name'] || patient.Name || "Unnamed") : sch.PatientName;
        return {
          value: sch.DS_ID_PK,
          label: `SID: ${sch.DS_ID_PK} - ${patientLabel}`,
          patientId: sch.DS_P_ID_FK,
          date: sch.DS_Date
        };
      });

      setScheduleOptions(options);
      setPredialysisRecords(safePredialysis);
      setStartDialysisRecords(safeStartDialysis);
      setPostDialysisRecords(safePostDialysis);
      setLoading(false);
    });
  }, []);

  const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchedule(e.target.value);
  };
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };
  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPatient(e.target.value);
    setSelectedSchedule('');
  };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setSelectedSchedule('');
  };

  const handleFromDateChange = (date: string) => {
    setFromDate(date);
    setSelectedSchedule('');
  };

  const handleToDateChange = (date: string) => {
    setToDate(date);
    setSelectedSchedule('');
  };

  const handleEdit = (row: any) => {
    setEditRow(mapRowToFormData(row, currentStep, patients, schedules));
    setEditModalOpen(true);
  };

  const handleDelete = async (row: any) => {
    if (!window.confirm('Are you sure you want to soft delete this record?')) {
      return;
    }

    try {
      const endpoint = getEditEndpointForStep(currentStep);
      let deletePayload: any = {};

      // Set the appropriate ID field and soft delete flag based on the step
      if (currentStep === 0) {
        deletePayload = { PreDR_ID_PK: row.PreDR_ID_PK, deleted: true };
      } else if (currentStep === 1) {
        deletePayload = { SDR_ID_PK: row.SDR_ID_PK, deleted: true };
      } else if (currentStep === 2) {
        deletePayload = { PostDR_ID_PK: row.PostDR_ID_PK, deleted: true };
      }

      const response = await fetch(`${API_URL}/data/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deletePayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success('Record soft deleted successfully!');

      // Refresh the data
      setLoading(true);
      Promise.all([
        fetch(`${API_URL}/data/Dialysis_Schedules`).then(res => res.json()),
        fetch(`${API_URL}/data/patients_derived`).then(res => res.json()),
        fetch(`${API_URL}/data/predialysis_records`).then(res => res.json()),
        fetch(`${API_URL}/data/start_dialysis_records`).then(res => res.json()),
        fetch(`${API_URL}/data/post_dialysis_records`).then(res => res.json()),
      ]).then(([schedules, patientsData, predialysis, startDialysis, postDialysis]) => {
        setSchedules(schedules);
        setPatients(
          patientsData
            .filter((p: any) => !!p.id)
            .map((p: any) => ({
              id: p.id || p.PM_Card_PK,
              name: p.Name || p.PatientName || "Unnamed"
            }))
        );

        const options = schedules.filter((a: any) => a.DS_Status === 10).map((sch: any) => {
          const patient = patientsData.find((pd: any) => pd.id === sch.DS_P_ID_FK);
          const patientLabel = patient ? (patient['Name'] || patient.Name || "Unnamed") : sch.PatientName;
          return {
            value: sch.DS_ID_PK,
            label: `SID: ${sch.DS_ID_PK} - ${patientLabel}`,
            patientId: sch.DS_P_ID_FK,
            date: sch.DS_Date
          };
        });

        setScheduleOptions(options);
        setPredialysisRecords(predialysis);
        setStartDialysisRecords(startDialysis);
        setPostDialysisRecords(postDialysis);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record. Please try again.');
    }
  };

  const handleEditSubmit = async (values: any) => {
    setEditLoading(true);
    try {
      const endpoint = getEditEndpointForStep(currentStep);
      console.log('Submitting values to backend:', values);

      // Prepare payload based on step
      let cleanedValues: any = { ...values };

      // Remove read-only fields and ensure proper ID field is included
      delete cleanedValues.patientId;
      delete cleanedValues.patientName;
      delete cleanedValues.date;
      delete cleanedValues.time;

      // Ensure the correct ID field is included for each step
      if (currentStep === 0 && editRow?.PreDR_ID_PK) {
        cleanedValues.PreDR_ID_PK = editRow.PreDR_ID_PK;
      } else if (currentStep === 1 && editRow?.SDR_ID_PK) {
        cleanedValues.SDR_ID_PK = editRow.SDR_ID_PK;
      } else if (currentStep === 2 && editRow?.PostDR_ID_PK) {
        cleanedValues.PostDR_ID_PK = editRow.PostDR_ID_PK;
      }

      const response = await fetch(`${API_URL}/data/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedValues),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success('Record updated successfully!');
      setEditModalOpen(false);
      setEditRow(null);
      setLoading(true);
      Promise.all([
        fetch(`${API_URL}/data/Dialysis_Schedules`).then(res => res.json()),
        fetch(`${API_URL}/data/patients_derived`).then(res => res.json()),
        fetch(`${API_URL}/data/predialysis_records`).then(res => res.json()),
        fetch(`${API_URL}/data/start_dialysis_records`).then(res => res.json()),
        fetch(`${API_URL}/data/post_dialysis_records`).then(res => res.json()),
      ]).then(([schedules, patientsData, predialysis, startDialysis, postDialysis]) => {
        setSchedules(schedules);
        setPatients(
          patientsData
            .filter((p: any) => !!p.id)
            .map((p: any) => ({
              id: p.id || p.PM_Card_PK,
              name: p.Name || p.PatientName || "Unnamed"
            }))
        );

        const options = schedules.filter((a: any) => a.DS_Status === 10).map((sch: any) => {
          const patient = patientsData.find((pd: any) => pd.id === sch.DS_P_ID_FK);
          const patientLabel = patient ? (patient['Name'] || patient.Name || "Unnamed") : sch.PatientName;
          return {
            value: sch.DS_ID_PK,
            label: `SID: ${sch.DS_ID_PK} - ${patientLabel}`,
            patientId: sch.DS_P_ID_FK,
            date: sch.DS_Date
          };
        });
        setScheduleOptions(options);
        setPredialysisRecords(predialysis);
        setStartDialysisRecords(startDialysis);
        setPostDialysisRecords(postDialysis);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Failed to update record. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // Helper to add date/time to each record
  const addDateTimeToRecords = (records: any[], getScheduleId: (r: any) => string) => {
    return records.map(r => {
      const schedule = schedules.find((s: any) => s.DS_ID_PK === getScheduleId(r));
      return {
        ...r,
        date: schedule ? schedule.DS_Date : '',
        time: schedule ? schedule.DS_Time : '',
      };
    });
  };

  // Filter records by selected schedule, patient, and date range
  let filteredRecords: any[] = [];
  let columns: any[] = [];
  
  const applyDateRangeFilter = (recordDate: string) => {
    if (!fromDate && !toDate) return true;
    if (fromDate && recordDate < fromDate) return false;
    if (toDate && recordDate > toDate) return false;
    return true;
  };

  if (currentStep === 0) {
    columns = predialysisColumns;
    filteredRecords = addDateTimeToRecords(
      predialysisRecords.filter(r => {
        const patient = patients.find(p => p.id === r.PreDR_P_ID_FK);
        const schedule = schedules.find(s => s.DS_ID_PK === r.PreDR_DS_ID_FK);
        const recordDate = schedule?.DS_Date || r.date;
        
        return (
          (selectedSchedule ? r.PreDR_DS_ID_FK === selectedSchedule : true) &&
          (selectedPatient ? (patient && patient.id === selectedPatient) : true) &&
          (selectedDate ? (recordDate === selectedDate) : true) &&
          applyDateRangeFilter(recordDate)
        );
      }),
      r => r.PreDR_DS_ID_FK
    ).map(r => {
      // Add patient info for predialysis records
      const patient = patients.find(p => p.id === r.PreDR_P_ID_FK);
      return {
        ...r,
        patientId: patient ? patient.id : r.PreDR_P_ID_FK,
        patientName: patient ? patient.name : '',
      };
    });
  } else if (currentStep === 1) {
    columns = startDialysisColumns;
    filteredRecords = addDateTimeToRecords(
      startDialysisRecords.filter(r => {
        const schedule = schedules.find((s: any) => s.DS_ID_PK === r.SA_ID_PK_FK);
        const recordDate = schedule?.DS_Date || r.date;

        return (
          (selectedSchedule ? r.SA_ID_PK_FK === selectedSchedule : true) &&
          (selectedPatient ? (schedule && schedule.DS_P_ID_FK === selectedPatient) : true) &&
          (selectedDate ? (recordDate === selectedDate) : true) &&
          applyDateRangeFilter(recordDate)
        );
      }),
      r => r.SA_ID_PK_FK
    ).map(r => {
      // Add patient info by looking up the schedule and then the patient
      const schedule = schedules.find((s: any) => s.DS_ID_PK === r.SA_ID_PK_FK);
      const patient = schedule ? patients.find(p => p.id === schedule.DS_P_ID_FK) : undefined;

      // Format SDR_Start_Time to HH:mm
      // const formatTimeHHMM = (val: string) => {
      //   if (!val) return '';
      //   // Handles both 'HH:mm:ss.fff...' and 'HH:mm:ss' and 'HH:mm'
      //   const match = val.match(/^(\d{2}:\d{2})/);
      //   return match ? match[1] : val;
      // };





      
      return {
        ...r,
        patientId: patient ? patient.id : (schedule ? schedule.DS_P_ID_FK : ''),
        patientName: patient ? patient.name : '',
        SDR_Start_Time: formatTimeHHMM(r.SDR_Start_Time || ''),
      };
    });
  } else if (currentStep === 2) {
    columns = postDialysisColumns;
    filteredRecords = addDateTimeToRecords(
      postDialysisRecords.filter(r => {
        const patient = patients.find(p => p.id === r.PostDR_P_ID_FK);
        const schedule = schedules.find(s => s.DS_ID_PK === r.PostDR_DS_ID_FK);
        const recordDate = schedule?.DS_Date || r.date;

        return (
          (selectedSchedule ? r.PostDR_DS_ID_FK === selectedSchedule : true) &&
          (selectedPatient ? (patient && patient.id === selectedPatient) : true) &&
          (selectedDate ? (recordDate === selectedDate) : true) &&
          applyDateRangeFilter(recordDate)
        );
      }),
      r => r.PostDR_DS_ID_FK
    ).map(r => {
      // Add patient info for post dialysis records
      const patient = patients.find(p => p.id === r.PostDR_P_ID_FK);
      return {
        ...r,
        patientId: patient ? patient.id : r.PostDR_P_ID_FK,
        patientName: patient ? patient.name : '',
      };
    });
  }




  console.log('patients:', patients);
  console.log('schedules:', schedules);
  console.log('first start dialysis record:', startDialysisRecords[0]);
  console.log('filtered start dialysis records:', currentStep === 1 ? filteredRecords : 'not on start dialysis step');

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="Dialysis Flow Records" subtitle="View all dialysis records by step and schedule" />
        <StepperNavigation
          selectedSchedule={selectedSchedule}
          onScheduleChange={handleScheduleChange}
          scheduleOptions={scheduleOptions}
          currentStep={currentStep}
          onStepChange={handleStepChange}
          patients={patients}
          selectedPatient={selectedPatient}
          onPatientChange={handlePatientChange}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={handleFromDateChange}
          onToDateChange={handleToDateChange}
          showDateRangeFilter={true}
        />

        <div style={{ maxWidth: 2000, margin: '0 auto' }}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Table
              columns={columns}
              data={filteredRecords}
              actions={(row) => {
                const stepName = currentStep === 0 ? 'Predialysis' : currentStep === 1 ? 'Start Dialysis' : 'Post Dialysis';
                return (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <EditButton
                      onClick={() => handleEdit(row)}
                      tooltip={`Update ${stepName} Record`}
                    />
                    <DeleteButton
                      onClick={() => handleDelete(row)}
                      tooltip={`Soft Delete ${stepName} Record`}
                    />
                  </div>
                );
              }}
            />
          )}
        </div>
        <EditModal
          show={editModalOpen}
          onHide={() => setEditModalOpen(false)}
          data={editRow}
          formConfig={getFormConfigForStep(currentStep, formOptions)}
          onSubmit={handleEditSubmit}
          loading={editLoading}
        />
      </PageContainer>
      <Footer />
    </>
  );
};

export default HDflow_Records; 