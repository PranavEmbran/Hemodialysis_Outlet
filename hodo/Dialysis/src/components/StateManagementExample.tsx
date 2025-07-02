import React from 'react';
import { useDialysis } from '../context/DialysisContext';
import type { Patient, ScheduleEntry } from '../types';

/**
 * Example component demonstrating how to use centralized state management
 * This shows how any component can access and update data consistently
 */
const StateManagementExample: React.FC = () => {
  const { 
    patients, 
    appointments, 
    history, 
    loading, 
    error,
    updatePatient, 
    updateAppointment, 
    refreshAllData 
  } = useDialysis();

  const handlePatientUpdate = async (patientId: string) => {
    try {
      // This will automatically update the patient and all related records
      await updatePatient(patientId, {
        firstName: 'Updated',
        lastName: 'Name'
      });
      console.log('Patient updated successfully - all tables will reflect the change');
    } catch (error) {
      console.error('Failed to update patient:', error);
    }
  };

  const handleAppointmentUpdate = async (appointmentId: string) => {
    try {
      await updateAppointment(appointmentId, {
        status: 'Completed',
        remarks: 'Session completed successfully'
      });
      console.log('Appointment updated successfully');
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  const handleRefresh = () => {
    refreshAllData();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={handleRefresh}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h3>State Management Example</h3>
      
      <div>
        <h4>Patients ({patients.length})</h4>
        <ul>
          {patients.slice(0, 3).map(patient => (
            <li key={patient.id}>
              {patient.firstName || patient.name} {patient.lastName}
              <button onClick={() => handlePatientUpdate(patient.id!)}>
                Update Name
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4>Appointments ({appointments.length})</h4>
        <ul>
          {appointments.slice(0, 3).map(appointment => (
            <li key={appointment.id}>
              {appointment.patientName} - {appointment.status}
              <button onClick={() => handleAppointmentUpdate(appointment.id!)}>
                Mark Complete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4>History ({history.length})</h4>
        <ul>
          {history.slice(0, 3).map(record => (
            <li key={record.id}>
              {record.patientName} - {record.date}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleRefresh}>Refresh All Data</button>
    </div>
  );
};

export default StateManagementExample; 