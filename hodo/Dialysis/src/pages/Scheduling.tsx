import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import SelectField from '../components/forms/SelectField';
import InputField from '../components/forms/InputField';
import ButtonWithGradient from '../components/ButtonWithGradient';
import Table from '../components/Table';

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
  const [patients] = useState<any[]>([]); // Placeholder for new mock db integration
  const [form, setForm] = useState({
    patient: '',
    interval: '',
    sessionPreferred: '',
    numSessions: 1,
    fromDate: '',
    tillDate: '',
  });
  const [scheduleRows, setScheduleRows] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  // Generate mock schedule table based on form
  const generateSchedule = () => {
    setError('');
    if (form.fromDate && form.tillDate && new Date(form.fromDate) > new Date(form.tillDate)) {
      setScheduleRows([]);
      setSelectedRows([]);
      setError('From Date must be before or equal to Till Date.');
      return;
    }
    let startDate = form.fromDate ? new Date(form.fromDate) : new Date();
    let endDate = form.tillDate ? new Date(form.tillDate) : null;
    const rows = [];
    let i = 0;
    let count = 0;
    while (count < form.numSessions) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i * (form.interval === 'alternate' ? 2 : 1));
      if (endDate && date > endDate) break;
      rows.push({
        id: count + 1,
        date: date.toISOString().slice(0, 10),
        time: form.sessionPreferred === '1st' ? '08:00' : form.sessionPreferred === '2nd' ? '12:00' : '16:00',
        dayName: getDayName(date.toISOString().slice(0, 10)),
        monthName: getMonthName(date.toISOString().slice(0, 10)),
        nthSession: form.sessionPreferred,
      });
      count++;
      i++;
    }
    if (rows.length === 0) {
      setError('No sessions can be generated for the selected date range and interval.');
    }
    setScheduleRows(rows);
    setSelectedRows([]);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'numSessions' ? Number(value) : value }));
  };

  const handleRowSelect = (row: any) => {
    setSelectedRows(prev =>
      prev.some(r => r.id === row.id)
        ? prev.filter(r => r.id !== row.id)
        : [...prev, row]
    );
  };

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="Scheduling" subtitle="Scheduling" />
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        <form style={{ maxWidth: 600, margin: '0 auto', marginBottom: 32 }} onSubmit={e => { e.preventDefault(); generateSchedule(); }}>
          <div className="form-group">
            <label htmlFor="patient" className="form-label">Patient 
              {/* <span className="text-danger">*</span> */}
              </label>
            <select
              id="patient"
              name="patient"
              className="form-select"
              value={form.patient}
              onChange={handleFormChange}
              // required
            >
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id ?? ''}>{p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim()}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="interval" className="form-label">Interval <span className="text-danger">*</span></label>
            <select
              id="interval"
              name="interval"
              className="form-select"
              value={form.interval}
              onChange={handleFormChange}
              required
            >
              <option value="">Select Interval</option>
              {intervalOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="sessionPreferred" className="form-label">Session Preferred <span className="text-danger">*</span></label>
            <select
              id="sessionPreferred"
              name="sessionPreferred"
              className="form-select"
              value={form.sessionPreferred}
              onChange={handleFormChange}
              required
            >
              <option value="">Select Session</option>
              {sessionOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="numSessions" className="form-label">Number of Sessions <span className="text-danger">*</span></label>
            <input
              id="numSessions"
              name="numSessions"
              type="number"
              className="form-control"
              value={form.numSessions}
              min={1}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="fromDate" className="form-label">From Date <span className="text-danger">*</span></label>
            <input
              id="fromDate"
              name="fromDate"
              type="date"
              className="form-control"
              value={form.fromDate}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="tillDate" className="form-label">Till Date</label>
            <input
              id="tillDate"
              name="tillDate"
              type="date"
              className="form-control"
              value={form.tillDate}
              onChange={handleFormChange}
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <ButtonWithGradient type="submit">Generate Schedule</ButtonWithGradient>
          </div>
        </form>
        {scheduleRows.length > 0 && (
          <>
            <h4>Schedule Table</h4>
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
                  />
                ),
              }))}
            />
            {selectedRows.length > 0 && (
              <>
                <h4 style={{ marginTop: 32 }}>Selected Sessions</h4>
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
              </>
            )}
          </>
        )}
      </PageContainer>
      <Footer />
    </>
  );
};

export default Scheduling; 