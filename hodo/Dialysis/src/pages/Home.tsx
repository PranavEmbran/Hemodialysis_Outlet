// import React, { useState, useEffect, ChangeEvent } from 'react';
import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';

import { FaUserInjured, FaProcedures, FaCalendarAlt } from 'react-icons/fa';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import Footer from '../components/Footer';
// import Header from '../components/Header';
import Header from '../components/Header';
import { patientsApi } from '../api/patientsApi';
import { scheduleApi } from '../api/scheduleApi';
import { historyApi } from '../api/historyApi';
import type { Patient, ScheduleEntry, History } from '../types';
import SectionHeading from '../components/SectionHeading';
import PageContainer from '../components/PageContainer';
import Cards from '../components/Cards';
import Table from '../components/Table';
import Pagination from '../components/Pagination';


interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
}


interface FilteredData {
  patients: Patient[];
  appointments: ScheduleEntry[];
  history: History[];
}

const Dashboard: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
  // State for real data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<ScheduleEntry[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Filter states
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [opIp, setOpIp] = useState<'OP' | 'IP'>('OP');
  const [autoRefresh, setAutoRefresh] = useState<number>(15);
  const [showAll, setShowAll] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Auto-refresh timer
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  // Pagination state
  const [patientsPage, setPatientsPage] = useState<number>(1);
  const [appointmentsPage, setAppointmentsPage] = useState<number>(1);
  const [patientsRowsPerPage, setPatientsRowsPerPage] = useState<number>(10);
  const [appointmentsRowsPerPage, setAppointmentsRowsPerPage] = useState<number>(10);

  // Reset page when filters or rows per page change
  useEffect(() => {
    setPatientsPage(1);
  }, [fromDate, toDate, status, opIp, showAll, search, patients.length, patientsRowsPerPage]);
  useEffect(() => {
    setAppointmentsPage(1);
  }, [fromDate, toDate, status, opIp, showAll, search, appointments.length, appointmentsRowsPerPage]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Set up auto-refresh
  useEffect(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }

    if (autoRefresh > 0) {
      const timer = setInterval(() => {
        loadData();
      }, autoRefresh * 60 * 1000); // Convert minutes to milliseconds
      setRefreshTimer(timer);
    }

    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [autoRefresh]);

  // Load all data from APIs
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [patientsData, appointmentsData, historyData] = await Promise.all([
        patientsApi.getAllPatients(),
        scheduleApi.getAllSchedules(),
        historyApi.getAllHistory()
      ]);

      setPatients(patientsData);
      setAppointments(appointmentsData);
      setHistory(historyData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate dashboard statistics
  const getDashboardStats = (): Stat[] => {
    const today = new Date().toISOString().split('T')[0];

    // Count active patients (patients with recent appointments or history)
    const activePatients = patients.filter(patient => {
      const hasRecentAppointment = appointments.some(apt =>
        apt.patientId === patient.id && apt.date >= today
      );
      const hasRecentHistory = history.some(h =>
        h.patientId === patient.id && h.date >= today
      );
      return hasRecentAppointment || hasRecentHistory;
    }).length;

    // Count today's dialysis sessions
    const todaysSessions = history.filter(h => h.date === today).length;

    // Count upcoming appointments (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= new Date() && aptDate <= nextWeek;
    }).length;

    return [
      {
        label: 'Total Active Patients',
        value: activePatients,
        icon: <FaUserInjured />
      },
      {
        label: "Today's Dialysis Sessions",
        value: todaysSessions,
        icon: <FaProcedures />
      },
      {
        label: 'Upcoming Appointments',
        value: upcomingAppointments,
        icon: <FaCalendarAlt />
      },
    ];
  };

  // Filter data based on current filters
  const getFilteredData = (): FilteredData => {
    let filteredPatients = [...patients];
    let filteredAppointments = [...appointments];
    let filteredHistory = [...history];

    // Apply date range filter
    if (fromDate) {
      filteredAppointments = filteredAppointments.filter(apt => apt.date >= fromDate);
      filteredHistory = filteredHistory.filter(h => h.date >= fromDate);
    }
    if (toDate) {
      filteredAppointments = filteredAppointments.filter(apt => apt.date <= toDate);
      filteredHistory = filteredHistory.filter(h => h.date <= toDate);
    }

    // Apply status filter
    if (status) {
      filteredAppointments = filteredAppointments.filter(apt => apt.status === status);
    }

    // Apply OP/IP filter (assuming OP = outpatient, IP = inpatient)
    // This is a simplified implementation - you might need to adjust based on your data structure
    if (opIp === 'IP') {
      // Filter for inpatients (you might need to add a field to distinguish OP/IP)
      filteredPatients = filteredPatients.filter(p => p.id); // Placeholder logic
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPatients = filteredPatients.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchLower) ||
        p.mobileNo?.includes(search) ||
        p.bloodGroup?.toLowerCase().includes(searchLower)
      );
    }

    // Apply "Show All" filter
    if (!showAll) {
      // Show only patients with recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentDate = thirtyDaysAgo.toISOString().split('T')[0];

      filteredPatients = filteredPatients.filter(patient => {
        const hasRecentActivity = appointments.some(apt =>
          apt.patientId === patient.id && apt.date >= recentDate
        ) || history.some(h =>
          h.patientId === patient.id && h.date >= recentDate
        );
        return hasRecentActivity;
      });
    }

    return {
      patients: filteredPatients,
      appointments: filteredAppointments,
      history: filteredHistory
    };
  };

  // Handle manual refresh
  const handleRefresh = () => {
    loadData();
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setStatus('');
    setOpIp('OP');
    setSearch('');
    setShowAll(true);
  };

  const stats = getDashboardStats();
  const filteredData = getFilteredData();

  // Pagination logic
  // const patientsTotalPages = Math.ceil(filteredData.patients.length / patientsRowsPerPage);
  // const appointmentsTotalPages = Math.ceil(filteredData.appointments.length / appointmentsRowsPerPage);
  // const paginatedPatients = filteredData.patients.slice((patientsPage - 1) * patientsRowsPerPage, patientsPage * patientsRowsPerPage);
  // const paginatedAppointments = filteredData.appointments.slice((appointmentsPage - 1) * appointmentsRowsPerPage, appointmentsPage * appointmentsRowsPerPage);

  // const renderPagination = (currentPage: number, totalPages: number, setPage: (page: number) => void, rowsPerPage: number, setRowsPerPage: (n: number) => void) => {
  //   // Show a window of 5 page numbers
  //   const pageWindow = 2;
  //   let start = Math.max(1, currentPage - pageWindow);
  //   let end = Math.min(totalPages, currentPage + pageWindow);
  //   if (end - start < 4) {
  //     if (start === 1) end = Math.min(totalPages, start + 4);
  //     if (end === totalPages) start = Math.max(1, end - 4);
  //   }
  //   const pageNumbers = [];
  //   for (let i = start; i <= end; i++) pageNumbers.push(i);

  //   return (
  //     <div className="pagination-container">
  //       <div className="pagination-info">
  //         Rows per page:
  //         <select
  //           value={rowsPerPage}
  //           onChange={e => setRowsPerPage(Number(e.target.value))}
  //           style={{ margin: '0 8px', padding: '2px 8px', borderRadius: 4 }}
  //         >
  //           {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
  //         </select>
  //         Page {currentPage} of {totalPages}
  //       </div>
  //       <div className="pagination-controls">
  //         <button className="pagination-btn" onClick={() => setPage(1)} disabled={currentPage === 1}>&#171; First</button>
  //         <button className="pagination-btn" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>&#8249; Prev</button>
  //         <div className="page-numbers">
  //           {pageNumbers.map(page => (
  //             <button
  //               key={page}
  //               className={`page-number${page === currentPage ? ' active' : ''}`}
  //               onClick={() => setPage(page)}
  //               disabled={page === currentPage}
  //             >
  //               {page}
  //             </button>
  //           ))}
  //         </div>
  //         <button className="pagination-btn" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>Next &#8250;</button>
  //         <button className="pagination-btn" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>Last &#187;</button>
  //       </div>
  //     </div>
  //   );
  // };

  if (loading) {
    return (
      <>
        <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <Container fluid className="home-container py-5">
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading dashboard data...</p>
          </div>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <Container fluid className={`home-container py-2 ${sidebarCollapsed ? 'collapsed' : ''}`}>

        <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <div className="alert alert-danger" role="alert">
          <h4>Error Loading Data</h4>
          <p>{error}</p>
          <Button variant="primary" onClick={loadData}>Retry</Button>
        </div>
      </Container>
    );
  }

  return (
    <>
      {/* <Container fluid className={`home-container py-2 ${sidebarCollapsed ? 'collapsed' : ''}`}> */}
        <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <PageContainer>
          {/* <div className="main-container"> */}

          <SectionHeading title="Dashboard" subtitle="Overview and quick stats for dialysis management" />
          <Row className="mb-4">
            {stats.map((stat) => (
              <Col key={stat.label} md={4} className="mb-3 d-grid">
                <Cards title={stat.label} subtitle={stat.value.toString()} />
              </Col>
            ))}
          </Row>


          {/* <div className="table-container" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}> */}
            <div className='dashboard-table-heading'>Registered Patients: {filteredData.patients.length}</div>
            <Table
              columns={[
                { key: 'name', header: 'Name' },
                { key: 'gender', header: 'Gender' },
                { key: 'mobileNo', header: 'Mobile' },
                { key: 'bloodGroup', header: 'Blood Group' },
                { key: 'dateOfBirth', header: 'DOB' },
                { key: 'lastVisit', header: 'Last Visit' },
              ]}
              data={filteredData.patients.map((p) => {
                const lastVisit = history
                  .filter(h => h.patientId === p.id)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                return {
                  id: p.id,
                  name: (p.firstName || p.name) + (p.lastName ? ' ' + p.lastName : ''),
                  gender: p.gender,
                  mobileNo: p.mobileNo,
                  bloodGroup: p.bloodGroup,
                  dateOfBirth: p.dateOfBirth,
                  lastVisit: lastVisit ? lastVisit.date : 'No visits',
                };
              })}
            />
          {/* </div> */}
          {/* </Col> */}
          {/* </Row> */}
          {/* <Row> */}
          {/* <Col> */}
          {/* <div className="table-container" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}> */}
            <div className='dashboard-table-heading'>Scheduled Appointments: {filteredData.appointments.length}</div>
            <Table
              columns={[
                { key: 'expand', header: '' },
                { key: 'patientName', header: 'Patient Name' },
                { key: 'admittingDoctor', header: 'Doctor' },
                { key: 'date', header: 'Date' },
                { key: 'time', header: 'Time' },
                { key: 'dialysisUnit', header: 'Unit' },
                { key: 'status', header: 'Status' },
                { key: 'action', header: 'Action' },
              ]}
              data={filteredData.appointments.map((apt) => ({
                id: apt.id,
                expand: <Button size="sm" variant="outline-primary">+</Button>,
                patientName: apt.patientName,
                admittingDoctor: apt.admittingDoctor || 'Dr. Smith',
                date: apt.date,
                time: apt.time,
                dialysisUnit: apt.dialysisUnit,
                status: (
                  <span className={`badge bg-${apt.status === 'Completed' ? 'success' : apt.status === 'Scheduled' ? 'primary' : 'warning'}`}>
                    {apt.status}
                  </span>
                ),
                action: <Button size="sm" variant="outline-secondary">View</Button>,
              }))}
            />
          {/* </div> */}
          {/* </Col> */}
          {/* </Row> */}
          {/* </div> */}
        </PageContainer>
        <Footer />
      {/* </Container> */}
    </>
  );
};

export default Dashboard; 