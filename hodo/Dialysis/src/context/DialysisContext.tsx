import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Patient, ScheduleEntry, History } from '../types';
import { patientServiceFactory } from '../services/patient/factory';
import { scheduleServiceFactory } from '../services/schedule/factory';
import { historyServiceFactory } from '../services/history/factory';
import { toast } from 'react-toastify';

interface DialysisContextType {
  // State
  patients: Patient[];
  appointments: ScheduleEntry[];
  history: History[];
  loading: boolean;
  error: string;

  // State setters
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  setAppointments: React.Dispatch<React.SetStateAction<ScheduleEntry[]>>;
  setHistory: React.Dispatch<React.SetStateAction<History[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string>>;

  // Centralized update functions
  updatePatient: (patientId: string, updatedData: Partial<Patient>) => Promise<void>;
  updateAppointment: (appointmentId: string, updatedData: Partial<ScheduleEntry>) => Promise<void>;
  refreshAllData: () => Promise<void>;
  refreshPatients: () => Promise<void>;
  refreshAppointments: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  deletePatientAndCascade: (patientId: string) => Promise<void>;
  deleteAppointmentAndCascade: (appointmentId: string, patientId?: string) => Promise<void>;
}

const DialysisContext = createContext<DialysisContextType | undefined>(undefined);

interface DialysisProviderProps {
  children: ReactNode;
}

// Utility: Normalize isDeleted field for all records in all arrays (set to 10 if missing)
function normalizeIsDeletedArray<T extends { isDeleted?: number }>(arr: T[]): T[] {
  return arr.map(item => typeof item.isDeleted === 'undefined' ? { ...item, isDeleted: 10 } : item);
}

export function DialysisProvider({ children }: DialysisProviderProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<ScheduleEntry[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Load all data from APIs
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const patientService = patientServiceFactory.getService();
      const scheduleService = scheduleServiceFactory.getService();
      const historyService = historyServiceFactory.getService();
      const [patientsData, appointmentsData, historyData] = await Promise.all([
        patientService.getAllPatients(),
        scheduleService.getAllSchedules(),
        historyService.getAllHistory()
      ]);
      // Normalize isDeleted field for all records
      setPatients(normalizeIsDeletedArray(patientsData));
      setAppointments(normalizeIsDeletedArray(appointmentsData));
      setHistory(normalizeIsDeletedArray(historyData));
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all data on mount
  React.useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Update patient and refresh related data
  const updatePatient = useCallback(async (patientId: string, updatedData: Partial<Patient>) => {
    try {
      setLoading(true);
      setError('');

      // Update patient in backend
      const patientService = patientServiceFactory.getService();
      const updatedPatient = await patientService.updatePatient(patientId, updatedData);

      // Calculate the full name from updated data
      const fullName = `${updatedPatient.firstName || updatedPatient.name || ''} ${updatedPatient.lastName || ''}`.trim();

      // Optimistically update patients state, and update the 'name' field as well
      setPatients(prevPatients =>
        prevPatients.map(p =>
          p.id === patientId ? { ...p, ...updatedPatient, name: fullName } : p
        )
      );

      // Update patient references in appointments, including 'patientName' and 'name' if present
      setAppointments(prevAppointments =>
        prevAppointments.map(apt => {
          if (apt.patientId === patientId) {
            return {
              ...apt,
              patientName: fullName,
              name: fullName // In case 'name' is used in appointment records
            };
          }
          return apt;
        })
      );

      // Update patient references in history, including 'patientName' and 'name' if present
      setHistory(prevHistory =>
        prevHistory.map(h => {
          if (h.patientId === patientId) {
            return {
              ...h,
              patientName: fullName,
              name: fullName, // In case 'name' is used in history records
              gender: updatedData.gender || h.gender,
              age: updatedData.age?.toString() || h.age
            };
          }
          return h;
        })
      );

    } catch (err) {
      console.error('Error updating patient:', err);
      setError('Failed to update patient. Please try again.');
      // Refresh data to ensure consistency
      await loadAllData();
    } finally {
      setLoading(false);
    }
  }, [loadAllData]);

  // Update appointment
  const updateAppointment = useCallback(async (appointmentId: string, updatedData: Partial<ScheduleEntry>) => {
    try {
      setLoading(true);
      setError('');

      // Update appointment in backend
      const scheduleService = scheduleServiceFactory.getService();
      const updatedAppointment = await scheduleService.updateSchedule(appointmentId, updatedData);

      // Update appointments state
      setAppointments(prevAppointments =>
        prevAppointments.map(a =>
          a.id === appointmentId
            ? { ...a, ...updatedAppointment, id: String(appointmentId) }
            : a
        )
      );

    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment. Please try again.');
      // Refresh appointments to ensure consistency
      await refreshAppointments();
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh functions
  const refreshAllData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  const refreshPatients = useCallback(async () => {
    try {
      setLoading(true);
      const patientService = patientServiceFactory.getService();
      const patientsData = await patientService.getAllPatients();
      setPatients(patientsData);
    } catch (err) {
      console.error('Error refreshing patients:', err);
      setError('Failed to refresh patients data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const scheduleService = scheduleServiceFactory.getService();
      const appointmentsData = await scheduleService.getAllSchedules();
      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Error refreshing appointments:', err);
      setError('Failed to refresh appointments data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    try {
      setLoading(true);
      const historyService = historyServiceFactory.getService();
      const historyData = await historyService.getAllHistory();
      setHistory(historyData);
    } catch (err) {
      console.error('Error refreshing history:', err);
      setError('Failed to refresh history data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete patient and cascade in frontend state
  const deletePatientAndCascade = useCallback(async (patientId: string) => {
    try {
      setLoading(true);
      setError('');
      const patientService = patientServiceFactory.getService();
      await patientService.deletePatient(patientId);
      // Soft delete patient and cascade to related records in state (always set isDeleted: 0)
      setPatients(prev => prev.map(p => p.id === patientId ? { ...p, isDeleted: 0 } : p));
      setAppointments(prev => prev.map(a => a.patientId === patientId ? { ...a, isDeleted: 0 } : a));
      setHistory(prev => prev.map(h => h.patientId === patientId ? { ...h, isDeleted: 0 } : h));
      toast.success('Patient and related records deleted successfully!');
      // Always reload all data from backend to ensure appointments state is up-to-date
      await loadAllData();
    } catch (err) {
      setError('Failed to delete patient. Please try again.');
      toast.error('Failed to delete patient.');
      await loadAllData();
    } finally {
      setLoading(false);
    }
  }, [loadAllData]);

  // Delete appointment and cascade in frontend state
  const deleteAppointmentAndCascade = useCallback(async (appointmentId: string, patientId?: string) => {
    try {
      setLoading(true);
      setError('');
      const scheduleService = scheduleServiceFactory.getService();
      await scheduleService.deleteSchedule(appointmentId);
      // Soft delete appointment and related history in state
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, isDeleted: 0 } : a));
      if (patientId) {
        setHistory(prev => prev.map(h => h.patientId === patientId ? { ...h, isDeleted: 0 } : h));
      }
      toast.success('Appointment and related history deleted successfully!');
    } catch (err) {
      setError('Failed to delete appointment. Please try again.');
      toast.error('Failed to delete appointment.');
      await loadAllData();
    } finally {
      setLoading(false);
    }
  }, [loadAllData]);

  // Selectors: Only return active (not soft-deleted) records
  const visiblePatients = patients.filter(p => p.isDeleted === 10);
  const visibleAppointments = appointments.filter(a => a.isDeleted === 10);
  const visibleHistory = history.filter(h => h.isDeleted === 10);

  const value: DialysisContextType = {
    // State (expose only visible records)
    patients: visiblePatients,
    appointments: visibleAppointments,
    history: visibleHistory,
    loading,
    error,

    // State setters
    setPatients,
    setAppointments,
    setHistory,
    setLoading,
    setError,

    // Centralized update functions
    updatePatient,
    updateAppointment,
    refreshAllData,
    refreshPatients,
    refreshAppointments,
    refreshHistory,
    deletePatientAndCascade,
    deleteAppointmentAndCascade,
  };

  return (
    <DialysisContext.Provider value={value}>
      {children}
    </DialysisContext.Provider>
  );
}

export function useDialysis(): DialysisContextType {
  const context = useContext(DialysisContext);
  if (context === undefined) {
    throw new Error('useDialysis must be used within a DialysisProvider');
  }
  return context;
} 