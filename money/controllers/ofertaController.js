import Oferta from '../models/Oferta.js';
import Fletedergese from '../models/Fletedergese.js';

const sumOferta = (o) => (o.items || []).reduce((s, it) => s + (Number(it.totali) || 0), 0);

export async function listByPranim(req, res) {
  try {
    const { id } = req.params;
    const { id_klient } = req.query || {};
    const q = { delete_o: 'N', $or: [{ id_pranimi: id }, ...(id_klient ? [{ id_klienti: id_klient }] : [])] };
    const rows = await Oferta.find(q).sort({ createdAt: -1 });
    const data = rows.map((r, i) => ({
      id: r._id,
      id_rendor: rows.length - i,
      komenti_pageses: r.komenti_pageses || '',
      cmimi: sumOferta(r),
      data: r.data || r.createdAt,
      admin: '', // fill from adm_o if you want to resolve names
      delete_fl: r.delete_fl,
      delete_fa: r.delete_fa
    }));
    res.json({ data });
  } catch {
    res.status(500).json({ error: 'Failed to list ofertat.' });
  }
}

export async function createOferta(req, res) {
  try {
    const created = await Oferta.create(req.body);
    res.status(201).json({ data: { id: created._id } });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create oferta.' });
  }
}

export async function deleteOferta(req, res) {
  try {
    const { id } = req.params;
    const r = await Oferta.findById(id);
    if (!r) return res.status(404).json({ error: 'Not found' });
    await r.deleteOne();
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'Failed to delete oferta.' });
  }
}

export async function makeFletedergeseFromOferta(req, res) {
  try {
    const { id } = req.params; // oferta id
    const o = await Oferta.findById(id);
    if (!o) return res.status(404).json({ error: 'Oferta not found' });

    const created = await Fletedergese.create({
      id_pranimi: o.id_pranimi,
      id_klienti: o.id_klienti,
      from_oferta: o._id,
      komenti_pageses: o.komenti_pageses,
      items: o.items,
      delete_fl: 'N'
    });
    // mark oferta "has delivery note" (optional)
    o.delete_fl = 'N';
    await o.save();

    res.status(201).json({ data: { id: created._id } });
  } catch {
    res.status(500).json({ error: 'Failed to create fletëdërgesë.' });
  }
}
