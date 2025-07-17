import React from 'react';
import HaemodialysisRecordDetails from '../components/HaemodialysisRecordDetails';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import { Row, Col, Container } from 'react-bootstrap';

// const HaemodialysisRecordDetailsPage: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
const HaemodialysisRecordDetailsPage: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({  }) => {
  return (
    <>
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer> */}
        {/* <SectionHeading title="Haemodialysis In Process Vitals Record" subtitle="In Process Vitals Recorded in haemodialysis session" /> */}
        <HaemodialysisRecordDetails />




      {/* </PageContainer>
      <Footer /> */}
    </>
  );
};

export default HaemodialysisRecordDetailsPage; 