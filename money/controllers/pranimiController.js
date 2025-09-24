import Pranimi from '../models/Pranimi.js';
import PrintLog from '../models/PrintLog.js';

export async function getPranimiById(req, res) {
  try {
    const { id } = req.params;
    const p = await Pranimi.findById(id)
      .populate('id_klient')
      .populate('id_vetura')
      .populate('id_komitenti');
    if (!p) return res.status(404).json({ error: 'Pranimi not found.' });
    res.json({ data: p });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch pranimi.' });
  }
}

export async function createPranimi(req, res) {
  try {
    const payload = req.body;
    // data_pranimit should be Date string
    const created = await Pranimi.create(payload);
    res.status(201).json({ data: created });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create pranimi.' });
  }
}

export async function updatePranimi(req, res) {
  try {
    const { id } = req.params;
    const updated = await Pranimi.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Pranimi not found.' });
    res.json({ data: updated });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update pranimi.' });
  }
}

export async function closePranimi(req, res) {
  try {
    const { id } = req.params;
    const updated = await Pranimi.findByIdAndUpdate(id, { statusi: 5 }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Pranimi not found.' });
    res.json({ data: updated });
  } catch {
    res.status(500).json({ error: 'Failed to close.' });
  }
}

export async function openPranimi(req, res) {
  try {
    const { id } = req.params;
    const updated = await Pranimi.findByIdAndUpdate(id, { statusi: 1 }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Pranimi not found.' });
    res.json({ data: updated });
  } catch {
    res.status(500).json({ error: 'Failed to open.' });
  }
}

export async function listPrintedByPranim(req, res) {
  try {
    const { id } = req.params;
    const rows = await PrintLog.find({ id_pranimi: id }).sort({ createdAt: -1 });
    // shape compatible with your table (id_rendor, data, admin, cmimi -> totali)
    const data = rows.map((r, idx) => ({
      id: r._id,
      id_rendor: rows.length - idx,
      komenti_pageses: r.komenti_pageses || '',
      cmimi: r.totali || 0,
      data: r.data,
      admin: r.admin || ''
    }));
    res.json({ data });
  } catch {
    res.status(500).json({ error: 'Failed to list prints.' });
  }
}
