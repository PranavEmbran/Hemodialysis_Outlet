import React, { useState, useEffect, createContext, useContext } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import Table from '../components/Table';
import ButtonWithGradient from '../components/ButtonWithGradient';
import { API_URL } from '../config';
import { toast } from 'react-toastify';
import { InputField } from '../components/forms';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

export const SessionTimesContext = createContext<{
    sessionTimes: any[];
    setSessionTimes: React.Dispatch<React.SetStateAction<any[]>>;
} | undefined>(undefined);

export const useSessionTimes = () => {
    const ctx = useContext(SessionTimesContext);
    if (!ctx) throw new Error('useSessionTimes must be used within SessionTimesProvider');
    return ctx;
};

export const SessionTimesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sessionTimes, setSessionTimes] = useState<any[]>([]);
    useEffect(() => {
        fetch(`${API_URL}/data/session_times`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setSessionTimes(data);
            });
    }, []);
    return (
        <SessionTimesContext.Provider value={{ sessionTimes, setSessionTimes }}>
            {children}
        </SessionTimesContext.Provider>
    );
};

const SessionTimesLookup: React.FC<{ sidebarCollapsed?: boolean; toggleSidebar?: () => void }> = ({ sidebarCollapsed = false, toggleSidebar = () => { } }) => {
    const { sessionTimes, setSessionTimes } = useSessionTimes();
    const [editId, setEditId] = useState<number | null>(null);

    const initialFormValues = {
        ST_Session_Name: editId !== null
            ? sessionTimes.find(st => st.ST_ID_PK === editId)?.ST_Session_Name || ''
            : '',
        ST_Start_Time: editId !== null
            ? sessionTimes.find(st => st.ST_ID_PK === editId)?.ST_Start_Time || ''
            : '',
    };

    const handleSave = async (values: any, resetForm: () => void) => {
        try {
            if (editId !== null) {
                // Update
                const updated = { ...values, ST_ID_PK: editId };
                const res = await fetch(`${API_URL}/data/session_times`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updated),
                });
                if (!res.ok) throw new Error('Failed to update');
                toast.success('Session time updated successfully!');
            } else {
                // Create
                const res = await fetch(`${API_URL}/data/session_times`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw new Error('Failed to save');
                toast.success('Session time saved successfully!');
            }

            // Refresh table
            const data = await fetch(`${API_URL}/data/session_times`).then(res => res.json());
            if (Array.isArray(data)) setSessionTimes(data);

            setEditId(null);
            resetForm();
        } catch (err) {
            toast.error('Failed to save/update session time!');
        }
    };

    const handleEdit = (sessionTime: any) => {
        setEditId(sessionTime.ST_ID_PK);
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`${API_URL}/data/session_times/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete');
            const data = await fetch(`${API_URL}/data/session_times`).then(res => res.json());
            if (Array.isArray(data)) setSessionTimes(data);

            if (editId === id) {
                setEditId(null);
            }

            toast.success('Session time deleted successfully!');
        } catch (err) {
            toast.error('Failed to delete session time!');
        }
    };

    const columns = [
        { key: 'ST_Session_Name', header: 'Session Name' },
        { key: 'ST_Start_Time', header: 'Start Time' },
        { key: 'actions', header: 'Actions' },
    ];

    const tableData = sessionTimes.map(sessionTime => ({
        ...sessionTime,
        actions: (
            <>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <EditButton onClick={() => handleEdit(sessionTime)} />
                <DeleteButton onClick={() => handleDelete(sessionTime.ST_ID_PK)} />
            </div>
            </>
        ),
    }));

    return (
        <>
            <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
            <PageContainer>
                <SectionHeading title="Session Times Lookup" subtitle="Session Times Lookup" />
                <div style={{ minWidth: 350, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 24, marginTop: 32 }}>
                    <Formik
                        key={editId ?? 'new'} // reinit when editId changes
                        initialValues={initialFormValues}
                        enableReinitialize
                        validationSchema={Yup.object({
                            ST_Session_Name: Yup.string().required('Session Name is required'),
                            ST_Start_Time: Yup.string().required('Start Time is required'),
                        })}
                        onSubmit={(values, { resetForm }) => handleSave(values, resetForm)}
                    >
                        {({ resetForm }) => (
                            <Form>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <InputField
                                        label="Session Name"
                                        name="ST_Session_Name"
                                        required
                                        placeholder="Enter session name (e.g., 1st, 2nd, 3rd)"
                                        id="session-name"
                                    />
                                    <InputField
                                        label="Start Time"
                                        name="ST_Start_Time"
                                        type="time"
                                        required
                                        placeholder="Enter start time"
                                        id="start-time"
                                    />
                                </div>
                                <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                                    <ButtonWithGradient type="button" className="btn-outline redButton" onClick={() => {
                                        resetForm();
                                        setEditId(null);
                                    }}>
                                        Reset
                                    </ButtonWithGradient>
                                    <ButtonWithGradient type="submit">
                                        {editId !== null ? 'Update' : 'Save'}
                                    </ButtonWithGradient>
                                </div>
                            </Form>
                        )}
                    </Formik>

                    <div style={{ marginTop: 32 }}>
                        <Table columns={columns} data={tableData} />
                    </div>
                </div>
            </PageContainer>
            <Footer />
        </>
    );
};

export default SessionTimesLookup;