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
import { InputField, SelectField, DateField } from '../components/forms';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

export const UnitsContext = createContext<{
  units: any[];
  setUnits: React.Dispatch<React.SetStateAction<any[]>>;
} | undefined>(undefined);

export const useUnits = () => {
  const ctx = useContext(UnitsContext);
  if (!ctx) throw new Error('useUnits must be used within UnitsProvider');
  return ctx;
};

export const UnitsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [units, setUnits] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API_URL}/data/units`).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setUnits(data);
    });
  }, []);
  return (
    <UnitsContext.Provider value={{ units, setUnits }}>
      {children}
    </UnitsContext.Provider>
  );
};

const unitStatusOptions = [
  { value: 'Free', label: 'Free' },
  { value: 'Engaged', label: 'Engaged' },
  { value: 'Out_of_service', label: 'Out of Service' },
];

const UnitsManagement: React.FC<{ sidebarCollapsed?: boolean; toggleSidebar?: () => void }> = ({ sidebarCollapsed = false, toggleSidebar = () => { } }) => {
  const { units, setUnits } = useUnits();
  const [form, setForm] = useState({
    Unit_Name: '',
    Unit_Availability_Status: '',
    Unit_Planned_Maintainance_DT: '',
    Unit_Technitian_Assigned: '',
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetch(`${API_URL}/data/units`).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setUnits(data);
    });
  }, [setUnits]);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!form.Unit_Name) errs.Unit_Name = 'Required';
    if (!form.Unit_Availability_Status) errs.Unit_Availability_Status = 'Required';
    if (!form.Unit_Planned_Maintainance_DT) errs.Unit_Planned_Maintainance_DT = 'Required';
    if (!form.Unit_Technitian_Assigned) errs.Unit_Technitian_Assigned = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (editId !== null) {
      // Update
      const updated = { ...form, Unit_ID_PK: Number(editId), Unit_Availability_Status: String(form.Unit_Availability_Status) };
      await fetch(`${API_URL}/data/units`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      handleReset();
    } else {
      // Create
      await fetch(`${API_URL}/data/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    // Refresh
    fetch(`${API_URL}/data/units`).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setUnits(data);
    });
    setEditId(null);
    setForm({
      Unit_Name: '',
      Unit_Availability_Status: '',
      Unit_Planned_Maintainance_DT: '',
      Unit_Technitian_Assigned: '',
    });
    setErrors({});
  };

  const handleEdit = (unit: any) => {
    setEditId(unit.Unit_ID_PK);
    setForm({
      Unit_Name: unit.Unit_Name,
      Unit_Availability_Status: unit.Unit_Availability_Status || '',
      Unit_Planned_Maintainance_DT: unit.Unit_Planned_Maintainance_DT || '',
      Unit_Technitian_Assigned: unit.Unit_Technitian_Assigned || '',
    });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this unit? This action cannot be undone.');
    if (!confirmed) return;
    await fetch(`${API_URL}/data/units/${id}`, { method: 'DELETE' });
    fetch(`${API_URL}/data/units`).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setUnits(data);
    });
    if (editId === id) {
      setEditId(null);
      setForm({
        Unit_Name: '',
        Unit_Availability_Status: '',
        Unit_Planned_Maintainance_DT: '',
        Unit_Technitian_Assigned: '',
      });
    }
  };

  const handleReset = (resetFormikForm?: () => void) => {
    setForm({
      Unit_Name: '',
      Unit_Availability_Status: '',
      Unit_Planned_Maintainance_DT: '',
      Unit_Technitian_Assigned: '',
    });
    setErrors({});
    setEditId(null);
    if (resetFormikForm) resetFormikForm();
  }

  const columns = [
    { key: 'Unit_ID_PK', header: 'Unit ID' },
    { key: 'Unit_Name', header: 'Unit Name' },
    { key: 'Unit_Availability_Status', header: 'Unit Status' },
    { key: 'Unit_Planned_Maintainance_DT', header: 'Planned Maintainance' },
    { key: 'Unit_Technitian_Assigned', header: 'Technitian Assigned' },
    { key: 'actions', header: 'Actions' },
  ];

  const tableData = units.map((unit) => ({
    ...unit,
    actions: (
      <>
        <EditButton onClick={() => handleEdit(unit)} />
        <DeleteButton onClick={() => handleDelete(unit.Unit_ID_PK)} />
      </>
    ),
  }));

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="Units Management" subtitle="Units Management" />
        <div style={{ minWidth: 350, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 24, marginTop: 32 }}>
          <Formik
            initialValues={form}
            enableReinitialize
            validationSchema={Yup.object({
              Unit_Name: Yup.string().required('Unit Name is required'),
              Unit_Availability_Status: Yup.string().required('Unit Status is required'),
              Unit_Planned_Maintainance_DT: Yup.string().required('Planned Maintenance is required'),
              Unit_Technitian_Assigned: Yup.string().required('Technitian Assigned is required'),
            })}
            onSubmit={async (values, { resetForm }) => {
              if (editId !== null) {
                // Update
                const updated = { ...values, Unit_ID_PK: Number(editId), Unit_Availability_Status: String(values.Unit_Availability_Status) };
                await fetch(`${API_URL}/data/units`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updated),
                });
                handleReset(resetForm);
              } else {
                // Create
                await fetch(`${API_URL}/data/units`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(values),
                });
              }
              fetch(`${API_URL}/data/units`).then(res => res.json()).then(data => {
                if (Array.isArray(data)) setUnits(data);
              });
              setEditId(null);
              resetForm();
            }}
          >
            {({ resetForm, setValues, values }) => (
              <Form>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <InputField
                    label="Unit Name"
                    name="Unit_Name"
                    required
                    placeholder="Enter unit name"
                    // className="form-control"
                    className=""
                    id="unit-name"
                  />
                  <SelectField
                    label="Unit Status"
                    name="Unit_Availability_Status"
                    options={unitStatusOptions}
                    required
                    placeholder="Select status"
                    // className="form-select"
                    className=""
                    id="unit-status"
                  />
                  <DateField
                    label="Planned Maintenance"
                    name="Unit_Planned_Maintainance_DT"
                    required
                    // className="form-control"
                    className=""
                    id="unit-maintenance"
                  />
                  <InputField
                    label="Technitian Assigned"
                    name="Unit_Technitian_Assigned"
                    required
                    placeholder="Enter technitian name"
                    // className="form-control"
                    className=""
                    id="unit-technitian"
                  />
                  <div style={{ textAlign: 'center', marginTop: 16, display: 'flex', justifyContent: 'left', gap: 12 }}>
                    <ButtonWithGradient type="button" className="btn-outline redButton" onClick={() => handleReset(resetForm)}>
                      Reset
                    </ButtonWithGradient>
                    <ButtonWithGradient type="submit">
                      {editId !== null ? 'Update' : 'Save'}
                    </ButtonWithGradient>
                  </div>
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

export default UnitsManagement; 