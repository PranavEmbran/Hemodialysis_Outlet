// import React, { useState, useEffect, ChangeEvent } from 'react';
import React, { useState, useEffect} from 'react';
import type { ChangeEvent } from 'react';

import { historyApi } from '../api/historyApi';
import { patientsApi } from '../api/patientsApi';
import './History.css';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import Header from '../components/Header';
import type { Patient, History } from '../types';
import SectionHeading from '../components/SectionHeading';
import { Row, Col, Container } from 'react-bootstrap';
import Table from '../components/Table';

const HistoryPage: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [history, setHistory] = useState<History[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  // const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [historyData, patientsData] = await Promise.all([
          historyApi.getAllHistory(),
          patientsApi.getAllPatients()
        ]);
        setHistory(historyData);
        setPatients(patientsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePatientChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    setSelectedPatient(patientId);
    try {
      setLoading(true);
      setError('');
      if (patientId) {
        const patientHistory = await historyApi.getHistoryByPatientId(patientId);
        setHistory(patientHistory);
      } else {
        const allHistory = await historyApi.getAllHistory();
        setHistory(allHistory);
      }
    } catch (err) {
      console.error('Error loading patient history:', err);
      setError('Failed to load patient history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <div className={`history-container ${sidebarCollapsed ? 'collapsed' : ''}`}> */}
      {/* <Container fluid className={`history-container py-2 ${sidebarCollapsed ? 'collapsed' : ''}`}> */}
      <Container fluid className={`home-container py-2 ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <PageContainer>
          {/* <div className="main-container"> */}
          {/* <div style={{ width: '100%', padding: '10px',marginTop: '-20px' }}> */}
          <SectionHeading title="History" subtitle="View and manage dialysis session history" />
          {/* </div> */}
          <div className="history-header">
            <h2 className="history-title">Dialysis History</h2>

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <div className="history-filters" >
              <div className="history-filter-group">
                <label className="history-filter-label" htmlFor="patient">Filter by Patient</label>
                <select
                  id="patient"
                  className="history-filter-select"
                  value={selectedPatient}
                  onChange={handlePatientChange}
                  disabled={loading}
                >
                  <option value="">All Patients</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {(patient.firstName || '') + ' ' + (patient.lastName || '')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* <div className="history-content">
            <div className="history-timeline">
              <div className="history-timeline-header">
                <h3 className="history-timeline-title">Treatment History</h3>
              </div> */}
          <div className='history-table-container' style={{ width: '100%', marginLeft: 0, marginRight: 0, paddingBottom: 0 }}>
            {/* <h3 className="mb-4 history-title" style={{ marginLeft: '20px' }}>Treatment History</h3> */}

            {loading ? (
              <div className="alert alert-info">
                Loading history...
              </div>
            ) : history.length === 0 ? (
              <div className="alert alert-info">
                No dialysis history found.
              </div>
            ) : (
              <div className="table-container" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Table
                  columns={[
                    { key: 'date', header: 'Date' },
                    { key: 'patientName', header: 'Patient' },
                    { key: 'parameters', header: 'Parameters' },
                    { key: 'notes', header: 'Notes' },
                    { key: 'amount', header: 'Amount' },
                  ]}
                  data={history.map((h, i) => ({
                    id: h.id || i,
                    date: h.date,
                    patientName: h.patientName,
                    parameters: h.parameters || h.treatmentParameters?.dialyzer || '-',
                    notes: h.notes || h.nursingNotes || '-',
                    amount: h.amount || '-',
                  }))}
                />
              </div>
            )}
          </div>
          {/* </div> */}
          {/* </div> */}
        </PageContainer>
        <Footer />
      </Container >
    </>
  );
};

export default HistoryPage; 