// import React, { useState, useEffect, ChangeEvent } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent } from 'react';

import { FaUserInjured, FaProcedures, FaCalendarAlt } from 'react-icons/fa';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import Footer from '../components/Footer';
// import Header from '../components/Header';
import Header from '../components/Header';
import type { Patient, ScheduleEntry, History } from '../types';
import SectionHeading from '../components/SectionHeading';
import PageContainer from '../components/PageContainer';
import Cards from '../components/Cards';
import Table from '../components/Table';

import Searchbar from '../components/Searchbar';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import EditModal from '../components/EditModal';
import { patientFormConfig, appointmentFormConfig } from '../components/forms/formConfigs';
import { patientServiceFactory } from '../services/patient/factory';
import { scheduleServiceFactory } from '../services/schedule/factory';


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
  // Local state management
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<ScheduleEntry[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Filter states
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [opIp, setOpIp] = useState<'OP' | 'IP'>('OP');
  const [autoRefresh, setAutoRefresh] = useState<number>(15);
  const [showAll, setShowAll] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  
  // Table-specific search states
  const [patientsSearch, setPatientsSearch] = useState<string>('');
  const [appointmentsSearch, setAppointmentsSearch] = useState<string>('');

  // Auto-refresh timer
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  // Pagination state
  const [patientsPage, setPatientsPage] = useState<number>(1);
  const [appointmentsPage, setAppointmentsPage] = useState<number>(1);
  const [patientsRowsPerPage, setPatientsRowsPerPage] = useState<number>(10);
  const [appointmentsRowsPerPage, setAppointmentsRowsPerPage] = useState<number>(10);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingData, setEditingData] = useState<Patient | ScheduleEntry | null>(null);
  const [editingDataType, setEditingDataType] = useState<'patient' | 'appointment'>('patient');
  const [editLoading, setEditLoading] = useState<boolean>(false);

  // Service instances
  const patientService = patientServiceFactory.getService();
  const scheduleService = scheduleServiceFactory.getService();

  // Load all data from services
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [patientsData, appointmentsData] = await Promise.all([
        patientService.getAllPatients(),
        scheduleService.getAllSchedules(),
      ]);

      setPatients(patientsData);
      setAppointments(appointmentsData);
      // Note: History is not implemented in services yet, so we'll keep it empty for now
      setHistory([]);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [patientService, scheduleService]);

  // Refresh all data
  const refreshAllData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  // Update patient
  const updatePatient = useCallback(async (patientId: string, updatedData: Partial<Patient>) => {
    try {
      setLoading(true);
      setError('');

      const updatedPatient = await patientService.updatePatient(patientId, updatedData);
      
      // Update local state
      setPatients(prevPatients => 
        prevPatients.map(p => p.id === patientId ? updatedPatient : p)
      );

    } catch (err) {
      console.error('Error updating patient:', err);
      setError('Failed to update patient. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [patientService]);

  // Update appointment
  const updateAppointment = useCallback(async (appointmentId: string, updatedData: Partial<ScheduleEntry>) => {
    try {
      setLoading(true);
      setError('');

      const updatedAppointment = await scheduleService.updateSchedule(appointmentId, updatedData);
      
      // Update local state
      setAppointments(prevAppointments =>
        prevAppointments.map(a => a.id === appointmentId ? updatedAppointment : a)
      );

    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [scheduleService]);

  // Reset page when filters or rows per page change
  useEffect(() => {
    setPatientsPage(1);
  }, [fromDate, toDate, status, opIp, showAll, search, patients.length, patientsRowsPerPage]);
  useEffect(() => {
    setAppointmentsPage(1);
  }, [fromDate, toDate, status, opIp, showAll, search, appointments.length, appointmentsRowsPerPage]);

  // Load data on component mount
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Set up auto-refresh
  useEffect(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }

    if (autoRefresh > 0) {
      const timer = setInterval(() => {
        refreshAllData();
      }, autoRefresh * 60 * 1000); // Convert minutes to milliseconds
      setRefreshTimer(timer);
    }

    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [autoRefresh, refreshAllData]);

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

    // Filter out soft-deleted records
    filteredPatients = filteredPatients.filter(p => p.isDeleted === 10);
    filteredAppointments = filteredAppointments.filter(a => a.isDeleted === 10);
    filteredHistory = filteredHistory.filter(h => h.isDeleted === 10);

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
    refreshAllData();
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

  // Handle patients search
  const handlePatientsSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setPatientsSearch(e.target.value);
  };

  // Handle appointments search
  const handleAppointmentsSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setAppointmentsSearch(e.target.value);
  };

  const stats = getDashboardStats();
  const filteredData = getFilteredData();

  // Get filtered patients data with table-specific search
  const getFilteredPatientsData = () => {
    let filteredPatients = filteredData.patients;

    // Apply patients table search
    if (patientsSearch.trim()) {
      const searchLower = patientsSearch.toLowerCase();
      filteredPatients = filteredPatients.filter(p => {
        const fullName = `${p.firstName || p.name} ${p.lastName || ''}`.toLowerCase();
        return fullName.includes(searchLower) ||
               p.mobileNo?.includes(patientsSearch) ||
               p.bloodGroup?.toLowerCase().includes(searchLower) ||
               p.gender?.toLowerCase().includes(searchLower) ||
               p.dateOfBirth?.includes(patientsSearch);
      });
    }

    return filteredPatients;
  };

  // Get filtered appointments data with table-specific search
  const getFilteredAppointmentsData = () => {
    let filteredAppointments = filteredData.appointments;

    // Apply appointments table search
    if (appointmentsSearch.trim()) {
      const searchLower = appointmentsSearch.toLowerCase();
      filteredAppointments = filteredAppointments.filter(apt => 
        apt.patientName?.toLowerCase().includes(searchLower) ||
        apt.admittingDoctor?.toLowerCase().includes(searchLower) ||
        apt.date?.includes(appointmentsSearch) ||
        apt.time?.includes(appointmentsSearch) ||
        apt.dialysisUnit?.toLowerCase().includes(searchLower) ||
        apt.status?.toLowerCase().includes(searchLower)
      );
    }

    return filteredAppointments;
  };

  // Add handlers at the component level
  const handleEdit = (id: string | number, dataType: 'patient' | 'appointment') => {
    // Validate that we have a valid ID
    if (!id || id === '' || id === 'undefined' || id === 'null') {
      console.error('Invalid ID provided for editing:', id);
      return;
    }
    
    let dataToEdit: Patient | ScheduleEntry | null = null;
    
    if (dataType === 'patient') {
      dataToEdit = patients.find(p => p.id === id) || null;
    } else {
      dataToEdit = appointments.find(a => a.id === id) || null;
    }
    
    if (dataToEdit) {
      console.log('Editing data:', dataToEdit);
      setEditingData(dataToEdit);
      setEditingDataType(dataType);
      setShowEditModal(true);
    } else {
      console.error('Could not find data to edit for ID:', id, 'Type:', dataType);
    }
  };

  const handleDelete = async (id: string | number, dataType: 'patient' | 'appointment') => {
    // Get the name of the item being deleted for confirmation message
    let itemName = '';
    if (dataType === 'patient') {
      const patient = patients.find(p => p.id === id);
      itemName = patient ? `${patient.firstName || patient.name} ${patient.lastName || ''}`.trim() : 'this patient';
    } else {
      const appointment = appointments.find(a => a.id === id);
      itemName = appointment ? appointment.patientName || 'this appointment' : 'this appointment';
    }

    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${itemName}? This action cannot be undone.`
    );

    if (!isConfirmed) {
      return; // User cancelled the deletion
    }

    try {
      setLoading(true);
      setError('');

      if (dataType === 'patient') {
        await patientService.softDeletePatient(id);
        // Remove from local state
        setPatients(prevPatients => prevPatients.filter(p => p.id !== id));
      } else {
        await scheduleService.softDeleteSchedule(id);
        // Remove from local state
        setAppointments(prevAppointments => prevAppointments.filter(a => a.id !== id));
      }

      console.log(`Soft deleted ${dataType} with ID:`, id);
    } catch (err) {
      console.error(`Error soft deleting ${dataType}:`, err);
      setError(`Failed to delete ${dataType}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingData) return;
    
    setEditLoading(true);
    try {
      if (editingDataType === 'patient') {
        const patientData = editingData as Patient;
        
        // Validate patient ID
        if (!patientData.id) {
          throw new Error('Invalid patient ID');
        }
        
        console.log('Updating patient with ID:', patientData.id);
        
        // Use centralized update function
        await updatePatient(patientData.id as string, {
          firstName: values.firstName,
          lastName: values.lastName,
          gender: values.gender,
          dateOfBirth: values.dateOfBirth,
          mobileNo: values.mobileNo,
          bloodGroup: values.bloodGroup,
          catheterInsertionDate: values.catheterInsertionDate,
          fistulaCreationDate: values.fistulaCreationDate,
        });
        
      } else {
        const appointmentData = editingData as ScheduleEntry;
        
        // Validate appointment ID
        if (!appointmentData.id) {
          throw new Error('Invalid appointment ID');
        }
        
        console.log('Updating appointment with ID:', appointmentData.id);
        
        // Create a schedule update object that matches the Schedule interface
        const scheduleUpdateData = {
          patientName: values.patientName,
          date: values.date,
          time: values.time,
          staffName: values.admittingDoctor, // Map to staffName field
          status: values.status,
          notes: values.remarks, // Map to notes field
        };
        
        // Use centralized update function
        await updateAppointment(appointmentData.id as string, scheduleUpdateData);
      }
    } catch (error) {
      console.error('Error updating data:', error);
      throw error;
    } finally {
      setEditLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingData(null);
    setEditLoading(false);
  };

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
          <Button variant="primary" onClick={refreshAllData}>Retry</Button>
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

            <div className='dashboard-table-heading'>
              Registered Patients: {getFilteredPatientsData().length}
              <div className="dashboard-table-search">
                <Searchbar 
                  value={patientsSearch}
                  onChange={handlePatientsSearch}
                />
              </div>
            </div>
            <Table
              columns={[
                { key: 'name', header: 'Name' },
                { key: 'gender', header: 'Gender' },
                { key: 'mobileNo', header: 'Mobile' },
                { key: 'bloodGroup', header: 'Blood Group' },
                { key: 'dateOfBirth', header: 'DOB' },
                { key: 'lastVisit', header: 'Last Visit' },
                { key: 'action', header: 'Action' },
              ]}
              data={getFilteredPatientsData().map((p) => {
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
                  action: (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <EditButton onClick={() => handleEdit(p.id ?? '', 'patient')} />
                      <DeleteButton onClick={() => handleDelete(p.id ?? '', 'patient')} />
                    </div>
                  ),
                };
              })}
            />

            <div className='dashboard-table-heading'>
              Scheduled Appointments: {getFilteredAppointmentsData().length}
              <div className="dashboard-table-search">
                <Searchbar 
                  value={appointmentsSearch}
                  onChange={handleAppointmentsSearch}
                />
              </div>
            </div>
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
              data={getFilteredAppointmentsData().map((apt) => ({
                id: apt.id,
                expand: <Button size="sm" variant="outline-primary">+</Button>,
                patientName: apt.patientName,
                admittingDoctor: apt.admittingDoctor || 'Dr. Smith',
                date: apt.date,
                time: apt.time,
                dialysisUnit: apt.dialysisUnit,
                status: (
                  <span className={`status-badge ${
                    apt.status === 'Completed' ? 'active' :
                    apt.status === 'Scheduled' ? 'scheduled' :
                    'inactive'
                  }`}>
                  
                    {apt.status}
                  </span>
                ),
                action: (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <EditButton onClick={() => handleEdit(apt.id ?? '', 'appointment')} />
                    <DeleteButton onClick={() => handleDelete(apt.id ?? '', 'appointment')} />
                  </div>
                ),
              }))}
            />

        </PageContainer>
        
        {/* Edit Modal */}
        <EditModal
          show={showEditModal}
          onHide={handleCloseEditModal}
          data={editingData}
          formConfig={editingDataType === 'patient' ? patientFormConfig : appointmentFormConfig}
          onSubmit={handleEditSubmit}
          loading={editLoading}
        />
        
        <Footer />
    </>
  );
};

export default Dashboard; 