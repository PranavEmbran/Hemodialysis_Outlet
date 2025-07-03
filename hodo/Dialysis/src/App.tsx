import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';
// import './pages/Home.css';

// Import pages
import PatientRegistration from './pages/PatientRegistration';
import Schedule from './pages/Schedule';
import DialysisProcess from './pages/DialysisProcess';
import Billing from './pages/Billing';
import History from './pages/History';
import Dashboard from './pages/Home';
import TopNavBar from './components/TopNavBar';
import SideBar from './components/SideBar';
// import StartDialysis from './components/StartDialysis';
import DialysisFlowChartPage from "./pages/DialysisFlowChartPage";
import HaemodialysisRecordDetailsPage from "./pages/HaemodialysisRecordDetailsPage";
import { DialysisProvider } from './context/DialysisContext';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

  return (
    <DialysisProvider>
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
              </Routes>
            </div>
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={1500} />
      </Router >
    </DialysisProvider>
  );
};

export default App; 