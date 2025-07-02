// import React, { useState, useEffect, ChangeEvent } from 'react';
import React, { useState, useEffect} from 'react';
import type { ChangeEvent } from 'react';

import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import Header from '../components/Header';
import type { Patient, History } from '../types';
import SectionHeading from '../components/SectionHeading';
import { Row, Col, Container } from 'react-bootstrap';
import Table from '../components/Table';
import Searchbar from '../components/Searchbar';
import { useDialysis } from '../context/DialysisContext';

const HistoryPage: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
  const { history, patients, loading, error, refreshHistory } = useDialysis();
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter history based on search term and selected patient
  const getFilteredHistory = () => {
    let filteredHistory = history;

    // Filter by patient if selected
    if (selectedPatient) {
      filteredHistory = filteredHistory.filter(h => h.patientId === selectedPatient);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredHistory = filteredHistory.filter(h => 
        h.patientName?.toLowerCase().includes(searchLower) ||
        h.date?.toLowerCase().includes(searchLower) ||
        h.parameters?.toLowerCase().includes(searchLower) ||
        h.notes?.toLowerCase().includes(searchLower) ||
        h.nursingNotes?.toLowerCase().includes(searchLower) ||
        h.amount?.toString().includes(searchLower)
      );
    }

    return filteredHistory;
  };

  const handlePatientChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    setSelectedPatient(patientId);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="History" subtitle="View and manage dialysis session history" />
        <div className="history-header">
          <h2 className="history-title">Dialysis History</h2>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <div className="history-filters" >
            <div className="history-filter-group">
              <div className="form-group">
                <label htmlFor="patient" className="form-label">Filter by Patient</label>
                <select
                  id="patient"
                  className="form-select"
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
            <div className="history-search-group">
              <Searchbar 
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>

        <div className='history-table-container' style={{ width: '100%', marginLeft: 0, marginRight: 0, paddingBottom: 0 }}>
          {loading ? (
            <div className="alert alert-info">
              Loading history...
            </div>
          ) : getFilteredHistory().length === 0 ? (
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
                data={getFilteredHistory().map((h, i) => ({
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
      </PageContainer>
      <Footer />
    </>
  );
};

export default HistoryPage; 