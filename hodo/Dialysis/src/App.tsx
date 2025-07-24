import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
console.log("ToastContainer is", ToastContainer); // Should NOT be undefined
import './App.css';

import TopNavBar from './components/TopNavBar';
import SideBar from './components/SideBar';

import CaseOpening from './pages/CaseOpening';
import Scheduling from './pages/Scheduling';
import Blank from './pages/Blank';
import HD_Master from './pages/Hemodialysis_Master';
import UnitsManagement, { UnitsProvider } from './pages/UnitsManagement';
import VascularAccessLookup, { AccessTypesProvider } from './pages/VascularAccessLookup';
import DialyzerTypeLookup, { DialyzerTypeProvider } from './pages/DialyzerTypeLookup';
import Predialysis_Record from './pages/Predialysis_Record';
import Start_Dialysis_Record from './pages/Start_Dialysis_Record';
import Post_Dialysis_Record from './pages/Post_Dialysis_Record';
import Records from './pages/HDflow_Records';
import Dialysis_Workflow_Entry from './pages/HDflow_Entry';
import InProcess_records from "./pages/InProcess_records";


const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

  
  return (
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
                      <Route path="/" element={<CaseOpening sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      
                      <Route path="/blank" element={<Blank sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/case-opening" element={<CaseOpening sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/scheduling" element={<Scheduling sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/hd-master" element={<HD_Master sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/units-management" element={<UnitsManagement sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/vascular-access-lookup" element={<VascularAccessLookup sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/dialyzer-type-lookup" element={<DialyzerTypeLookup sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      {/* <Route path="/predialysis-record" element={<Predialysis_Record sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} /> */}
                      <Route path="/predialysis-record" element={<Predialysis_Record />} />
                      {/* <Route path="/start-dialysis-record" element={<Start_Dialysis_Record sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} /> */}
                      <Route path="/start-dialysis-record" element={<Start_Dialysis_Record />} />
                      <Route path="/haemodialysis-record-details" element={<InProcess_records sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                     
                      {/* <Route path="/post-dialysis-record" element={<Post_Dialysis_Record sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} /> */}
                      <Route path="/post-dialysis-record" element={<Post_Dialysis_Record />} />
                      <Route path="/hdflow-entry" element={<Dialysis_Workflow_Entry sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                      <Route path="/hdflow-records" element={<Records sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
                    </Routes>
                  </div>
                </div>
              </div>
              <ToastContainer position="top-right" autoClose={1500} />
            </Router >
          </DialyzerTypeProvider>
        </AccessTypesProvider>
      </UnitsProvider>
  );
};

export default App; 