import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Patient, ScheduleEntry, History } from '../types';
import { patientsApi } from '../api/patientsApi';
import { scheduleApi } from '../api/scheduleApi';
import { historyApi } from '../api/historyApi';

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
}

const DialysisContext = createContext<DialysisContextType | undefined>(undefined);

interface DialysisProviderProps {
  children: ReactNode;
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
      const updatedPatient = await patientsApi.updatePatient(patientId, updatedData);

      // Calculate the full name from updated data
      const fullName = `${updatedPatient.firstName || updatedPatient.name || ''} ${updatedPatient.lastName || ''}`.trim();

      // Optimistically update patients state
      setPatients(prevPatients => 
        prevPatients.map(p => 
          p.id === patientId ? { ...p, ...updatedPatient } : p
        )
      );

      // Update patient references in appointments
      setAppointments(prevAppointments => 
        prevAppointments.map(apt => {
          if (apt.patientId === patientId) {
            return {
              ...apt,
              patientName: fullName
            };
          }
          return apt;
        })
      );

      // Update patient references in history
      setHistory(prevHistory => 
        prevHistory.map(h => {
          if (h.patientId === patientId) {
            return {
              ...h,
              patientName: fullName,
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
      const updatedAppointment = await scheduleApi.updateSchedule(appointmentId, updatedData);

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
      const patientsData = await patientsApi.getAllPatients();
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
      const appointmentsData = await scheduleApi.getAllSchedules();
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
      const historyData = await historyApi.getAllHistory();
      setHistory(historyData);
    } catch (err) {
      console.error('Error refreshing history:', err);
      setError('Failed to refresh history data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const value: DialysisContextType = {
    // State
    patients,
    appointments,
    history,
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