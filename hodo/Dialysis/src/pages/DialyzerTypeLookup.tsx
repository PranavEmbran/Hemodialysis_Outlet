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
import { InputField } from '../components/forms';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

export const DialyzerTypeContext = createContext<{
  dialyzerTypes: any[];
  setDialyzerTypes: React.Dispatch<React.SetStateAction<any[]>>;
} | undefined>(undefined);

export const useDialyzerTypes = () => {
  const ctx = useContext(DialyzerTypeContext);
  if (!ctx) throw new Error('useDialyzerTypes must be used within DialyzerTypeProvider');
  return ctx;
};

export const DialyzerTypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialyzerTypes, setDialyzerTypes] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API_URL}/data/dialyzer_types`).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setDialyzerTypes(data);
    });
  }, []);
  return (
    <DialyzerTypeContext.Provider value={{ dialyzerTypes, setDialyzerTypes }}>
      {children}
    </DialyzerTypeContext.Provider>
  );
};

const DialyzerTypeLookup: React.FC<{ sidebarCollapsed?: boolean; toggleSidebar?: () => void }> = ({ sidebarCollapsed = false, toggleSidebar = () => {} }) => {
  const { dialyzerTypes, setDialyzerTypes } = useDialyzerTypes();
  const [form, setForm] = useState({
    DTL_Dialyzer_Name: '',
    DTL_Membrane_Type: '',
    DTL_Flux_Type: '',
    DTL_Surface_Area: '',
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetch(`${API_URL}/data/dialyzer_types`).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setDialyzerTypes(data);
    });
  }, [setDialyzerTypes]);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!form.DTL_Dialyzer_Name) errs.DTL_Dialyzer_Name = 'Required';
    if (!form.DTL_Membrane_Type) errs.DTL_Membrane_Type = 'Required';
    if (!form.DTL_Flux_Type) errs.DTL_Flux_Type = 'Required';
    if (!form.DTL_Surface_Area || isNaN(Number(form.DTL_Surface_Area))) errs.DTL_Surface_Area = 'Required';
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
      const updated = { ...form, DTL_ID_PK: editId, DTL_Surface_Area: Number(form.DTL_Surface_Area) };
      await fetch(`${API_URL}/data/dialyzer_types`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } else {
      // Create
      await fetch(`${API_URL}/data/dialyzer_types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, DTL_Surface_Area: Number(form.DTL_Surface_Area) }),
      });
    }
    // Refresh
    fetch(`${API_URL}/data/dialyzer_types`).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setDialyzerTypes(data);
    });
    setEditId(null);
    setForm({ DTL_Dialyzer_Name: '', DTL_Membrane_Type: '', DTL_Flux_Type: '', DTL_Surface_Area: '' });
    setErrors({});
  };

  const handleEdit = (dialyzer: any) => {
    setEditId(dialyzer.DTL_ID_PK);
    setForm({
      DTL_Dialyzer_Name: dialyzer.DTL_Dialyzer_Name,
      DTL_Membrane_Type: dialyzer.DTL_Membrane_Type,
      DTL_Flux_Type: dialyzer.DTL_Flux_Type,
      DTL_Surface_Area: dialyzer.DTL_Surface_Area.toString(),
    });
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API_URL}/data/dialyzer_types/${id}`, { method: 'DELETE' });
    fetch(`${API_URL}/data/dialyzer_types`).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setDialyzerTypes(data);
    });
    if (editId === id) {
      setEditId(null);
      setForm({ DTL_Dialyzer_Name: '', DTL_Membrane_Type: '', DTL_Flux_Type: '', DTL_Surface_Area: '' });
    }
  };

  const handleReset = () => {
    setForm({ DTL_Dialyzer_Name: '', DTL_Membrane_Type: '', DTL_Flux_Type: '', DTL_Surface_Area: '' });
    setErrors({});
    setEditId(null);
  };

  const columns = [
    { key: 'DTL_Dialyzer_Name', header: 'Dialyzer Name' },
    { key: 'DTL_Membrane_Type', header: 'Membrane Type' },
    { key: 'DTL_Flux_Type', header: 'Flux Type' },
    { key: 'DTL_Surface_Area', header: 'Surface Area' },
    { key: 'actions', header: 'Actions' },
  ];

  const tableData = dialyzerTypes.map((dialyzer) => ({
    ...dialyzer,
    actions: (
      <>
        <EditButton onClick={() => handleEdit(dialyzer)} />
        <DeleteButton onClick={() => handleDelete(dialyzer.DTL_ID_PK)} />
      </>
    ),
  }));

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <PageContainer>
        <SectionHeading title="Dialyzer Type Lookup" subtitle="Dialyzer Type Lookup" />
        <div style={{ minWidth: 350, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 24, marginTop: 32 }}>
          <Formik
            initialValues={form}
            enableReinitialize
            validationSchema={Yup.object({
              DTL_Dialyzer_Name: Yup.string().required('Dialyzer Name is required'),
              DTL_Membrane_Type: Yup.string().required('Membrane Type is required'),
              DTL_Flux_Type: Yup.string().required('Flux Type is required'),
              DTL_Surface_Area: Yup.number().typeError('Surface Area must be a number').required('Surface Area is required'),
            })}
            onSubmit={async (values, { resetForm }) => {
              if (editId !== null) {
                // Update
                const updated = { ...values, DTL_ID_PK: editId, DTL_Surface_Area: Number(values.DTL_Surface_Area) };
                await fetch(`${API_URL}/data/dialyzer_types`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updated),
                });
              } else {
                // Create
                await fetch(`${API_URL}/data/dialyzer_types`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...values, DTL_Surface_Area: Number(values.DTL_Surface_Area) }),
                });
              }
              fetch(`${API_URL}/data/dialyzer_types`).then(res => res.json()).then(data => {
                if (Array.isArray(data)) setDialyzerTypes(data);
              });
              setEditId(null);
              resetForm();
            }}
          >
            {({ resetForm }) => (
              <Form>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <InputField
                    label="Dialyzer Name"
                    name="DTL_Dialyzer_Name"
                    required
                    placeholder="Enter dialyzer name"
                    // className="form-control"
                    className=""
                    id="dialyzer-name"
                  />
                  <InputField
                    label="Membrane Type"
                    name="DTL_Membrane_Type"
                    required
                    placeholder="Enter membrane type"
                    // className="form-control"
                    className=""
                    id="membrane-type"
                  />
                  <InputField
                    label="Flux Type"
                    name="DTL_Flux_Type"
                    required
                    placeholder="Enter flux type"
                    // className="form-control"
                    className=""
                    id="flux-type"
                  />
                  <InputField
                    label="Surface Area"
                    name="DTL_Surface_Area"
                    required
                    placeholder="Enter surface area (number)"
                    // className="form-control"
                    className=""
                    id="surface-area"
                    type="number"
                  />
                </div>
                <div style={{ textAlign: 'center', marginTop: 16, display: 'flex', justifyContent: 'left', gap: 12 }}>
                  <ButtonWithGradient type="button" className="btn-outline redButton" onClick={() => { resetForm(); setEditId(null); }}>
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

export default DialyzerTypeLookup; 