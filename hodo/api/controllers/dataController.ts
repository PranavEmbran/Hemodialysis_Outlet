import type { Request, Response } from 'express';
import { getData, addData, deleteData, getPatientsDerived, getSchedulesAssigned, addSchedulesAssigned } from '../services/dataFactory.js';

export const getAll = async (req: Request, res: Response) => {
  try {
    const items = await getData();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};

export const add = async (req: Request, res: Response) => {
  try {
    const { name, value } = req.body;
    if (!name || typeof value !== 'number') {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const newItem = await addData({ name, value });
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add data' });
  }
};

export const deleteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteData(id);
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete data' });
  }
};

export const getPatientsDerivedHandler = async (req: Request, res: Response) => {
  try {
    const patients = await getPatientsDerived();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

export const getSchedulesAssignedHandler = async (req: Request, res: Response) => {
  try {
    const schedules = await getSchedulesAssigned();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
};

export const addSchedulesAssignedHandler = async (req: Request, res: Response) => {
  try {
    const sessions = req.body;
    if (!Array.isArray(sessions)) {
      return res.status(400).json({ error: 'Request body must be an array of sessions' });
    }
    const updated = await addSchedulesAssigned(sessions);
    res.status(201).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add schedules' });
  }
}; 