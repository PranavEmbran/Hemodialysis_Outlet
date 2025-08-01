import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import Table from '../components/Table';
import ButtonWithGradient from '../components/ButtonWithGradient';
import { useNavigate } from 'react-router-dom';
import { useUnits } from './UnitsManagement';
import { useAccessTypes } from './VascularAccessLookup';
import { useDialyzerTypes } from './DialyzerTypeLookup';
import { API_URL } from '../config';
import { InputField, SelectField } from '../components/forms';

// Mock data for Scheduling_Lookup
const initialSchedulingLookup = [
  {
    id: 1,
    SL_No_of_units: 5,
    SL_Working_hrs: 15.0,
    SL_Working_days: 7,
    SL_Pre_dialysis_time: 1.0 ,
    SL_Dialysis_Session_Time: 5.0,
  },
  // {
  //   id: 2,
  //   SL_No_of_units: 3,
  //   SL_Working_hrs: 7.0,
  //   SL_Working_days: 5,
  //   SL_Pre_dialysis_time: 0.75,
  //   // TEST: 'Test',
  // },
];

const rowLabels = [
  { key: 'SL_No_of_units', label: 'No. of Units' },
  { key: 'SL_Working_hrs', label: 'Working Hours' },
  { key: 'SL_Working_days', label: 'Working Days' },
  { key: 'SL_Pre_dialysis_time', label: 'Pre-Dialysis Time' },
  { key: 'SL_Dialysis_Session_Time', label: 'Dialysis Session Time' },
  // { key: 'TEST', label: 'TEST' },
];

const initialUnits = [
  {
    Unit_ID_PK: 1,
    Unit_Name: 'Unit A',
    Unit_Status: 'Free',
    Unit_Planned_Maintainance_DT: '',
    Unit_Technitian_Assigned: 'John Doe',
  },
];

const unitStatusOptions = [
  { value: 'Free', label: 'Free' },
  { value: 'Engaged', label: 'Engaged' },
  { value: 'Out_of_service', label: 'Out of Service' },
];

