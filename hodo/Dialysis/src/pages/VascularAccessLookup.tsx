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

export const AccessTypesContext = createContext<{
  accesses: any[];
  setAccesses: React.Dispatch<React.SetStateAction<any[]>>;
} | undefined>(undefined);

export const useAccessTypes = () => {
  const ctx = useContext(AccessTypesContext);
  if (!ctx) throw new Error('useAccessTypes must be used within AccessTypesProvider');
  return ctx;
};

export const AccessTypesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accesses, setAccesses] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API_URL}/data/vascular_access`).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setAccesses(data);
    });
  }, []);
  return (
    <AccessTypesContext.Provider value={{ accesses, setAccesses }}>
      {children}
    </AccessTypesContext.Provider>
  );
};

const VascularAccessLookup: React.FC<{ sidebarCollapsed?: boolean; toggleSidebar?: () => void }> = ({ sidebarCollapsed = false, toggleSidebar = () => {} }) => {
  const { accesses, setAccesses } = useAccessTypes();
  const [form, setForm] = useState({ VAL_Access_Type: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetch(`${API_URL}/data/vascular_access`).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setAccesses(data);
    });
  }, [setAccesses]);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!form.VAL_Access_Type) errs.VAL_Access_Type = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (editId !== null) {
      // Update
      const updated = { ...form, VAL_Access_ID_PK: editId };
      await fetch(`${API_URL}/data/vascular_access`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } else {
      // Create
      await fetch(`${API_URL}/data/vascular_access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    // Refresh
    fetch(`${API_URL}/data/vascular_access`).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setAccesses(data);
    });
    setEditId(null);
    setForm({ VAL_Access_Type: '' });
    setErrors({});
  };

  const handleEdit = (access: any) => {
    setEditId(access.VAL_Access_ID_PK);
    setForm({ VAL_Access_Type: access.VAL_Access_Type });
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API_URL}/data/vascular_access/${id}`, { method: 'DELETE' });
    fetch(`${API_URL}/data/vascular_access`).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setAccesses(data);
    });
    if (editId === id) {
      setEditId(null);
      setForm({ VAL_Access_Type: '' });
    }
  };

  const handleReset = () => {
    setForm({ VAL_Access_Type: '' });
    setErrors({});
    setEditId(null);
  };

  const columns = [
    { key: 'VAL_Access_Type', header: 'Access Type' },
    { key: 'actions', header: 'Actions' },
  ];

  const tableData = accesses.map((access) => ({
    ...access,
    actions: (
      <>
        <EditButton onClick={() => handleEdit(access)} />
        <DeleteButton onClick={() => handleDelete(access.VAL_Access_ID_PK)} />
      </>
    ),
  }));

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="Vascular Access Lookup" subtitle="Vascular Access Lookup" />
        <div style={{ minWidth: 350, maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 24, marginTop: 32 }}>
          <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div className="form-group">
              <label>Access Type *</label>
              <input
                type="text"
                name="VAL_Access_Type"
                value={form.VAL_Access_Type}
                onChange={handleChange}
                className="form-control"
              />
              {errors.VAL_Access_Type && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.VAL_Access_Type}</div>}
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

export default VascularAccessLookup; 