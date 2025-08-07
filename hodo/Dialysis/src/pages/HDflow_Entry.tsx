// import React from 'react';
// import HaemodialysisRecordDetails from '../components/HaemodialysisRecordDetails';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
// import { Row, Col, Container } from 'react-bootstrap';

import React, { useEffect, useState } from 'react';
import StepperNavigation from '../components/StepperNavigation';
import Predialysis_Record from './Predialysis_Record';
import Start_Dialysis_Record from './Start_Dialysis_Record';
// import HaemodialysisRecordDetailsPage from './InProcess_records';
import Post_Dialysis_Record from './Post_Dialysis_Record';
import { API_URL } from '../config';
import { width } from '@fortawesome/free-solid-svg-icons/fa0';

const stepComponents = [
  Predialysis_Record,
  Start_Dialysis_Record,
  // HaemodialysisRecordDetailsPage,
  Post_Dialysis_Record,
];



const Dialysis_Workflow_Entry: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [scheduleOptions, setScheduleOptions] = useState<{ value: string; label: string; patientId: string; date: string }[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [predialysisRecords, setPredialysisRecords] = useState<any[]>([]);
  const [startDialysisRecords, setStartDialysisRecords] = useState<any[]>([]);
  const [postDialysisRecords, setPostDialysisRecords] = useState<any[]>([]);

  // Fetch schedules, patients, and all records
  const refetchRecords = () => {
    Promise.all([
      fetch(`${API_URL}/data/Dialysis_Schedules`).then(res => res.json()),
      fetch(`${API_URL}/data/patients_derived`).then(res => res.json()),
      fetch(`${API_URL}/data/predialysis_records`).then(res => res.json()),
      fetch(`${API_URL}/data/start_dialysis_records`).then(res => res.json()),
      fetch(`${API_URL}/data/post_dialysis_records`).then(res => res.json()),
    ]).then(([schedules, patientsData, predialysis, startDialysis, postDialysis]) => {

      // console.log("Fetched patientsData:", patientsData);

      // setPatients(patientsData.map((p: any) => ({ id: p.PM_Card_PK, name: (p['Name'] || p.PatientName || "Unnamed") })));
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
      setPredialysisRecords(predialysis);
      setStartDialysisRecords(startDialysis);
      setPostDialysisRecords(postDialysis);
    });
  };

  useEffect(() => {
    refetchRecords();
  }, []);

  const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchedule(e.target.value);
  }; // Optionally, could refetchRecords here if needed

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPatient(e.target.value);
    setSelectedSchedule(''); // Reset schedule when patient changes
  };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setSelectedSchedule(''); // Reset schedule when date changes
  };

  const StepComponent = stepComponents[currentStep];
  // Always pass selectedSchedule to all step components
  let stepProps: any = { sidebarCollapsed, toggleSidebar };
  if (
    StepComponent === Predialysis_Record ||
    StepComponent === Start_Dialysis_Record ||
    StepComponent === Post_Dialysis_Record
  ) {
    stepProps.selectedSchedule = selectedSchedule;
    stepProps.onSaveSuccess = refetchRecords;
    if (StepComponent === Predialysis_Record) {
      stepProps.records = predialysisRecords;
    } else if (StepComponent === Start_Dialysis_Record) {
      stepProps.records = startDialysisRecords;
    } else if (StepComponent === Post_Dialysis_Record) {
      stepProps.records = postDialysisRecords;
    }
  }
  console.log('Current step:', currentStep, 'StepComponent:', StepComponent.name, 'selectedSchedule:', selectedSchedule);

  const dummyPatients = [
    { id: "1008821811000060", name: "Patient A" },
    { id: "1008821811000056", name: "Patient B" },
  ];

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="Dialysis Workflow Entry" subtitle="Dialysis Workflow Entry" />
        <div>
          <StepperNavigation
            selectedSchedule={selectedSchedule}
            onScheduleChange={handleScheduleChange}
            scheduleOptions={scheduleOptions}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            patients={patients}
            // patients={dummyPatients}
            selectedPatient={selectedPatient}
            onPatientChange={handlePatientChange}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
          <div style={{ maxWidth: 2000, margin: '0 auto' }}>
            <StepComponent {...stepProps} />
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default Dialysis_Workflow_Entry; 