import React, { useState } from 'react';
import DialysisFlowChart from '../components/DialysisFlowChart';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import { Row, Col, Container } from 'react-bootstrap';

// const DialysisFlowChartPage: React.FC = () => {
// const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
// const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);
const DialysisFlowChartPage: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {

  return (
    // <div className={`dialysis-flow-chart-container ${sidebarCollapsed ? 'collapsed' : ''}`}>
    // <Container fluid className={`dialysis-flow-chart-container py-2 ${sidebarCollapsed ? 'collapsed' : ''}`}>
    <Container fluid className={`home-container py-2 ${sidebarCollapsed ? 'collapsed' : ''}`}>

      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
      {/* <div className="main-container"> */}
        {/* <div style={{ width: '100%', padding: '10px',marginTop: '-20px' }}> */}
        <SectionHeading title="Dialysis Flow Chart" subtitle="Dialysis flow record for specific patient" />
        {/* </div> */}
        <DialysisFlowChart />
      {/* </div> */}
      </PageContainer>
      <Footer />
    </Container>
  );
};

export default DialysisFlowChartPage; 