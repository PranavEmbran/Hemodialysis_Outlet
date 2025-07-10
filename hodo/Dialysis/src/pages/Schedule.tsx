import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import type { FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { scheduleServiceFactory } from '../services/schedule/factory';
import type { Patient, ScheduleEntry, StaffData } from '../types';
import './Schedule.css';
import Footer from '../components/Footer';
import Header from '../components/Header';
import SectionHeading from '../components/SectionHeading';
import PageContainer from '../components/PageContainer';
import ButtonWithGradient from '../components/ButtonWithGradient';
import Table from '../components/Table';
import Searchbar from '../components/Searchbar';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import EditModal from '../components/EditModal';
import { SelectField, DateField, TimeField, TextareaField } from '../components/forms';
import { appointmentFormConfig } from '../components/forms/formConfigs';
import { useDialysis } from '../context/DialysisContext';

interface ScheduleFormValues {
  patientId: string;
  dialysisUnit: string;
  technician: string;
  admittingDoctor: string;
  date: string;
  time: string;
  remarks: string;
}

const validationSchema = Yup.object({
  patientId: Yup.string().required('Patient selection is required'),
  dialysisUnit: Yup.string().required('Dialysis unit is required'),
  technician: Yup.string().required('Technician is required'),
  admittingDoctor: Yup.string().required('Admitting doctor is required'),
  date: Yup.date().required('Date is required'),
  time: Yup.string().required('Time is required'),
  remarks: Yup.string()
});

const Schedule: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
  const { appointments: schedules, patients, refreshAppointments, refreshPatients } = useDialysis();
  const [staff, setStaff] = useState<StaffData>({ technicians: [], doctors: [], units: [] });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [schedulesSearch, setSchedulesSearch] = useState<string>('');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingData, setEditingData] = useState<ScheduleEntry | null>(null);
  const [editLoading, setEditLoading] = useState<boolean>(false);

  // Service instance
  const scheduleService = scheduleServiceFactory.getService();

  // Pagination state for schedules
  const [schedulesPage, setSchedulesPage] = useState(1);
  const [schedulesRowsPerPage, setSchedulesRowsPerPage] = useState(10);
  const schedulesTotalPages = Math.ceil(schedules.length / schedulesRowsPerPage);
  const paginatedSchedules = schedules.slice((schedulesPage - 1) * schedulesRowsPerPage, schedulesPage * schedulesRowsPerPage);

  React.useEffect(() => {
    // Only fetch staff data, not patients or schedules
    scheduleService.getStaff().then(setStaff).catch(() => setError('Failed to fetch staff'));
  }, [scheduleService]);

  const initialValues: ScheduleFormValues = {
    patientId: '',
    dialysisUnit: '',
    technician: '',
    admittingDoctor: '',
    date: '',
    time: '',
    remarks: ''
  };

  const handleSubmit = async (values: ScheduleFormValues, { resetForm }: FormikHelpers<ScheduleFormValues>) => {
    setError('');
    const patient = patients.find(p => p.id?.toString() === values.patientId);
    if (!patient) {
      setError('Please select a patient.');
      return;
    }
    const newSchedule = {
      ...values,
      patientName: patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
      status: 'Scheduled' // Set default status
    };
    try {
      await scheduleService.createSchedule(newSchedule);
      setSuccess(true);
      resetForm();
      await refreshAppointments();
      await refreshPatients();
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setError('Failed to add schedule');
    }
  };

  // Handle schedules search
  const handleSchedulesSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSchedulesSearch(e.target.value);
  };

  // Get filtered schedules data with search
  const getFilteredSchedulesData = () => {
    let filteredSchedules = schedules;

    // Apply schedules search
    if (schedulesSearch.trim()) {
      const searchLower = schedulesSearch.toLowerCase();
      filteredSchedules = filteredSchedules.filter(schedule => 
        schedule.patientName?.toLowerCase().includes(searchLower) ||
        schedule.date?.includes(schedulesSearch) ||
        schedule.time?.includes(schedulesSearch) ||
        schedule.dialysisUnit?.toLowerCase().includes(searchLower) ||
        schedule.technician?.toLowerCase().includes(searchLower) ||
        schedule.admittingDoctor?.toLowerCase().includes(searchLower) ||
        schedule.status?.toLowerCase().includes(searchLower)
      );
    }

    return filteredSchedules;
  };

  // Handle edit
  const handleEdit = (id: string | number) => {
    const scheduleToEdit = schedules.find(s => s.id === id);
    if (scheduleToEdit) {
      setEditingData(scheduleToEdit);
      setShowEditModal(true);
    }
  };

  // Handle delete
  const handleDelete = async (id: string | number) => {
    const scheduleToDelete = schedules.find(s => s.id === id);
    const scheduleName = scheduleToDelete ? scheduleToDelete.patientName : 'this schedule';

    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${scheduleName}? This action cannot be undone.`
    );

    if (!isConfirmed) {
      return;
    }

    try {
      await scheduleService.softDeleteSchedule(id);
      // Refresh data to update the UI
      await refreshAppointments();
    } catch (err) {
      console.error('Error deleting schedule:', err);
      setError('Failed to delete schedule. Please try again.');
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (values: any) => {
    if (!editingData) return;
    
    setEditLoading(true);
    try {
      const updatedSchedule = await scheduleService.updateSchedule(editingData.id!, {
        patientName: values.patientName,
        date: values.date,
        time: values.time,
        dialysisUnit: values.dialysisUnit,
        admittingDoctor: values.admittingDoctor,
        status: values.status,
        remarks: values.remarks,
      });
      
      // Refresh data to update the UI
      await refreshAppointments();
      
      setShowEditModal(false);
      setEditingData(null);
    } catch (error) {
      console.error('Error updating schedule:', error);
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

  const renderPagination = (currentPage: number, totalPages: number, setPage: (page: number) => void, rowsPerPage: number, setRowsPerPage: (n: number) => void) => {
    const pageWindow = 2;
    let start = Math.max(1, currentPage - pageWindow);
    let end = Math.min(totalPages, currentPage + pageWindow);
    if (end - start < 4) {
      if (start === 1) end = Math.min(totalPages, start + 4);
      if (end === totalPages) start = Math.max(1, end - 4);
    }
    const pageNumbers = [];
    for (let i = start; i <= end; i++) pageNumbers.push(i);
    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Rows per page:
          <select
            value={rowsPerPage}
            onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
            style={{ margin: '0 8px', padding: '2px 8px', borderRadius: 4 }}
          >
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          Page {currentPage} of {totalPages}
        </div>
        <div className="pagination-controls">
          <button className="pagination-btn" onClick={() => setPage(1)} disabled={currentPage === 1}>&#171; First</button>
          <button className="pagination-btn" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>&#8249; Prev</button>
          <div className="page-numbers">
            {pageNumbers.map(page => (
              <button
                key={page}
                className={`page-number${page === currentPage ? ' active' : ''}`}
                onClick={() => setPage(page)}
                disabled={page === currentPage}
              >
                {page}
              </button>
            ))}
          </div>
          <button className="pagination-btn" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>Next &#8250;</button>
          <button className="pagination-btn" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>Last &#187;</button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="Schedule" subtitle="Manage and view dialysis appointments" />
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Body>
                <h2 className="home-title mb-4">Schedule Dialysis Session</h2>
                {success && (
                  <div className="alert alert-success">
                    Session scheduled successfully!
                  </div>
                )}
                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <Row>
                        <Col md={6} className="mb-3">
                          <SelectField
                            label="Patient"
                            name="patientId"
                            options={patients.map(p => ({
                              label: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
                              value: p.id?.toString() || ''
                            }))}
                            placeholder="Select Patient"
                            required
                          />
                        </Col>
                        <Col md={6} className="mb-3">
                          <SelectField
                            label="Dialysis Unit"
                            name="dialysisUnit"
                            options={staff.units.map(unit => ({
                              label: unit,
                              value: unit
                            }))}
                            placeholder="Select Unit"
                            required
                          />
                        </Col>
                        <Col md={6} className="mb-3">
                          <SelectField
                            label="Technician"
                            name="technician"
                            options={staff.technicians.map(tech => ({
                              label: tech,
                              value: tech
                            }))}
                            placeholder="Select Technician"
                            required
                          />
                        </Col>
                        <Col md={6} className="mb-3">
                          <SelectField
                            label="Admitting Doctor"
                            name="admittingDoctor"
                            options={staff.doctors.map(doc => ({
                              label: doc,
                              value: doc
                            }))}
                            placeholder="Select Doctor"
                            required
                          />
                        </Col>
                        <Col md={6} className="mb-3">
                          <DateField
                            label="Date"
                            name="date"
                            required
                          />
                        </Col>
                        <Col md={6} className="mb-3">
                          <TimeField
                            label="Time"
                            name="time"
                            required
                          />
                        </Col>
                        <Col md={12} className="mb-3">
                          <TextareaField
                            label="Remarks"
                            name="remarks"
                            placeholder="Enter any additional remarks..."
                            rows={3}
                          />
                        </Col>
                        <Col md={12}>
                          <ButtonWithGradient
                            type="submit"
                            disabled={isSubmitting}
                            text={isSubmitting ? 'Scheduling...' : 'Schedule Session'}
                          />
                        </Col>
                      </Row>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="table-container" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div className='dashboard-table-heading'>
            Scheduled Sessions: {getFilteredSchedulesData().length}
            <div className="dashboard-table-search">
              <Searchbar 
                value={schedulesSearch}
                onChange={handleSchedulesSearch}
              />
            </div>
          </div>
          <Table
            columns={[
              { key: 'patientName', header: 'Patient' },
              { key: 'scheduleId', header: 'Appointment ID' },
              { key: 'date', header: 'Date' },
              { key: 'time', header: 'Time' },
              { key: 'dialysisUnit', header: 'Unit' },
              { key: 'technician', header: 'Technician' },
              { key: 'admittingDoctor', header: 'Doctor' },
              { key: 'status', header: 'Status' },
              { key: 'actions', header: 'Actions' },
            ]}
            data={getFilteredSchedulesData().map(schedule => ({
              id: schedule.id,
              patientName: schedule.patientName,
              scheduleId: schedule.id,
              date: schedule.date,
              time: schedule.time,
              dialysisUnit: schedule.dialysisUnit,
              technician: schedule.technician,
              admittingDoctor: schedule.admittingDoctor,
              status: (
                <span className={`status-badge ${
                  schedule.status === 'Completed' ? 'active' :
                  schedule.status === 'Scheduled' || !schedule.status ? 'scheduled' :
                  'inactive'
                }`}>
                  {schedule.status || 'Scheduled'}
                </span>
              ),
              actions: (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <EditButton onClick={() => handleEdit(schedule.id!)} />
                  <DeleteButton onClick={() => handleDelete(schedule.id!)} />
                </div>
              ),
            }))}
          />
        </div>

        {/* Edit Modal */}
        <EditModal
          show={showEditModal}
          onHide={handleCloseEditModal}
          data={editingData}
          formConfig={appointmentFormConfig}
          onSubmit={handleEditSubmit}
          loading={editLoading}
          editingDataType="appointment"
        />
      </PageContainer>
      <Footer />
    </>
  );
};

export default Schedule; 