const UnitsManager: React.FC = () => {
  const [units, setUnits] = useState(initialUnits);
  const [form, setForm] = useState({
    Unit_Name: '',
    Unit_Status: '',
    Unit_Planned_Maintainance_DT: '',
    Unit_Technitian_Assigned: '',
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const handleSave = () => {
    if (!validate()) return;
    if (editId !== null) {
      setUnits((prev) => prev.map((u) => (u.Unit_ID_PK === editId ? { ...u, ...form } : u)));
      setEditId(null);
    } else {
      setUnits((prev) => [
        ...prev,
        {
          ...form,
          Unit_ID_PK: Date.now(),
        },
      ]);
    }
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

  const handleDelete = (id: number) => {
    setUnits((prev) => prev.filter((u) => u.Unit_ID_PK !== id));
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
    <div style={{ minWidth: 350, flex: 1, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 24 }}>
      <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Units Management</h3>
      <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <div className="form-group">
          <label>Unit Name *</label>
          <InputField
            label="Unit Name"
            name="Unit_Name"
            value={form.Unit_Name}
            onChange={handleChange}
            required
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
            required
          >
            <option value="">Select status</option>
            {unitStatusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.Unit_Status && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.Unit_Status}</div>}
        </div>
        <div className="form-group">
          <label>Planned Maintainance *</label>
          <InputField
            label="Planned Maintenance"
            name="Unit_Planned_Maintainance_DT"
            type="datetime-local"
            value={form.Unit_Planned_Maintainance_DT}
            onChange={handleChange}
            required
            className="form-control"
          />
          {errors.Unit_Planned_Maintainance_DT && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.Unit_Planned_Maintainance_DT}</div>}
        </div>
        <div className="form-group">
          <label>Technitian Assigned *</label>
          <InputField
            label="Technitian Assigned"
            name="Unit_Technitian_Assigned"
            value={form.Unit_Technitian_Assigned}
            onChange={handleChange}
            required
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
  );
};

const VascularAccessLookup: React.FC = () => {
  const [accesses, setAccesses] = useState([
    { VAL_Access_ID_PK: 1, VAL_Access_Type: 'Fistula' },
  ]);
  const [form, setForm] = useState({ VAL_Access_Type: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const handleSave = () => {
    if (!validate()) return;
    if (editId !== null) {
      setAccesses((prev) => prev.map((a) => (a.VAL_Access_ID_PK === editId ? { ...a, ...form } : a)));
      setEditId(null);
    } else {
      setAccesses((prev) => [
        ...prev,
        { VAL_Access_ID_PK: Date.now(), ...form },
      ]);
    }
    setForm({ VAL_Access_Type: '' });
    setErrors({});
  };

  const handleEdit = (access: any) => {
    setEditId(access.VAL_Access_ID_PK);
    setForm({ VAL_Access_Type: access.VAL_Access_Type });
  };

  const handleDelete = (id: number) => {
    setAccesses((prev) => prev.filter((a) => a.VAL_Access_ID_PK !== id));
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
    <div style={{ minWidth: 350, flex: 1, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 24 }}>
      <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Vascular Access Lookup</h3>
      <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <div className="form-group">
          <label>Access Type *</label>
          <InputField
            label="Access Type"
            name="VAL_Access_Type"
            value={form.VAL_Access_Type}
            onChange={handleChange}
            required
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
  );
};

const Schedule_Master: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const { units } = useUnits();
  const { accesses: accessTypes } = useAccessTypes();
  const { dialyzerTypes } = useDialyzerTypes();
  const [data, setData] = useState(initialSchedulingLookup);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  // Fetch scheduling_lookup from backend on mount
  React.useEffect(() => {
    fetch(`${API_URL}/data/scheduling_lookup`).then(res => res.json()).then(arr => {
      if (Array.isArray(arr) && arr.length > 0) setData(arr);
    });
  }, []);

  // Handle edit button click
  const handleEdit = (row: any) => {
    setEditRowId(row.id);
    setEditValues({ ...row });
  };

  // Handle input change in editable row
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditValues((prev: any) => ({ ...prev, [name]: value }));
  };

  // Handle save
  const handleSave = async (id: number) => {
    // Always set SL_No_of_units to units.length before saving
    const updated = { ...editValues, id, SL_No_of_units: units.length };
    await fetch(`${API_URL}/data/scheduling_lookup`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    // Refresh
    fetch(`${API_URL}/data/scheduling_lookup`).then(res => res.json()).then(arr => {
      if (Array.isArray(arr) && arr.length > 0) setData(arr);
    });
    setEditRowId(null);
    setEditValues({});
  };

  // Handle cancel
  const handleCancel = () => {
    setEditRowId(null);
    setEditValues({});
  };

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="Hemodialysis Master" subtitle="Hemodialysis Master" />
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
            {/* Scheduling Master Table (left) */}
            {/* <div style={{ flex: 1, minWidth: 350 }}> */}
            <div style={{ flex: '0 0 auto', minWidth: 350 }}>

              {data.map((row: Record<string, any>) => (
                <table key={row.id} style={{ minWidth: 320, borderCollapse: 'collapse', boxShadow: '0 2px 8px #eee', borderRadius: 8, marginBottom: 24, background: '#fff' }}>
                  <tbody>
                    <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>Scheduling Master</p>
                    {rowLabels.map(({ key, label }) => (
  <tr key={key}>
    <td style={{ fontWeight: 500, padding: '10px 16px', borderBottom: '1px solid #f0f0f0', width: 160 }}>{label}</td>
    <td style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0' }}>
      {key === 'SL_No_of_units' ? (
        <>
          {/* Always show units.length, disable editing */}
          <span style={{ fontWeight: 600 }}>{units.length}</span>
        </>
      ) : editRowId === row.id ? (
        <input
          name={key}
          value={editValues[key]}
          onChange={handleInputChange}
          type="number"
          style={{ width: 120 }}
        />
      ) : (
        row[key]
      )}
    </td>
  </tr>
))}
                    <tr>
                      <td style={{ fontWeight: 500, padding: '10px 16px', width: 160 }}>Actions</td>
                      <td style={{ padding: '10px 16px' }}>
                        {editRowId === row.id ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => handleSave(row.id)} style={{ padding: '4px 12px', borderRadius: 4, background: '#4caf50', color: '#fff', border: 'none', cursor: 'pointer' }}>Save</button>
                            <button onClick={handleCancel} style={{ padding: '4px 12px', borderRadius: 4, background: '#f44336', color: '#fff', border: 'none', cursor: 'pointer' }}>Cancel</button>
                          </div>
                        ) : (
                          <EditButton onClick={() => handleEdit(row)} />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ))}
            </div>
            {/* Cards (right, horizontal) */}
            <div style={{ minWidth: 240, display: 'flex', flexDirection: 'row', gap: 24 }}>
              <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 220 }}>
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Total Number of Units</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#000000', marginBottom: 16 }}>{units.length}</div>
                <ButtonWithGradient onClick={() => navigate('/units-management')}>
                  Go to Units Management
                </ButtonWithGradient>
              </div>
              <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 220 }}>
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Access Types</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#000000', marginBottom: 16 }}>{accessTypes.length}</div>
                <ButtonWithGradient onClick={() => navigate('/vascular-access-lookup')}>
                  Go to Vascular Access Lookup
                </ButtonWithGradient>
              </div>
              <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 220 }}>
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Dialyzer Types</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#000000', marginBottom: 16 }}>{dialyzerTypes.length}</div>
                <ButtonWithGradient onClick={() => navigate('/dialyzer-type-lookup')}>
                  Go to Dialyzer Type Lookup
                </ButtonWithGradient>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default Schedule_Master; 