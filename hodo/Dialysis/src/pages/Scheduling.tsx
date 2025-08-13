import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import Breadcrumb from '../components/Breadcrumb';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import { InputField, SelectField } from '../components/forms';
import ButtonWithGradient from '../components/ButtonWithGradient';
import Table from '../components/Table';
import DateRangeSelector from '../components/DateRangeSelector';
import { API_URL } from '../config';
import { useSessionTimes } from './SessionTimesLookup';
import CancelButton from '../components/CancelButton';
import ReassignButton from '../components/ReassignButton';

// const sessionOptions = [
//   { label: '1st', value: '1st' },
//   { label: '2nd', value: '2nd' },
//   { label: '3rd', value: '3rd' },
// ];

// Session options will be dynamically generated from sessionTimes lookup
const intervalOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Alternate Days', value: 'alternate' },
  { label: 'Twice a week', value: 'twice' },
  { label: 'Thrice a week', value: 'thrice' },
];

function getDayName(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
}
function getMonthName(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long' });
}

// const normalizeDate = (dateString: string) => {
//   return new Date(dateString).toISOString().slice(0, 10); // "2025-08-07"
// };

// const normalizeTime = (timeString: string) => {
//   return timeString?.slice(0, 5); // "08:00"
// };


const steps = [
  { label: 'Assign Schedule' },
  { label: 'View Assigned Schedules' }
];



