import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';
// import './pages/Home.css';

// Import pages
import PatientRegistration from './initPages/PatientRegistration';
import Schedule from './initPages/Schedule';
import DialysisProcess from './initPages/DialysisProcess';
import Billing from './initPages/Billing';
import History from './initPages/History';
import Dashboard from './initPages/Home';

import TopNavBar from './components/TopNavBar';
import SideBar from './components/SideBar';
// import StartDialysis from './components/StartDialysis';
import DialysisFlowChartPage from "./initPages/DialysisFlowChartPage";
import HaemodialysisRecordDetailsPage from "./initPages/HaemodialysisRecordDetailsPage";
import DataLoaderTest from "./components/DataLoaderTest";
import { DialysisProvider } from './context/DialysisContext';

import CaseOpening from './pages/CaseOpening';
import Scheduling from './pages/Scheduling';
import Blank from './pages/Blank';
import HD_Master from './pages/Hemodialysis_Master';
import UnitsManagement, { UnitsProvider } from './pages/UnitsManagement';
import VascularAccessLookup, { AccessTypesProvider } from './pages/VascularAccessLookup';
import DialyzerTypeLookup, { DialyzerTypeProvider } from './pages/DialyzerTypeLookup';


const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

  return (
    <DialysisProvider>
      <UnitsProvider>
        <AccessTypesProvider>
          <DialyzerTypeProvider>
            <Router>
              {/* <ToastContainer position="top-right" autoClose={1500} /> */}
              <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: '#d9e0e7' }}>

                <TopNavBar />
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                  <SideBar collapsed={sidebarCollapsed} />
                  <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>


                    <Routes>
                      <Route path="/dashboard" element={<Dashboard sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/" element={<Dashboard sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/registration" element={<PatientRegistration sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/schedule" element={<Schedule sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/process" element={<DialysisProcess sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/billing" element={<Billing sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/history" element={<History sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      {/* <Route path="/start" element={<StartDialysis />} /> */}
                      <Route path="/dialysis-flow-chart" element={<DialysisFlowChartPage sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/haemodialysis-record-details" element={<HaemodialysisRecordDetailsPage sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/test" element={<DataLoaderTest />} />
                      <Route path="/blank" element={<Blank sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/case-opening" element={<CaseOpening sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/scheduling" element={<Scheduling sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/hd-master" element={<HD_Master sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/units-management" element={<UnitsManagement sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/vascular-access-lookup" element={<VascularAccessLookup sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/dialyzer-type-lookup" element={<DialyzerTypeLookup sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                    </Routes>
                  </div>
                </div>
              </div>
              <ToastContainer position="top-right" autoClose={1500} />
            </Router >
          </DialyzerTypeProvider>
        </AccessTypesProvider>
      </UnitsProvider>
    </DialysisProvider>
  );
};

export default App; 