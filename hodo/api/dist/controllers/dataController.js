import { getData, addData, deleteData, getPatientsDerived } from '../services/dataFactory.js';
export const getAll = async (req, res) => {
    try {
        const items = await getData();
        res.json(items);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
};
export const add = async (req, res) => {
    try {
        const { name, value } = req.body;
        if (!name || typeof value !== 'number') {
            return res.status(400).json({ error: 'Invalid input' });
        }
        const newItem = await addData({ name, value });
        res.status(201).json(newItem);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to add data' });
    }
};
export const deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteData(id);
        if (deleted) {
            res.json({ success: true });
        }
        else {
            res.status(404).json({ error: 'Item not found' });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete data' });
    }
};
export const getPatientsDerivedHandler = async (req, res) => {
    try {
        const patients = await getPatientsDerived();
        res.json(patients);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
};
