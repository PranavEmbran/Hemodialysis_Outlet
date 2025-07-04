import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import type{FormikHelpers } from 'formik';
import * as Yup from 'yup';
import html2pdf from 'html2pdf.js';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { billingServiceFactory } from '../services/billing/factory';
import './Billing.css';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import Header from '../components/Header';
import type { Patient, Billing as BillingType } from '../types';
import SectionHeading from '../components/SectionHeading';
import ButtonWithGradient from '../components/ButtonWithGradient';
import Table from '../components/Table';
import Searchbar from '../components/Searchbar';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import EditModal from '../components/EditModal';
import { SelectField, DateField, InputField } from '../components/forms';
import { billingFormConfig } from '../components/forms/formConfigs';
import { useDialysis } from '../context/DialysisContext';

interface BillingFormValues {
  patientId: string;
  sessionDate: string;
  sessionDuration: string;
  amount: string;
}

const validationSchema = Yup.object({
  patientId: Yup.string().required('Patient selection is required'),
  sessionDate: Yup.date().required('Session date is required'),
  sessionDuration: Yup.number().required('Session duration is required'),
  amount: Yup.number().required('Amount is required'),
});

const Billing: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
  const { patients } = useDialysis();
  const [bills, setBills] = useState<BillingType[]>([]);
  const [selectedBill, setSelectedBill] = useState<BillingType | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [billsSearch, setBillsSearch] = useState<string>('');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingData, setEditingData] = useState<BillingType | null>(null);
  const [editLoading, setEditLoading] = useState<boolean>(false);

  // Service instance
  const billingService = billingServiceFactory.getService();

  // Pagination state for bills
  const [billsPage, setBillsPage] = useState(1);
  const [billsRowsPerPage, setBillsRowsPerPage] = useState(10);
  const billsTotalPages = Math.ceil(bills.length / billsRowsPerPage);
  const paginatedBills = bills.slice((billsPage - 1) * billsRowsPerPage, billsPage * billsRowsPerPage);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const billsData = await billingService.getAllBills();
        setBills(billsData);
      } catch (err) {
        setError('Failed to fetch bills');
      }
    };
    fetchBills();
  }, [billingService]);

  const initialValues: BillingFormValues = {
    patientId: '',
    sessionDate: '',
    sessionDuration: '',
    amount: '',
  };

  const handleSubmit = async (values: BillingFormValues, { resetForm }: FormikHelpers<BillingFormValues>) => {
    setError('');
    const patient = patients.find(p => p.id === values.patientId);
    if (!patient) {
      setError('Please select a patient.');
      return;
    }
    const newBill = {
      ...values,
      patientName: (patient.firstName || patient.name) + (patient.lastName ? ' ' + patient.lastName : ''),
      totalAmount: Number(values.amount),
      status: 'PAID',
      date: values.sessionDate,
      amount: Number(values.amount),
      sessionDuration: Number(values.sessionDuration),
    };
    try {
      await billingService.addBill(newBill);
      setSuccess(true);
      resetForm();
      const updatedBills = await billingService.getAllBills();
      setBills(updatedBills);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setError('Failed to add bill');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!selectedBill) return;

    const element = document.getElementById('print-bill');
    const opt = {
      margin: 1,
      filename: `bill-${selectedBill.patientName}-${selectedBill.sessionDate}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  // Handle bills search
  const handleBillsSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillsSearch(e.target.value);
  };

  // Get filtered bills data with search
  const getFilteredBillsData = () => {
    let filteredBills = bills;

    // Apply bills search
    if (billsSearch.trim()) {
      const searchLower = billsSearch.toLowerCase();
      filteredBills = filteredBills.filter(bill => 
        bill.patientName?.toLowerCase().includes(searchLower) ||
        bill.sessionDate?.includes(billsSearch) ||
        bill.status?.toLowerCase().includes(searchLower) ||
        bill.totalAmount?.toString().includes(billsSearch) ||
        bill.sessionDuration?.toString().includes(billsSearch)
      );
    }

    return filteredBills;
  };

  // Handle edit
  const handleEdit = (id: string | number) => {
    const billToEdit = bills.find(b => b.id === id);
    if (billToEdit) {
      setEditingData(billToEdit);
      setShowEditModal(true);
    }
  };

  // Handle delete
  const handleDelete = async (id: string | number) => {
    const billToDelete = bills.find(b => b.id === id);
    const billName = billToDelete ? billToDelete.patientName : 'this bill';

    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${billName}? This action cannot be undone.`
    );

    if (!isConfirmed) {
      return;
    }

    try {
      await billingService.softDeleteBill(id);
      // Remove from local state
      setBills(prevBills => prevBills.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error deleting bill:', err);
      setError('Failed to delete bill. Please try again.');
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (values: any) => {
    if (!editingData) return;
    
    setEditLoading(true);
    try {
      const updatedBill = await billingService.updateBill(editingData.id!, {
        patientName: values.patientName,
        sessionDate: values.sessionDate,
        sessionDuration: values.sessionDuration,
        totalAmount: values.totalAmount,
        status: values.status,
        description: values.description,
      });
      
      // Update local state
      setBills(prevBills => 
        prevBills.map(b => b.id === editingData.id ? updatedBill : b)
      );
      
      setShowEditModal(false);
      setEditingData(null);
    } catch (error) {
      console.error('Error updating bill:', error);
      throw error;
    } finally {
      setEditLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingData(null);
    setEditLoading(false);
  };

  const renderPagination = (currentPage: number, totalPages: number, setPage: (page: number) => void, rowsPerPage: number, setRowsPerPage: (n: number) => void) => {
    const pageWindow = 2;
    let start = Math.max(1, currentPage - pageWindow);
    let end = Math.min(totalPages, currentPage + pageWindow);
    if (end - start < 4) {
      if (start === 1) end = Math.min(totalPages, start + 4);
      if (end === totalPages) start = Math.max(1, end - 4);
    }
    const pageNumbers = [];
    for (let i = start; i <= end; i++) pageNumbers.push(i);
    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Rows per page:
          <select
            value={rowsPerPage}
            onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
            style={{ margin: '0 8px', padding: '2px 8px', borderRadius: 4 }}
          >
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          Page {currentPage} of {totalPages}
        </div>
        <div className="pagination-controls">
          <button className="pagination-btn" onClick={() => setPage(1)} disabled={currentPage === 1}>&#171; First</button>
          <button className="pagination-btn" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>&#8249; Prev</button>
          <div className="page-numbers">
            {pageNumbers.map(page => (
              <button
                key={page}
                className={`page-number${page === currentPage ? ' active' : ''}`}
                onClick={() => setPage(page)}
                disabled={page === currentPage}
              >
                {page}
              </button>
            ))}
          </div>
          <button className="pagination-btn" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>Next &#8250;</button>
          <button className="pagination-btn" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>Last &#187;</button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="Billing" subtitle="Manage and view patient billing records" />
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Body>
                {success && (
                  <div className="alert alert-success">
                    Bill added successfully!
                  </div>
                )}
                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <Row>
                        <Col md={6} className="mb-3">
                          <SelectField
                            label="Patient"
                            name="patientId"
                            options={patients.map(p => ({
                              label: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
                              value: p.id?.toString() || ''
                            }))}
                            placeholder="Select Patient"
                            required
                          />
                        </Col>
                        <Col md={6} className="mb-3">
                          <DateField
                            label="Session Date"
                            name="sessionDate"
                            required
                          />
                        </Col>
                        <Col md={6} className="mb-3">
                          <InputField
                            label="Session Duration (hours)"
                            name="sessionDuration"
                            type="number"
                            required
                          />
                        </Col>
                        <Col md={6} className="mb-3">
                          <InputField
                            label="Amount"
                            name="amount"
                            type="number"
                            required
                          />
                        </Col>
                        <Col md={12}>
                          <ButtonWithGradient
                            type="submit"
                            disabled={isSubmitting}
                            text={isSubmitting ? 'Adding...' : 'Add Bill'}
                          />
                        </Col>
                      </Row>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <div className="table-container" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div className='dashboard-table-heading'>
            Recent Bills: {getFilteredBillsData().length}
            <div className="dashboard-table-search">
              <Searchbar 
                value={billsSearch}
                onChange={handleBillsSearch}
              />
            </div>
          </div>
          <Table
            columns={[
              { key: 'patientName', header: 'Patient' },
              { key: 'sessionDate', header: 'Date' },
              { key: 'sessionDuration', header: 'Duration' },
              { key: 'totalAmount', header: 'Amount' },
              { key: 'status', header: 'Status' },
              { key: 'actions', header: 'Actions' },
            ]}
            data={getFilteredBillsData().map(b => ({
              id: b.id,
              patientName: b.patientName,
              sessionDate: b.sessionDate,
              sessionDuration: b.sessionDuration ? `${b.sessionDuration} minutes` : '-',
              totalAmount: b.totalAmount ? `₹${b.totalAmount}` : '-',
              status: (
                <span className={`status-badge ${
                  b.status === 'PAID' ? 'active' :
                  b.status === 'PENDING' || b.status === 'UNPAID' ? 'scheduled' :
                  b.status === 'CANCELLED' || b.status === 'OVERDUE' ? 'inactive' :
                  'scheduled'
                }`}>
                  {b.status}
                </span>
              ),
              actions: (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <EditButton onClick={() => handleEdit(b.id!)} />
                  <DeleteButton onClick={() => handleDelete(b.id!)} />
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setSelectedBill(b);
                      setShowPrintModal(true);
                    }}
                  >
                    View Bill
                  </Button>
                </div>
              ),
            }))}
          />
        </div>
        {showPrintModal && selectedBill && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Bill Details</h5>
                  <button type="button" className="btn-close" onClick={() => setShowPrintModal(false)}></button>
                </div>
                <div className="modal-body" id="print-bill">
                  <div className="bill-header">
                    <h3>Dialysis Center</h3>
                    <p>Bill Receipt</p>
                  </div>
                  <div className="bill-details">
                    <p><strong>Patient:</strong> {selectedBill.patientName}</p>
                    <p><strong>Date:</strong> {selectedBill.sessionDate}</p>
                    <p><strong>Duration:</strong> {selectedBill.sessionDuration} minutes</p>
                    <p><strong>Amount:</strong> ₹{selectedBill.totalAmount}</p>
                    <p><strong>Status:</strong> 
                      <span className={`status-badge ${
                        selectedBill.status === 'PAID' ? 'active' :
                        selectedBill.status === 'PENDING' || selectedBill.status === 'UNPAID' ? 'scheduled' :
                        selectedBill.status === 'CANCELLED' || selectedBill.status === 'OVERDUE' ? 'inactive' :
                        'scheduled'
                      }`}>
                        {selectedBill.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="modal-footer">
                  <Button variant="secondary" onClick={() => setShowPrintModal(false)}>
                    Close
                  </Button>
                  <Button variant="primary" onClick={handlePrint}>
                    Print
                  </Button>
                  <Button variant="success" onClick={handleDownloadPDF}>
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        <EditModal
          show={showEditModal}
          onHide={handleCloseEditModal}
          data={editingData}
          formConfig={billingFormConfig}
          onSubmit={handleEditSubmit}
          loading={editLoading}
          editingDataType="billing"
        />
      </PageContainer>
      <Footer />
    </>
  );
};

export default Billing; 