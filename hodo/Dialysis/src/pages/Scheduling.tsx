import React from 'react';
// import HaemodialysisRecordDetails from '../components/HaemodialysisRecordDetails';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
// import { Row, Col, Container } from 'react-bootstrap';

const Scheduling: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="Scheduling" subtitle="Scheduling" />
        <div style={{ height: '40vh' }}></div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default Scheduling; 