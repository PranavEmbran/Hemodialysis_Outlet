import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
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

const Scheduling: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
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
  const [conflictInfo, setConflictInfo] = useState<{conflictingRows: any[], message: string}>({conflictingRows: [], message: ''});

  const today = new Date().toISOString().split('T')[0];

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
        const allowedIds = new Set(caseOpenings.map((c: any) => c.P_ID_FK));
        setPatients(patientsData.filter((p: any) => allowedIds.has(p.id)));
      }
    });
  }, []);

  const handleSubmit = async (values: typeof initialValues) => {
    setSaveStatus("");
    console.log('Form values:', values);

    const { fromDate, tillDate, interval, sessionPreferred, numSessions } = values;

    setError('');
    setConflictInfo({conflictingRows: [], message: ''});
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
      setError('No sessions can be generated for the selected date range and interval.');
    }

    // Fetch assigned sessions for the patient
    let conflicts: any[] = [];
    if (values.patient) {
      try {
        const res = await fetch(`${API_URL}/data/schedules_assigned?patientId=${values.patient}`);
        const assigned = await res.json();
        setAssignedSessions(assigned);
        // Check for conflicts
        conflicts = rows.filter(row => assigned.some((a: any) => a.SA_Date === row.date && a.SA_Time === row.time));
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
          setConflictInfo({conflictingRows: [], message: ''});
        }
      } catch (err) {
        setAssignedSessions([]);
      }
    }
    setScheduleRows(rows);
    setSelectedRows([]);
  };

  const handleRowSelect = (row: any) => {
    if (row.isConflicting) return; // Prevent selection if conflicting
    setSelectedRows(prev =>
      prev.some(r => r.id === row.id)
        ? prev.filter(r => r.id !== row.id)
        : [...prev, row]
    );
  };

  const handleSave = async (patientId: string) => {
    if (!patientId || selectedRows.length === 0) {
      setSaveStatus('Select a patient and at least one session.');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const sessions = selectedRows.map(row => ({
      P_ID_FK: patientId,
      SA_Date: row.date,
      SA_Time: row.time,
      isDeleted: 10,
      Added_by: 'admin',
      Added_on: today,
      Modified_by: 'admin',
      Modified_on: today,
      Provider_FK: 'PR001',
      Outlet_FK: 'OUT001'
    }));

    try {
      const res = await fetch(`${API_URL}/data/schedules_assigned`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessions)
      });
      if (res.ok) {
        setSaveStatus('Sessions saved successfully!');
      } else {
        setSaveStatus('Failed to save sessions.');
      }
    } catch (err) {
      setSaveStatus('Error saving sessions.');
    }
  };

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="Scheduling" subtitle="Fill the form to generate schedule" />
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values }) => (
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
                  <h4 style={{ backgroundColor: '#37a9be', color: 'white', padding: '0.5rem 1rem', margin: '1rem 0 2rem 0', borderRadius: '4px 4px 0 0', fontWeight: '600' }}>Schedule Table</h4>
                  {conflictInfo.message && (
                      // <div style={{ color: 'red', marginBottom: 8 }}>{conflictInfo.message}</div>
                      <div style={{ color: '#5a5a5a', marginBottom: 8 }}>{conflictInfo.message}</div>
                    )}
                    <Table
                    columns={[
                      { key: 'date', header: 'Date' },
                      { key: 'time', header: 'Time' },
                      { key: 'dayName', header: 'Day Name' },
                      { key: 'monthName', header: 'Month Name' },
                      { key: 'nthSession', header: 'Nth Session of Day' },
                      { key: 'select', header: 'Select' },
                    ]}
                    data={scheduleRows.map(row => ({
                      ...row,
                      select: (
                        <input
                          type="checkbox"
                          checked={selectedRows.some(r => r.id === row.id)}
                          onChange={() => handleRowSelect(row)}
                          disabled={row.isConflicting}
                        />
                      ),
                      // Highlight row if conflicting
                      _rowStyle: row.isConflicting ? { backgroundColor: '#ffd6d6' } : {},
                    }))}
                  />

                  {selectedRows.length > 0 && (
                    <>
                      <h4 style={{ backgroundColor: '#37a9be', color: 'white', padding: '0.5rem 1rem', margin: '1rem 0 2rem 0', borderRadius: '4px 4px 0 0', fontWeight: '600' }}>Selected Sessions</h4>
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
                        <ButtonWithGradient type="button" onClick={() => handleSave(values.patient)}>
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
      </PageContainer>
      <Footer />
    </>
  );
};

export default Scheduling;
