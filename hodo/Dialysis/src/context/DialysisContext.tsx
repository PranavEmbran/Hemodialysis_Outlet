import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Patient } from '../types';

interface DialysisContextType {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  history: any[]; // TODO: Define proper history type when available
  setHistory: React.Dispatch<React.SetStateAction<any[]>>;
}

const DialysisContext = createContext<DialysisContextType | undefined>(undefined);

interface DialysisProviderProps {
  children: ReactNode;
}

export function DialysisProvider({ children }: DialysisProviderProps) {
  const [patients, setPatients] = useState<Patient[]>([
    { id: 1, name: 'John Doe', bloodGroup: 'A+', catheterDate: '2025-06-01', fistulaDate: '2025-06-05' },
  ]);
  const [history, setHistory] = useState<any[]>([]);

  return (
    <DialysisContext.Provider value={{ patients, setPatients, history, setHistory }}>
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