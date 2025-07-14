import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import type { FormikHelpers } from 'formik';
import * as Yup from 'yup';
import html2pdf from 'html2pdf.js';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
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
import { useDataLoader } from '../hooks/useDataLoader';

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

const BillingEnhanced: React.FC = () => {
    const { patients } = useDialysis();
    const [selectedBill, setSelectedBill] = useState<BillingType | null>(null);
    const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // Edit modal state
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [editingData, setEditingData] = useState<BillingType | null>(null);
    const [editLoading, setEditLoading] = useState<boolean>(false);

    // Service instance
    const billingService = billingServiceFactory.getService();

    // Enhanced data loading with caching
    const {
        data: bills,
        loading: billsLoading,
        error: billsError,
        refresh: refreshBills
    } = useDataLoader<BillingType>({
        resource: 'billing',
        cacheKey: 'dialysis_billing',
        autoRefresh: false
    });

    // Pagination state for bills
    const [billsPage, setBillsPage] = useState(1);
    const [billsRowsPerPage, setBillsRowsPerPage] = useState(10);
    const billsTotalPages = Math.ceil(bills.length / billsRowsPerPage);
    const paginatedBills = bills.slice((billsPage - 1) * billsRowsPerPage, billsPage * billsRowsPerPage);

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
            // Refresh data after adding
            await refreshBills();
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
    const [billsSearch, setBillsSearch] = useState<string>('');
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
            // Refresh data after deleting
            await refreshBills();
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
            await billingService.updateBill(editingData.id!, {
                patientName: values.patientName,
                sessionDate: values.sessionDate,
                sessionDuration: values.sessionDuration,
                totalAmount: values.totalAmount,
                status: values.status,
                description: values.description,
            });

            // Refresh data after updating
            await refreshBills();
            setShowEditModal(false);
            setEditingData(null);
        } catch (err) {
            console.error('Error updating bill:', err);
            setError('Failed to update bill. Please try again.');
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
        return (
            <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="d-flex align-items-center">
                    <span className="me-2">Rows per page:</span>
                    <select
                        value={rowsPerPage}
                        onChange={(e) => setRowsPerPage(Number(e.target.value))}
                        className="form-select form-select-sm"
                        style={{ width: 'auto' }}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                <div className="d-flex align-items-center">
                    <button
                        onClick={() => setPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="btn btn-outline-secondary btn-sm me-2"
                    >
                        Previous
                    </button>
                    <span className="mx-2">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="btn btn-outline-secondary btn-sm ms-2"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    // Show loading state
    if (billsLoading && bills.length === 0) {
        return (
            <PageContainer>
                <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                    <div className="text-center">
                        <Spinner animation="border" role="status" className="mb-3">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                        <p>Loading billing data...</p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    // Show error state
    if (billsError && bills.length === 0) {
        return (
            <PageContainer>
                <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                    <div className="text-center">
                        <Alert variant="danger">
                            <h4>Error Loading Data</h4>
                            <p>{billsError}</p>
                            <Button onClick={refreshBills} variant="outline-danger">
                                Retry
                            </Button>
                        </Alert>
                    </div>
                </div>
            </PageContainer>
        );
    }

    const filteredBills = getFilteredBillsData();
    const paginatedFilteredBills = filteredBills.slice((billsPage - 1) * billsRowsPerPage, billsPage * billsRowsPerPage);

    return (
        <PageContainer>
            <Header />
            <Container fluid className="billing-container">
                <Row>
                    <Col>
                        <SectionHeading title="Billing Management" subtitle="Manage patient billing and payments" />

                        {success && (
                            <Alert variant="success" onClose={() => setSuccess(false)} dismissible>
                                Bill added successfully!
                            </Alert>
                        )}

                        {error && (
                            <Alert variant="danger" onClose={() => setError('')} dismissible>
                                {error}
                            </Alert>
                        )}

                        <Row>
                            <Col md={4}>
                                <Card className="billing-form-card">
                                    <Card.Header>
                                        <h5>Add New Bill</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Formik
                                            initialValues={initialValues}
                                            validationSchema={validationSchema}
                                            onSubmit={handleSubmit}
                                        >
                                            {({ isSubmitting }) => (
                                                <Form>
                                                    <SelectField
                                                        name="patientId"
                                                        label="Patient"
                                                        options={patients.map(p => ({
                                                            value: p.id || '',
                                                            label: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim()
                                                        }))}
                                                        placeholder="Select a patient"
                                                    />
                                                    <DateField
                                                        name="sessionDate"
                                                        label="Session Date"
                                                    />
                                                    <InputField
                                                        name="sessionDuration"
                                                        label="Session Duration (hours)"
                                                        type="number"
                                                        placeholder="Enter duration"
                                                    />
                                                    <InputField
                                                        name="amount"
                                                        label="Amount"
                                                        type="number"
                                                        placeholder="Enter amount"
                                                    />
                                                    <ButtonWithGradient
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="w-100"
                                                    >
                                                        {isSubmitting ? 'Adding...' : 'Add Bill'}
                                                    </ButtonWithGradient>
                                                </Form>
                                            )}
                                        </Formik>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={8}>
                                <Card>
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h5>Billing Records</h5>
                                        <div className="d-flex align-items-center">
                                            {billsLoading && <Spinner animation="border" size="sm" className="me-2" />}
                                            <Button variant="outline-secondary" size="sm" onClick={refreshBills}>
                                                Refresh
                                            </Button>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <Searchbar
                                            value={billsSearch}
                                            onChange={handleBillsSearch}
                                        />

                                        <Table
                                            data={paginatedFilteredBills}
                                            columns={[
                                                { key: 'patientName', header: 'Patient Name' },
                                                { key: 'sessionDate', header: 'Session Date' },
                                                { key: 'sessionDuration', header: 'Duration (hrs)' },
                                                { key: 'totalAmount', header: 'Amount' },
                                                { key: 'status', header: 'Status' }
                                            ]}
                                        />

                                        {renderPagination(billsPage, billsTotalPages, setBillsPage, billsRowsPerPage, setBillsRowsPerPage)}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>

            <EditModal
                show={showEditModal}
                onHide={handleCloseEditModal}
                title="Edit Bill"
                data={editingData}
                onSubmit={handleEditSubmit}
                loading={editLoading}
                formConfig={billingFormConfig}
            />

            <Footer />
        </PageContainer>
    );
};

export default BillingEnhanced; 