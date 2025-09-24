// controllers/veturaController.js
import mongoose from 'mongoose';
import Vetura from '../models/Vetura.js';

const isId = (v) => mongoose.isValidObjectId(v);

export async function createVetura(req, res) {
  try {
    const { klient, komitent } = req.body;
    if (!isId(klient) || !isId(komitent)) {
      return res.status(400).json({
        error: 'Invalid klient/komitent id. Must be a 24-char Mongo ObjectId.'
      });
    }
    const doc = await Vetura.create(req.body);
    return res.status(201).json({ data: doc });
  } catch (err) {
    console.error('[Vetura] create error:', err);
    return res.status(500).json({ error: 'Failed to create vetura.' });
  }
}

export async function listVeturat(_req, res) {
  try {
    const docs = await Vetura.find().sort({ createdAt: -1 });
    return res.json({ data: docs });
  } catch (err) {
    console.error('[Vetura] list error:', err);
    return res.status(500).json({ error: 'Failed to list veturat.' });
  }
}

export async function getVetura(req, res) {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ error: 'Invalid vetura id.' });
    const doc = await Vetura.findById(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.json({ data: doc });
  } catch (err) {
    console.error('[Vetura] get error:', err);
    return res.status(500).json({ error: 'Failed to fetch vetura.' });
  }
}

export async function updateVetura(req, res) {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ error: 'Invalid vetura id.' });
    const doc = await Vetura.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.json({ data: doc });
  } catch (err) {
    console.error('[Vetura] update error:', err);
    return res.status(500).json({ error: 'Failed to update vetura.' });
  }
}

export async function deleteVetura(req, res) {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ error: 'Invalid vetura id.' });
    const doc = await Vetura.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.status(204).end();
  } catch (err) {
    console.error('[Vetura] delete error:', err);
    return res.status(500).json({ error: 'Failed to delete vetura.' });
  }
}
