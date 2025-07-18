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

const UnitsManagement: React.FC<{ sidebarCollapsed?: boolean; toggleSidebar?: () => void }> = ({ sidebarCollapsed = false, toggleSidebar = () => {} }) => {
  const { units, setUnits } = useUnits();
  const [form, setForm] = useState({
    Unit_Name: '',
    Unit_Status: '',
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
    if (!form.Unit_Status) errs.Unit_Status = 'Required';
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
      const updated = { ...form, Unit_ID_PK: editId };
      await fetch(`${API_URL}/data/units`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
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
      Unit_Status: '',
      Unit_Planned_Maintainance_DT: '',
      Unit_Technitian_Assigned: '',
    });
    setErrors({});
  };

  const handleEdit = (unit: any) => {
    setEditId(unit.Unit_ID_PK);
    setForm({
      Unit_Name: unit.Unit_Name,
      Unit_Status: unit.Unit_Status,
      Unit_Planned_Maintainance_DT: unit.Unit_Planned_Maintainance_DT,
      Unit_Technitian_Assigned: unit.Unit_Technitian_Assigned,
    });
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API_URL}/data/units/${id}`, { method: 'DELETE' });
    fetch(`${API_URL}/data/units`).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setUnits(data);
    });
    if (editId === id) {
      setEditId(null);
      setForm({
        Unit_Name: '',
        Unit_Status: '',
        Unit_Planned_Maintainance_DT: '',
        Unit_Technitian_Assigned: '',
      });
    }
  };

  const handleReset = () => {
    setForm({
      Unit_Name: '',
      Unit_Status: '',
      Unit_Planned_Maintainance_DT: '',
      Unit_Technitian_Assigned: '',
    });
    setErrors({});
    setEditId(null);
  };

  const columns = [
    { key: 'Unit_Name', header: 'Unit Name' },
    { key: 'Unit_Status', header: 'Unit Status' },
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
        <div style={{ minWidth: 350, maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 24, marginTop: 32 }}>
          <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div className="form-group">
              <label>Unit Name *</label>
              <input
                type="text"
                name="Unit_Name"
                value={form.Unit_Name}
                onChange={handleChange}
                className="form-control"
              />
              {errors.Unit_Name && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.Unit_Name}</div>}
            </div>
            <div className="form-group">
              <label>Unit Status *</label>
              <select
                name="Unit_Status"
                value={form.Unit_Status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select status</option>
                {unitStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              {errors.Unit_Status && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.Unit_Status}</div>}
            </div>
            <div className="form-group">
              <label>Planned Maintainance *</label>
              <input
                type="datetime-local"
                name="Unit_Planned_Maintainance_DT"
                value={form.Unit_Planned_Maintainance_DT}
                onChange={handleChange}
                className="form-control"
              />
              {errors.Unit_Planned_Maintainance_DT && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.Unit_Planned_Maintainance_DT}</div>}
            </div>
            <div className="form-group">
              <label>Technitian Assigned *</label>
              <input
                type="text"
                name="Unit_Technitian_Assigned"
                value={form.Unit_Technitian_Assigned}
                onChange={handleChange}
                className="form-control"
              />
              {errors.Unit_Technitian_Assigned && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.Unit_Technitian_Assigned}</div>}
            </div>
            <div style={{ textAlign: 'center', marginTop: 16, display: 'flex', justifyContent: 'center', gap: 12 }}>
              <ButtonWithGradient type="submit">
                {editId !== null ? 'Update' : 'Save'}
              </ButtonWithGradient>
              <ButtonWithGradient type="button" className="btn-outline" onClick={handleReset}>
                Reset
              </ButtonWithGradient>
            </div>
          </form>
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