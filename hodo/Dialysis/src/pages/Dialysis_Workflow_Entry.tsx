// // import React from 'react';
// // import HaemodialysisRecordDetails from '../components/HaemodialysisRecordDetails';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
// import PageContainer from '../components/PageContainer';
// import SectionHeading from '../components/SectionHeading';
// // import { Row, Col, Container } from 'react-bootstrap';

// import React, { useEffect, useState } from 'react';
// import StepperNavigation from '../components/StepperNavigation';
// import Predialysis_Record from './Predialysis_Record';
// import Start_Dialysis_Record from './Start_Dialysis_Record';
// import InProcess_records from './InProcess_records';
// import Post_Dialysis_Record from './Post_Dialysis_Record';
// import { API_URL } from '../config';
// import { width } from '@fortawesome/free-solid-svg-icons/fa0';

// const stepComponents = [
//   Predialysis_Record,
//   Start_Dialysis_Record,
//   InProcess_records,
//   Post_Dialysis_Record,
// ];

// const Dialysis_Workflow_Entry: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
//   const [selectedSchedule, setSelectedSchedule] = useState('');
//   const [currentStep, setCurrentStep] = useState(0);
//   const [scheduleOptions, setScheduleOptions] = useState<{ value: string; label: string; patientId: string; date: string }[]>([]);
//   const [selectedPatient, setSelectedPatient] = useState('');
//   const [selectedDate, setSelectedDate] = useState('');
//   const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);

//   useEffect(() => {
//     // Fetch schedules and patients to build dropdown options
//     Promise.all([
//       fetch(`${API_URL}/data/Dialysis_Schedules`).then(res => res.json()),
//       fetch(`${API_URL}/data/patients_derived`).then(res => res.json())
//     ]).then(([schedules, patientsData]) => {
//       setPatients(patientsData.map((p: any) => ({ id: p.id, name: (p['Name'] || p.name) })));
//       const options = schedules.filter((a: any) => a.Status === 10).map((sch: any) => {
//         const patient = patientsData.find((p: any) => p.id === sch.P_ID_FK);
//         const patientLabel = patient ? (patient['Name'] || patient.name) : sch.P_ID_FK;
//         return {
//           value: sch.DS_ID_PK,
//           label: `${sch.DS_ID_PK} - ${patientLabel}`,
//           patientId: sch.P_ID_FK,
//           date: sch.DS_Date
//         };
//       });
//       setScheduleOptions(options);
//     });
//   }, []);

//   const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setSelectedSchedule(e.target.value);
//   };

//   const handleStepChange = (step: number) => {
//     setCurrentStep(step);
//   };

//   const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setSelectedPatient(e.target.value);
//     setSelectedSchedule(''); // Reset schedule when patient changes
//   };
//   const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSelectedDate(e.target.value);
//     setSelectedSchedule(''); // Reset schedule when date changes
//   };

//   const StepComponent = stepComponents[currentStep];
//   // Always pass selectedSchedule to all step components
//   let stepProps: any = { sidebarCollapsed, toggleSidebar };
//   if (
//     StepComponent === Predialysis_Record ||
//     StepComponent === Start_Dialysis_Record ||
//     StepComponent === InProcess_records ||
//     StepComponent === Post_Dialysis_Record
//   ) {
//     stepProps.selectedSchedule = selectedSchedule;
//     if (StepComponent === InProcess_records) {
//       stepProps.setSelectedSchedule = setSelectedSchedule;
//     }
//   }
//   console.log('Current step:', currentStep, 'StepComponent:', StepComponent.name, 'selectedSchedule:', selectedSchedule);
//   return (
//     <>
//       <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
//       <PageContainer>
//         <SectionHeading title="Dialysis Workflow Entry" subtitle="Dialysis Workflow Entry" />
//         <div>
//           <StepperNavigation
//             selectedSchedule={selectedSchedule}
//             onScheduleChange={handleScheduleChange}
//             scheduleOptions={scheduleOptions}
//             currentStep={currentStep}
//             onStepChange={handleStepChange}
//             patients={patients}
//             selectedPatient={selectedPatient}
//             onPatientChange={handlePatientChange}
//             selectedDate={selectedDate}
//             onDateChange={handleDateChange}
//           />
//           <div style={{ maxWidth: 2000, margin: '0 auto' }}>
//             <StepComponent {...stepProps} />
//           </div>
//         </div>
//       </PageContainer>
//       <Footer />
//     </>
//   );
// };

// export default Dialysis_Workflow_Entry; 