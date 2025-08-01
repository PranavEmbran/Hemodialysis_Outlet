import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import Breadcrumb from '../components/Breadcrumb';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import { InputField, SelectField } from '../components/forms';
import ButtonWithGradient from '../components/ButtonWithGradient';
import Table from '../components/Table';
import { API_URL } from '../config';

const sessionOptions = [
  { label: '1st', value: '1st' },
  { label: '2nd', value: '2nd' },
  { label: '3rd', value: '3rd' },
];
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

const steps = [
  { label: 'Assign Schedule' },
  { label: 'View Assigned Schedules' }
];



const Scheduling: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [unitsCount, setUnitsCount] = useState<number>(0);

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

  // Fetch all assigned schedules when switching to view step
  useEffect(() => {
    if (currentStep === 1) {
      fetch(`${API_URL}/data/Dialysis_Schedules`)
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
    // Optionally clear on leaving view step
    // else setAssignedSessions([]);
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
    sessionPreferred: '1st',
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
        setPatients(patientsData.filter((p: any) => allowedIds.has(p.id)));
      }
    });
  }, []);

  const handleSubmit = async (values: typeof initialValues) => {
    setSaveStatus("");
    console.log('Form values:', values);

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
    const rows = [];
    let i = 0;
    let count = 0;

    while (count < Number(numSessions)) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i * (interval === 'alternate' ? 2 : 1));
      if (endDate && date > endDate) break;
      rows.push({
        id: count + 1,
        date: date.toISOString().slice(0, 10),
        time: sessionPreferred === '1st' ? '08:00' : sessionPreferred === '2nd' ? '12:00' : '16:00',
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
        conflicts = rows.filter(row => assigned.some((a: any) => a.DS_Date === row.date && (a.DS_Time === row.time || a.DS_Time?.startsWith(row.time))));



        // Mark isConflicting flag
        rows.forEach(row => {
          row.isConflicting = conflicts.some(c => c.date === row.date && c.time === row.time);
        });
        if (conflicts.length > 0) {
          setConflictInfo({
            conflictingRows: conflicts,
            // message: `The following ${conflicts.length} sessions conflict with existing schedules and cannot be selected or saved.`
            message: `The sessions already booked cannot be selected or saved.`
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
    // if (row.isConflicting) return; // Prevent selection if conflicting
    if (row.isConflicting && row.atCapacity) return; // Prevent selection if conflicting
    setSelectedRows(prev =>
      prev.some(r => r.id === row.id)
        ? prev.filter(r => r.id !== row.id)
        : [...prev, row]
    );
  };




  const handleSave = async (patientId: string | number, resetForm?: () => void) => {
    setFormKey(prev => prev + 1); // force re-render to fully reset select

    if (!patientId || selectedRows.length === 0) {
      setSaveStatus('Select a patient and at least one session.');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
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
                      options={sessionOptions}
                      required
                      placeholder="Select Session"
                      defaultValue={sessionOptions[0]}
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
                        <div style={{ color: '#5a5a5a', marginBottom: 8 }}>{conflictInfo.message}</div>
                      )}
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
                          // const bookedCount = assignedSessions.filter(a => a.DS_Date === row.date && a.DS_Time === row.time).length;
                          const bookedCount = assignedSessions.filter(a => a.DS_Date === row.date && (a.DS_Time === row.time || a.DS_Time?.startsWith(row.time))).length;



                          const atCapacity = bookedCount >= unitsCount;
                          console.log(`Row ID: ${row.id}, nthSession: ${row.nthSession}, bookedCount: ${bookedCount}, unitsCount: ${unitsCount}, atCapacity: ${atCapacity}, isConflicting: ${row.isConflicting}`);
                          return {
                            ...row,
                            booked: `${bookedCount} / ${unitsCount}`,
                            atCapacity,
                            select: (
                              <input
                                type="checkbox"
                                checked={selectedRows.some(r => r.id === row.id)}
                                onChange={() => handleRowSelect(row)}
                                // disabled={row.isConflicting || atCapacity}
                                disabled={row.isConflicting && atCapacity}
                              />
                            ),
                            _rowStyle: row.isConflicting
                              ? { backgroundColor: '#ffd6d6' }
                              : atCapacity
                                ? { backgroundColor: '#ffe7ba' }
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
            <Table
              columns={[
                { key: 'DS_P_ID_FK', header: 'Patient ID' },
                { key: 'PatientName', header: 'Patient Name' },
                { key: 'DS_Date', header: 'Date' },
                { key: 'DS_Time', header: 'Time' },
                { key: 'DS_Added_on', header: 'Added On' },
                // { key: 'Provider_FK', header: 'Provider' },
                // { key: 'Outlet_FK', header: 'Outlet' }
              ]}
              data={assignedSessions
                .map(row => ({
                  ...row,
                //Uncomment to show patient name when USE_MSSQL=false
                // PatientName: (patients.find(p => p.id === row.DS_P_ID_FK)?.Name) || '',
                  
                  DS_Added_on: new Date(row.DS_Added_on).toLocaleString('en-US', {
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
                }))
              }
            />
          </>
        )}
      </PageContainer>
    </>
  );
}

export default Scheduling;
