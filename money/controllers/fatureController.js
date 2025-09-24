import Fature from '../models/Fature.js';

const sum = (x) => (x.items || []).reduce((s,i)=> s + (Number(i.totali)||0), 0);

export async function listByPranim(req, res) {
  try {
    const { id } = req.params;
    const rows = await Fature.find({ id_pranimi: id, delete_fa: 'N' }).sort({ createdAt: -1 });
    const data = rows.map((r,i)=>({
      id: r._id,
      id_rendor: rows.length - i,
      komenti_pageses: r.komenti_pageses || '',
      cmimi: sum(r),
      data: r.data_fa || r.createdAt,
      admin: '' // resolve from adm_fa if needed
    }));
    res.json({ data });
  } catch {
    res.status(500).json({ error: 'Failed to list faturat.' });
  }
}

export async function createFature(req, res) {
  try {
    const created = await Fature.create(req.body);
    res.status(201).json({ data: { id: created._id } });
  } catch {
    res.status(500).json({ error: 'Failed to create faturë.' });
  }
}

export async function deleteFature(req, res) {
  try {
    const { id } = req.params;
    await Fature.findByIdAndUpdate(id, { delete_fa: 'Y' });
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'Failed to delete faturë.' });
  }
}
