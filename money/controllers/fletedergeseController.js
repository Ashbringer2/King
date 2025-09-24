import Fletedergese from '../models/Fletedergese.js';
import Fature from '../models/Fature.js';

const sum = (x) => (x.items || []).reduce((s,i)=> s + (Number(i.totali)||0), 0);

export async function listByPranim(req, res) {
  try {
    const { id } = req.params;
    const rows = await Fletedergese.find({ id_pranimi: id, delete_fl: 'N' }).sort({ createdAt: -1 });
    const data = rows.map((r,i)=>({
      id: r._id,
      id_rendor: rows.length - i,
      komenti_pageses: r.komenti_pageses || '',
      cmimi: sum(r),
      data: r.data_fl || r.createdAt,
      admin: '' // resolve from adm_fl if needed
    }));
    res.json({ data });
  } catch {
    res.status(500).json({ error: 'Failed to list fletëdërgesa.' });
  }
}

export async function createFletedergese(req, res) {
  try {
    const created = await Fletedergese.create(req.body);
    res.status(201).json({ data: { id: created._id } });
  } catch {
    res.status(500).json({ error: 'Failed to create fletëdërgesë.' });
  }
}

export async function deleteFletedergese(req, res) {
  try {
    const { id } = req.params;
    await Fletedergese.findByIdAndUpdate(id, { delete_fl: 'Y' });
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'Failed to delete fletëdërgesë.' });
  }
}

export async function makeFatureFromFletedergese(req, res) {
  try {
    const { id } = req.params; // fletedergese id
    const fl = await Fletedergese.findById(id);
    if (!fl) return res.status(404).json({ error: 'Fletëdërgesa not found' });

    const created = await Fature.create({
      id_pranimi: fl.id_pranimi,
      id_klienti: fl.id_klienti,
      from_flet:  fl._id,
      komenti_pageses: fl.komenti_pageses,
      items: fl.items
    });

    res.status(201).json({ data: { id: created._id } });
  } catch {
    res.status(500).json({ error: 'Failed to create faturë.' });
  }
}
