import React, { useEffect, useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import StepperNavigation from '../components/StepperNavigation';
import Table from '../components/Table';
import EditButton from '../components/EditButton';
import EditModal from '../components/EditModal';
import { predialysisFormConfig, startDialysisFormConfig, postDialysisFormConfig } from '../components/forms/formConfigs';
import { API_URL } from '../config';

const predialysisColumns = [
  { key: 'date', header: 'Date' },
  { key: 'time', header: 'Time' },
  { key: 'SA_ID_FK_PK', header: 'Schedule ID' },
  { key: 'P_ID_FK', header: 'Patient' }, // keep for display only
  { key: 'PreDR_Vitals_BP', header: 'BP' },
  { key: 'PreDR_Vitals_HeartRate', header: 'Heart Rate' },
  { key: 'PreDR_Vitals_Temperature', header: 'Temperature' },
  { key: 'PreDR_Vitals_Weight', header: 'Weight' },
  { key: 'PreDR_Notes', header: 'Notes' },
];
const startDialysisColumns = [
  { key: 'date', header: 'Date' },
  { key: 'time', header: 'Time' },
  { key: 'SA_ID_FK_PK', header: 'Schedule ID' },
  { key: 'name', header: 'Name' },
  { key: 'Dialysis_Unit', header: 'Unit' },
  { key: 'SDR_Start_time', header: 'Start Time' },
  { key: 'SDR_Vascular_access', header: 'Vascular Access' },
  { key: 'Dialyzer_Type', header: 'Dialyzer Type' },
  { key: 'SDR_Notes', header: 'Notes' },
];
const postDialysisColumns = [
  { key: 'date', header: 'Date' },
  { key: 'time', header: 'Time' },
  { key: 'SA_ID_FK', header: 'Schedule ID' },
  { key: 'P_ID_FK', header: 'Patient' }, // keep for display only
  { key: 'PreDR_Vitals_BP', header: 'BP' },
  { key: 'PreDR_Vitals_HeartRate', header: 'Heart Rate' },
  { key: 'PreDR_Vitals_Temperature', header: 'Temperature' },
  { key: 'PreDR_Vitals_Weight', header: 'Weight' },
  { key: 'PostDR_Notes', header: 'Notes' },
];

const getFormConfigForStep = (step: number) => {
  if (step === 0) return predialysisFormConfig;
  if (step === 1) return startDialysisFormConfig;
  if (step === 2) return postDialysisFormConfig;
  return predialysisFormConfig;
};

const getEditEndpointForStep = (step: number) => {
  if (step === 0) return 'predialysis_record';
  if (step === 1) return 'start_dialysis_record';
  if (step === 2) return 'post_dialysis_record';
  return '';
};

const mapRowToFormData = (row: any, step: number, patients: any[], schedules: any[]) => {
  if (step === 0) {
    const patient = patients.find(p => p.name === row.P_ID_FK || p.id === row.P_ID_FK);
    const schedule = schedules.find(s => s.SA_ID_PK === row.SA_ID_FK_PK);
    return {
      patientName: patient ? patient.name : row.P_ID_FK,
      date: schedule ? schedule.SA_Date : row.date,
      time: schedule ? schedule.SA_Time : row.time,
      PreDR_Vitals_BP: row.PreDR_Vitals_BP,
      PreDR_Vitals_HeartRate: row.PreDR_Vitals_HeartRate,
      PreDR_Vitals_Temperature: row.PreDR_Vitals_Temperature,
      PreDR_Vitals_Weight: row.PreDR_Vitals_Weight,
      PreDR_Notes: row.PreDR_Notes,
      SA_ID_FK_PK: row.SA_ID_FK_PK,
      id: row.id, // Ensure id is always present
    };
  }
  if (step === 1) {
    const schedule = schedules.find(s => s.SA_ID_PK === row.SA_ID_FK_PK);
    const patient = schedule ? patients.find(p => p.id === schedule.P_ID_FK) : undefined;
    return {
      name: patient ? patient.name : '',
      date: schedule ? schedule.SA_Date : row.date,
      time: schedule ? schedule.SA_Time : row.time,
      Dialysis_Unit: row.Dialysis_Unit,
      SDR_Start_time: row.SDR_Start_time,
      SDR_Vascular_access: row.SDR_Vascular_access,
      Dialyzer_Type: row.Dialyzer_Type,
      SDR_Notes: row.SDR_Notes,
      SA_ID_FK_PK: row.SA_ID_FK_PK,
      id: row.id,
    };
  }
  if (step === 2) {
    const patient = patients.find(p => p.name === row.P_ID_FK || p.id === row.P_ID_FK);
    const schedule = schedules.find(s => s.SA_ID_PK === row.SA_ID_FK);
    return {
      patientName: patient ? patient.name : row.P_ID_FK,
      date: schedule ? schedule.SA_Date : row.date,
      time: schedule ? schedule.SA_Time : row.time,
      PreDR_Vitals_BP: row.PreDR_Vitals_BP,
      PreDR_Vitals_HeartRate: row.PreDR_Vitals_HeartRate,
      PreDR_Vitals_Temperature: row.PreDR_Vitals_Temperature,
      PreDR_Vitals_Weight: row.PreDR_Vitals_Weight,
      PostDR_Notes: row.PostDR_Notes,
      SA_ID_FK: row.SA_ID_FK,
      id: row.id,
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
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [predialysisRecords, setPredialysisRecords] = useState<any[]>([]);
  const [startDialysisRecords, setStartDialysisRecords] = useState<any[]>([]);
  const [postDialysisRecords, setPostDialysisRecords] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/data/schedules_assigned`).then(res => res.json()),
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
      setPatients(safePatients.map((p: any) => ({ id: p.id, name: p.Name || p.name })));
      const options = safeSchedules.filter((a: any) => a.isDeleted === 10).map((sch: any) => {
        const patient = safePatients.find((p: any) => p.id === sch.P_ID_FK);
        const patientLabel = patient ? (patient['Name'] || patient.name) : sch.P_ID_FK;
        return {
          value: sch.SA_ID_PK,
          label: `${sch.SA_ID_PK} - ${patientLabel}`,
          patientId: sch.P_ID_FK,
          date: sch.SA_Date,
          time: sch.SA_Time
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

  const handleEdit = (row: any) => {
    setEditRow(mapRowToFormData(row, currentStep, patients, schedules));
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (values: any) => {
    setEditLoading(true);
    try {
      const endpoint = getEditEndpointForStep(currentStep);
      // Debug log to verify payload
      console.log('Submitting values to backend:', values);
      // Remove any Patient* fields from the payload
      const { P_ID_FK, ...cleanedValues } = values;
      // Ensure id is included in cleanedValues
      if (values.id) cleanedValues.id = values.id;
      await fetch(`${API_URL}/data/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedValues),
      });
      setEditModalOpen(false);
      setEditRow(null);
      setLoading(true);
      Promise.all([
        fetch(`${API_URL}/data/schedules_assigned`).then(res => res.json()),
        fetch(`${API_URL}/data/patients_derived`).then(res => res.json()),
        fetch(`${API_URL}/data/predialysis_records`).then(res => res.json()),
        fetch(`${API_URL}/data/start_dialysis_records`).then(res => res.json()),
        fetch(`${API_URL}/data/post_dialysis_records`).then(res => res.json()),
      ]).then(([schedules, patientsData, predialysis, startDialysis, postDialysis]) => {
        setSchedules(schedules);
        setPatients(patientsData.map((p: any) => ({ id: p.id, name: p.Name || p.name })));
        const options = schedules.filter((a: any) => a.isDeleted === 10).map((sch: any) => {
          const patient = patientsData.find((p: any) => p.id === sch.P_ID_FK);
          const patientLabel = patient ? (patient['Name'] || patient.name) : sch.P_ID_FK;
          return {
            value: sch.SA_ID_PK,
            label: `${sch.SA_ID_PK} - ${patientLabel}`,
            patientId: sch.P_ID_FK,
            date: sch.SA_Date,
            time: sch.SA_Time
          };
        });
        setScheduleOptions(options);
        setPredialysisRecords(predialysis);
        setStartDialysisRecords(startDialysis);
        setPostDialysisRecords(postDialysis);
        setLoading(false);
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Helper to add date/time to each record
  const addDateTimeToRecords = (records: any[], getScheduleId: (r: any) => string) => {
    return records.map(r => {
      const schedule = schedules.find((s: any) => s.SA_ID_PK === getScheduleId(r));
      return {
        ...r,
        date: schedule ? schedule.SA_Date : '',
        time: schedule ? schedule.SA_Time : '',
      };
    });
  };

  // Filter records by selected schedule and patient, and add date/time
  let filteredRecords: any[] = [];
  let columns: any[] = [];
  if (currentStep === 0) {
    columns = predialysisColumns;
    filteredRecords = addDateTimeToRecords(
      predialysisRecords.filter(r => {
        const patient = patients.find(p => p.name === r.P_ID_FK);
        return (
          (selectedSchedule ? r.SA_ID_FK_PK === selectedSchedule : true) &&
           (selectedPatient ? (patient && patient.id === selectedPatient) : true) &&
           (selectedDate ? (schedules.find(s => s.SA_ID_PK === r.SA_ID_FK_PK)?.SA_Date === selectedDate || r.date === selectedDate) : true)
        );
      }),
      r => r.SA_ID_FK_PK
    );
  } else if (currentStep === 1) {
    columns = startDialysisColumns;
    filteredRecords = addDateTimeToRecords(
      startDialysisRecords.filter(r => {
        const schedule = schedules.find((s: any) => s.SA_ID_PK === r.SA_ID_FK_PK);
        return (
          (selectedSchedule ? r.SA_ID_FK_PK === selectedSchedule : true) &&
           (selectedPatient ? (schedule && schedule.P_ID_FK === selectedPatient) : true) &&
           (selectedDate ? ((schedule && schedule.SA_Date === selectedDate) || r.date === selectedDate) : true)
        );
      }),
      r => r.SA_ID_FK_PK
    ).map(r => {
      // Add patient name by looking up the schedule and then the patient
      const schedule = schedules.find((s: any) => s.SA_ID_PK === r.SA_ID_FK_PK);
      const patient = schedule ? patients.find(p => p.id === schedule.P_ID_FK) : undefined;
      return {
        ...r,
        name: patient ? patient.name : '',
      };
    });
  } else if (currentStep === 2) {
    columns = postDialysisColumns;
    filteredRecords = addDateTimeToRecords(
      postDialysisRecords.filter(r => {
        const patient = patients.find(p => p.name === r.P_ID_FK);
        return (
          (selectedSchedule ? r.SA_ID_FK === selectedSchedule : true) &&
           (selectedPatient ? (patient && patient.id === selectedPatient) : true) &&
           (selectedDate ? (schedules.find(s => s.SA_ID_PK === r.SA_ID_FK)?.SA_Date === selectedDate || r.date === selectedDate) : true)
        );
      }),
      r => r.SA_ID_FK
    );
  }

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="HD Flow Records" subtitle="View all dialysis records by step and schedule" />
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
        />
        
        <div style={{ maxWidth: 2000, margin: '0 auto' }}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Table
              columns={columns}
              data={filteredRecords}
              // actions={(row) => (
              //   <EditButton onClick={() => handleEdit(row)} />
              // )}
            />
          )}
        </div>
        <EditModal
          show={editModalOpen}
          onHide={() => setEditModalOpen(false)}
          data={editRow}
          formConfig={getFormConfigForStep(currentStep)}
          onSubmit={handleEditSubmit}
          loading={editLoading}
        />
      </PageContainer>
      <Footer />
    </>
  );
};

export default HDflow_Records; 