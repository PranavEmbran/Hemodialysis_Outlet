import React from 'react';
import HaemodialysisRecordDetails from '../components/HaemodialysisRecordDetails';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import { Row, Col, Container } from 'react-bootstrap';

const HaemodialysisRecordDetailsPage: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
  return (
    // <div className={`haemodialysis-record-page-container ${sidebarCollapsed ? 'collapsed' : ''}`}>
    // <Container fluid className={`haemodialysis-record-page-container py-2 ${sidebarCollapsed ? 'collapsed' : ''}`}>
    <>
    {/* <Container fluid className={`home-container py-2 ${sidebarCollapsed ? 'collapsed' : ''}`}> */}
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
      {/* <div className="main-container"> */}
        {/* <div style={{ width: '100%', padding: '10px',marginTop: '-20px' }}> */}
        <SectionHeading title="Haemodialysis In Process Vitals Record" subtitle="In Process Vitals Recorded in haemodialysis session" />
        {/* </div> */}
        <HaemodialysisRecordDetails />


{/* <div style={{ width: '100px', height: '500px' }}></div> */}


      {/* </div> */}
      </PageContainer>
      <Footer />
    {/* </Container> */}
    </>
  );
};

export default HaemodialysisRecordDetailsPage; 