const Scheduling: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [unitsCount, setUnitsCount] = useState<number>(0);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const { sessionTimes } = useSessionTimes();

  const [formKey, setFormKey] = useState(0);// Used to force re-render of Formik form to fully reset all fields including custom select inputs


  // Fetch No. of Units from scheduling_lookup on mount
  useEffect(() => {
    fetch(`${API_URL}/data/scheduling_lookup`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setUnitsCount(Number(data[0].SL_No_of_units) || 0);
        }
      });
  }, []);

  // Fetch all assigned schedules with related records when switching to view step
  useEffect(() => {
    if (currentStep === 1) {
      fetch(`${API_URL}/data/dialysis_schedules/with-records`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Sort by Added_on descending, then DS_ID_PK descending (if present)
            const sorted = [...data].sort((a, b) => {
              // Compare dates (descending)
              const dateA = new Date(a.DS_Added_on || a.DS_Date || 0);
              const dateB = new Date(b.DS_Added_on || b.DS_Date || 0);
              if (dateA > dateB) return -1;
              if (dateA < dateB) return 1;
              // If dates equal, compare DS_ID_PK if present
              if (a.DS_ID_PK && b.DS_ID_PK) {
                return String(b.DS_ID_PK).localeCompare(String(a.DS_ID_PK));
              }
              return 0;
            });
            setAssignedSessions(sorted);
          } else {
            setAssignedSessions([]);
          }
        })
        .catch(() => setAssignedSessions([]));
    }
  }, [currentStep, API_URL]);
  const [patients, setPatients] = useState<any[]>([]);
  type ScheduleRow = {
    id: number;
    date: string;
    time: string;
    dayName: string;
    monthName: string;
    nthSession: string;
    isConflicting: boolean;
  };
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<ScheduleRow[]>([]);
  const [error, setError] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [assignedSessions, setAssignedSessions] = useState<any[]>([]);
  const [conflictInfo, setConflictInfo] = useState<{ conflictingRows: any[], message: string }>({ conflictingRows: [], message: '' });

  const today = new Date().toISOString().split('T')[0];

  const isMSSQL = React.useMemo(() => {
    return assignedSessions.some(row => row.DS_Added_on?.includes('T'));
  }, [assignedSessions]);


  const initialValues = {
    patient: '',
    interval: 'daily',
    // sessionPreferred: '1st',

    sessionPreferred: sessionTimes.length > 0 ? sessionTimes[0].ST_Session_Name : '',
    numSessions: '5',
    fromDate: today,
    tillDate: ''
  };

  useEffect(() => {
    // Fetch both patients and case_openings, then filter
    Promise.all([
      fetch(`${API_URL}/data/patients_derived`).then(res => res.json()),
      fetch(`${API_URL}/data/case_openings`).then(res => res.json())
    ]).then(([patientsData, caseOpenings]) => {
      if (Array.isArray(patientsData) && Array.isArray(caseOpenings)) {
        const allowedIds = new Set(caseOpenings.map((c: any) => c.DCO_P_ID_FK));
        // setPatients(patientsData.filter((p: any) => allowedIds.has(p.id)));


        // Filter only patients with case openings
        // setPatients(patientsData.filter((p: any) => allowedIds.has(p.id)));
        const filtered = patientsData.filter((p: any) => allowedIds.has(p.id));


        // Sort by latest case opening date
        const sorted = filtered.sort((a: any, b: any) => {
          const latestCaseA = caseOpenings
            .filter((c: any) => c.DCO_P_ID_FK === a.id)
            .sort((c1: any, c2: any) => new Date(c2.DCO_Added_On).getTime() - new Date(c1.DCO_Added_On).getTime())[0];
          const latestCaseB = caseOpenings
            .filter((c: any) => c.DCO_P_ID_FK === b.id)
            .sort((c1: any, c2: any) => new Date(c2.DCO_Added_On).getTime() - new Date(c1.DCO_Added_On).getTime())[0];

          return new Date(latestCaseB?.DCO_Added_On || 0).getTime() - new Date(latestCaseA?.DCO_Added_On || 0).getTime();
        });

        setPatients(sorted);



        // console.log("All Patient IDs:", patientsData.map(p => p.id));
        // console.log("Case Opening IDs:", Array.from(allowedIds));
        // console.log("Filtered Patients:", patientsData.filter((p: any) => allowedIds.has(p.id)));
      }
    });
  }, []);

  const handleSubmit = async (values: typeof initialValues) => {
    setSaveStatus("");


    const { fromDate, tillDate, interval, sessionPreferred, numSessions } = values;

    setError('');
    setConflictInfo({ conflictingRows: [], message: '' });

    if (!values.patient) {
      setScheduleRows([]);
      setSelectedRows([]);
      setError('Please select a patient.');
      return;
    }

    if (fromDate && tillDate && new Date(fromDate) > new Date(tillDate)) {
      setScheduleRows([]);
      setSelectedRows([]);
      setError('From Date must be before or equal to Till Date.');
      return;
    }

    let startDate = fromDate ? new Date(fromDate) : new Date();
    let endDate = tillDate ? new Date(tillDate) : null;
    let rows: ScheduleRow[] = [];
    let i = 0;
    let count = 0;

    while (count < Number(numSessions)) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i * (interval === 'alternate' ? 2 : 1));
      if (endDate && date > endDate) break;
      // time: sessionPreferred === '1st' ? '08:00' : sessionPreferred === '2nd' ? '12:00' : '16:00',

      // Find the selected session time from lookup table
      const selectedSessionTime = sessionTimes.find(st => st.ST_Session_Name === sessionPreferred);
      const timeToUse = selectedSessionTime ? selectedSessionTime.ST_Start_Time : '08:00';
      
      rows.push({
        id: count + 1,
        date: date.toISOString().slice(0, 10),
        time: timeToUse,
        dayName: getDayName(date.toISOString().slice(0, 10)),
        monthName: getMonthName(date.toISOString().slice(0, 10)),
        nthSession: sessionPreferred,
        isConflicting: false,
      });
      count++;
      i++;
    }

    if (rows.length === 0) {
      // setError('No sessions can be generated for the selected date range and interval.');
      setError('Fill all required fields.');
    }

    // Fetch assigned sessions for the patient
    let conflicts: any[] = [];
    if (values.patient) {
      try {
        const res = await fetch(`${API_URL}/data/Dialysis_Schedules?patientId=${values.patient}`);
        const assigned = await res.json();
        setAssignedSessions(assigned);
        // Check for conflicts
        // conflicts = rows.filter(row => assigned.some((a: any) => a.DS_Date === row.date && a.DS_Time === row.time));

        // Check for conflicts - sessions already booked by THIS patient
        conflicts = rows.filter(row =>
          assigned.some((a: any) =>
            a.DS_P_ID_FK === values.patient && // Only check sessions booked by THIS patient
            a.DS_Date === row.date &&
            (a.DS_Time === row.time || a.DS_Time?.startsWith(row.time))
          )
        );

        // Mark isConflicting flag for sessions already booked by this patient
        rows.forEach(row => {
          row.isConflicting = assigned.some((a: any) =>
            a.DS_P_ID_FK === values.patient && // Only mark as conflicting if booked by THIS patient
            a.DS_Date === row.date &&
            (a.DS_Time === row.time || a.DS_Time?.startsWith(row.time))
          );
        });
        if (conflicts.length > 0) {
          setConflictInfo({
            conflictingRows: conflicts,
            message: `${conflicts.length} session(s) are already booked by this patient and cannot be selected again.`
          });
        } else {
          setConflictInfo({ conflictingRows: [], message: '' });
        }
      } catch (err) {
        setAssignedSessions([]);
      }
    }
    setScheduleRows(rows);
    setSelectedRows([]);
  };

  const handleRowSelect = (row: any) => {
    // Prevent selection if the session is already booked by this patient OR at capacity
    if (row.isConflicting || row.atCapacity) return;
    setSelectedRows(prev =>
      prev.some(r => r.id === row.id)
        ? prev.filter(r => r.id !== row.id)
        : [...prev, row]
    );
  };

  const handleCancelSession = async (scheduleId: string) => {
    try {
      const res = await fetch(`${API_URL}/data/dialysis_schedules/${scheduleId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 0 }) // 0 = Cancelled
      });
      
      if (res.ok) {
        toast.success('Session cancelled successfully!');
        // Small delay to ensure database is updated
        setTimeout(async () => {
          // Refresh the assigned sessions list
          const updatedRes = await fetch(`${API_URL}/data/dialysis_schedules/with-records`);
          const updatedData = await updatedRes.json();

          if (Array.isArray(updatedData)) {
            const sorted = [...updatedData].sort((a, b) => {
              const dateA = new Date(a.DS_Added_on || a.DS_Date || 0);
              const dateB = new Date(b.DS_Added_on || b.DS_Date || 0);
              if (dateA > dateB) return -1;
              if (dateA < dateB) return 1;
              if (a.DS_ID_PK && b.DS_ID_PK) {
                return String(b.DS_ID_PK).localeCompare(String(a.DS_ID_PK));
              }
              return 0;
            });
            setAssignedSessions(sorted);
          }
        }, 500);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to cancel session');
      }
    } catch (err) {
      toast.error('Error cancelling session');
    }
  };

  const handleReassignSession = async (scheduleId: string) => {
    try {
      // First check if reassignment is possible (future date and no conflicts)
      const schedule = assignedSessions.find(s => s.DS_ID_PK == scheduleId);
      if (!schedule) {
        toast.error('Schedule not found');
        return;
      }

      const sessionDate = new Date(schedule.DS_Date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (sessionDate <= today) {
        toast.error('Cannot reassign past sessions');
        return;
      }

      // Check for conflicts
      const conflictRes = await fetch(
        `${API_URL}/data/dialysis_schedules/check-conflict?date=${schedule.DS_Date}&time=${schedule.DS_Time}`
      );
      const conflictData = await conflictRes.json();
      
      if (conflictData.hasConflict) {
        toast.error('Cannot reassign: Another patient is already scheduled for this time slot');
        return;
      }

      const res = await fetch(`${API_URL}/data/dialysis_schedules/${scheduleId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 10 }) // 10 = Scheduled
      });
      
      if (res.ok) {
        toast.success('Session reassigned successfully!');
        // Small delay to ensure database is updated
        setTimeout(async () => {
          // Refresh the assigned sessions list
          const updatedRes = await fetch(`${API_URL}/data/dialysis_schedules/with-records`);
          const updatedData = await updatedRes.json();
          if (Array.isArray(updatedData)) {
            const sorted = [...updatedData].sort((a, b) => {
              const dateA = new Date(a.DS_Added_on || a.DS_Date || 0);
              const dateB = new Date(b.DS_Added_on || b.DS_Date || 0);
              if (dateA > dateB) return -1;
              if (dateA < dateB) return 1;
              if (a.DS_ID_PK && b.DS_ID_PK) {
                return String(b.DS_ID_PK).localeCompare(String(a.DS_ID_PK));
              }
              return 0;
            });
            setAssignedSessions(sorted);
          }
        }, 500);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to reassign session');
      }
    } catch (err) {
      toast.error('Error reassigning session');
    }
  };




  const handleSave = async (patientId: string | number, resetForm?: () => void) => {
    setFormKey(prev => prev + 1); // force re-render to fully reset select

    if (!patientId || selectedRows.length === 0) {
      setSaveStatus('Select a patient and at least one session.');
      return;
    }


    // Function to get current date in IST in YYYY-MM-DD format
function getTodayInIST() {
  const now = new Date();
  // IST offset = +5:30 hours = 330 minutes
  const istOffset = 330; 
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istTime = new Date(utc + istOffset * 60000);
  return istTime.toISOString().slice(0, 10);
}

    // const today = new Date().toISOString().slice(0, 10);
    const today = getTodayInIST();
    const sessions = selectedRows.map(row => ({
      DS_P_ID_FK: patientId,
      DS_Date: row.date,
      DS_Time: row.time.length === 5 ? `${row.time}:00` : row.time, // add seconds also
      DS_Status: 10,
      DS_Added_by: null,
      DS_Added_on: today,
      DS_Modified_by: null,
      DS_Modified_on: today,
      DS_Provider_FK: null,
      DS_Outlet_FK: null
    }));

    try {
      const res = await fetch(`${API_URL}/data/Dialysis_Schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessions)
      });
      if (res.ok) {
        setSaveStatus('Sessions saved successfully!');
        toast.success('Sessions saved successfully!');
        // Reset form and clear schedule/selection
        if (resetForm) resetForm();
        setScheduleRows([]);
        setSelectedRows([]);
        setError('');
      } else {
        setSaveStatus('Failed to save sessions.');
        toast.error('Failed to save sessions.');
      }
    } catch (err) {
      setSaveStatus('Error saving sessions.');
      toast.error('Error saving sessions.');
    }
  };

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="Scheduling" subtitle="Fill the form to generate schedule" />

        <Breadcrumb
          steps={steps}
          activeStep={currentStep}
          onStepClick={setCurrentStep}
        />
        {currentStep === 0 && (
          <>
            {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
            <Formik key={formKey} initialValues={initialValues} onSubmit={handleSubmit}>
              {({ values, resetForm }) => (
                <Form>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <SelectField
                      label="Patient"
                      name="patient"
                      options={patients.map(p => ({ value: p.id, label: `${p.id} - ${p.Name}` }))}
                      required
                      placeholder="Select Patient"
                    />
                    <SelectField
                      label="Interval"
                      name="interval"
                      options={intervalOptions}
                      required
                      placeholder="Select Interval"
                      defaultValue={intervalOptions[0]}
                    />
                    <SelectField
                      label="Session Preferred"
                      name="sessionPreferred"
                      // options={sessionOptions}

                      options={sessionTimes.map(st => ({ 
                        label: `${st.ST_Session_Name} (${st.ST_Start_Time})`, 
                        value: st.ST_Session_Name 
                      }))}
                      required
                      placeholder="Select Session"
                      // defaultValue={sessionOptions[0]}

                      defaultValue={sessionTimes.length > 0 ? { 
                        label: `${sessionTimes[0].ST_Session_Name} (${sessionTimes[0].ST_Start_Time})`, 
                        value: sessionTimes[0].ST_Session_Name 
                      } : undefined}
                    />
                    <InputField
                      label="Number of Sessions"
                      name="numSessions"
                      type="number"
                      required
                      min={1}
                      defaultValue={5}
                    />
                    <InputField
                      label="From Date"
                      name="fromDate"
                      type="date"
                      required
                      min={today}
                      defaultValue={today}
                    />
                    <InputField
                      label="Till Date"
                      name="tillDate"
                      type="date"
                      min={values.fromDate}
                    />
                  </div>
                  <div style={{ textAlign: 'left', marginTop: 16 }}>
                    <ButtonWithGradient type="submit">Generate Schedule</ButtonWithGradient>
                  </div>

                  {scheduleRows.length > 0 && (
                    <>
                      <h4 className="blueBar">Schedule Table</h4>
                      {conflictInfo.message && (
                        <div style={{ color: '#d32f2f', marginBottom: 8, fontWeight: 'bold' }}>{conflictInfo.message}</div>
                      )}
                      <div style={{ display: 'flex', gap: '20px', marginBottom: '12px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '16px', height: '16px', backgroundColor: '#ffebee', border: '1px solid #d32f2f' }}></div>
                          <span>Already booked by this patient</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '16px', height: '16px', backgroundColor: '#fff3e0', border: '1px solid #f57c00' }}></div>
                          <span>At full capacity</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '16px', height: '16px', backgroundColor: '#ffffff', border: '1px solid #ccc' }}></div>
                          <span>Available</span>
                        </div>
                      </div>
                      <Table
                        columns={[
                          { key: 'date', header: 'Date' },
                          { key: 'time', header: 'Time' },
                          { key: 'dayName', header: 'Day Name' },
                          { key: 'monthName', header: 'Month Name' },
                          { key: 'nthSession', header: 'Nth Session of Day' },
                          { key: 'booked', header: 'Booked/Units' },
                          { key: 'select', header: 'Select' },
                        ]}
                        data={scheduleRows.map(row => {
                          // Count total bookings for this date/time slot
                          const bookedCount = assignedSessions.filter(a =>
                            a.DS_Date === row.date &&
                            (a.DS_Time === row.time || a.DS_Time?.startsWith(row.time))
                          ).length;

                          const atCapacity = bookedCount >= unitsCount;



                          return {
                            ...row,
                            booked: `${bookedCount} / ${unitsCount}`,
                            atCapacity,
                            select: (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="checkbox"
                                  checked={selectedRows.some(r => r.id === row.id)}
                                  onChange={() => handleRowSelect(row)}
                                  disabled={row.isConflicting || atCapacity}
                                />
                                {row.isConflicting && (
                                  <span style={{ color: '#d32f2f', fontSize: '12px' }}>Already booked</span>
                                )}
                                {!row.isConflicting && atCapacity && (
                                  <span style={{ color: '#f57c00', fontSize: '12px' }}>Full capacity</span>
                                )}
                              </div>
                            ),
                            _rowStyle: row.isConflicting
                              ? { backgroundColor: '#ffebee', color: '#d32f2f' } // Light red for already booked by patient
                              : atCapacity
                                ? { backgroundColor: '#fff3e0', color: '#f57c00' } // Light orange for at capacity
                                : {},
                          };
                        })}
                      />

                      {selectedRows.length > 0 && (
                        <>
                          <h4 className="blueBar">Selected Sessions</h4>
                          <Table
                            columns={[
                              { key: 'date', header: 'Date' },
                              { key: 'time', header: 'Time' },
                              { key: 'dayName', header: 'Day Name' },
                              { key: 'monthName', header: 'Month Name' },
                              { key: 'nthSession', header: 'Nth Session of Day' },
                            ]}
                            data={selectedRows}
                          />
                          <div style={{ textAlign: 'center', marginTop: 24 }}>
                            <ButtonWithGradient type="button" onClick={() => handleSave(values.patient, resetForm)}
                            >
                              Save Sessions
                            </ButtonWithGradient>
                          </div>
                          {saveStatus && (
                            <div style={{ textAlign: 'center', color: saveStatus.includes('success') ? 'green' : 'red', marginTop: 8 }}>
                              {saveStatus}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </Form>
              )}
            </Formik>
          </>
        )}
        {currentStep === 1 && (
          <>

            <h4 className="blueBar">Schedules Assigned to Patients</h4>
            <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
              <DateRangeSelector
                fromDate={fromDate}
                toDate={toDate}
                onFromDateChange={setFromDate}
                onToDateChange={setToDate}
                label="Filter by Date Range"
              />
            </div>
            <Table
              columns={[
                { key: 'DS_P_ID_FK', header: 'Patient ID' },
                { key: 'PatientName', header: 'Patient Name' },
                { key: 'DS_Date', header: 'Date' },
                { key: 'DS_Time', header: 'Time' },
                { key: 'computed_status', header: 'Status' },
                { key: 'DS_Added_on', header: 'Added On' },
                { key: 'actions', header: 'Actions' }
              ]}
              data={(() => {
                const filteredAndMappedData = assignedSessions
                  .filter(row => {
                    if (!fromDate && !toDate) return true;
                    const rowDate = row.DS_Date;
                    if (fromDate && rowDate < fromDate) return false;
                    if (toDate && rowDate > toDate) return false;
                    return true;
                  })
                  .map(row => {
                  // Debug: Check what fields are available in the row data
                  if (Math.random() < 0.1) { // Only log occasionally to avoid spam
                    console.log('Available row fields:', Object.keys(row));
                    console.log('DS_Time value:', row.DS_Time);
                    console.log('DS_Added_on value:', row.DS_Added_on);
                    console.log('DS_Added_On value:', row.DS_Added_On); // Check alternative casing
                  }
                  
                  const sessionDate = new Date(row.DS_Date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  const isFutureDate = sessionDate > today;
                  const isCompleted = row.computed_status === 'Completed';
                  const isCancelled = row.computed_status === 'Cancelled' || row.DS_Status === 0;
                  

                  
                  // Determine which action to show (exclusive)
                  let actionComponent = null;
                  
                  if (isFutureDate && !isCompleted && !isCancelled) {
                    // Show Cancel button for future, non-completed, non-cancelled sessions
                    actionComponent = (
                      <CancelButton
                        scheduleId={row.DS_ID_PK}
                        onCancel={handleCancelSession}
                        tooltip="Cancel this session"
                      />
                    );
                  } else if (isFutureDate && isCancelled) {
                    // Show Reassign button for future cancelled sessions
                    actionComponent = (
                      <ReassignButton
                        scheduleId={row.DS_ID_PK}
                        onReassign={handleReassignSession}
                        tooltip="Reassign this session"
                      />
                    );
                  }
                  // If neither condition is met, no action is shown
                  
                  // Format date to YYYY-MM-DD
                  const formatDate = (dateStr: string) => {
                    if (!dateStr) return '';
                    const date = new Date(dateStr);
                    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
                  };

                  // Format time to HH:MM
                  const formatTime = (timeStr: string) => {
                    if (!timeStr) return '';
                    // Debug time formatting
                    if (Math.random() < 0.1) {
                      console.log('Formatting time:', timeStr, 'Type:', typeof timeStr);
                    }
                    // Handle different time formats
                    if (timeStr.includes('T')) {
                      // If it's a full datetime string like "1970-01-01T12:00:00.000Z"
                      // const date = new Date(timeStr);
                      // return date.toTimeString().slice(0, 5); // Returns HH:MM

                      return timeStr.split('T')[1]?.slice(0, 5) || '';


                    } else if (timeStr.includes(':')) {
                      // If it's already in HH:MM:SS or HH:MM format
                      return timeStr.slice(0, 5); // Returns HH:MM
                    }
                    return timeStr;
                  };

                  return {
                    ...row,
                    // Show patient name - find from patients array
                    PatientName: (patients.find(p => p.id == row.DS_P_ID_FK)?.Name) || `Patient ${row.DS_P_ID_FK}`,
                    // Format date properly
                    DS_Date: formatDate(row.DS_Date),
                    // Format time properly - ensure we're using the DS_Time field
                    DS_Time: formatTime(row.DS_Time || row.ds_time || row.time),
                    computed_status: (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: 
                          row.computed_status === 'Completed' ? '#4caf50' :
                          row.computed_status === 'Cancelled' ? '#f44336' :
                          row.computed_status === 'Initiated' ? '#ff9800' :
                          row.computed_status === 'Arrived' ? '#2196f3' :
                          row.computed_status === 'Missed' ? '#9c27b0' :
                          row.DS_Status === 0 ? '#f44336' : // Fallback for cancelled
                          '#757575' // Scheduled or default
                      }}>
                        {row.computed_status || (row.DS_Status === 0 ? 'Cancelled' : 'Scheduled')}
                      </span>
                    ),
                    actions: actionComponent,
                    DS_Added_on: new Date(row.DS_Added_on || row.DS_Added_On).toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      ...(isMSSQL
                        ? {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true,
                        }
                        : {}),
                    }),
                  };
                });
                
                // Debug: Log the first few mapped records to see what data is being passed to the table
                if (filteredAndMappedData.length > 0) {
                  console.log('Sample mapped data for table:', {
                    DS_Time: filteredAndMappedData[0].DS_Time,
                    DS_Added_on: filteredAndMappedData[0].DS_Added_on,
                    PatientName: filteredAndMappedData[0].PatientName,
                    allKeys: Object.keys(filteredAndMappedData[0])
                  });
                }
                
                return filteredAndMappedData;
              })()}
            />

          </>
        )}
      </PageContainer>
    </>
  );
}

export default Scheduling;
