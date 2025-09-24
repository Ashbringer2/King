// routes/komitent.routes.js
import { Router } from 'express';
import Komitent from '../models/Komitent.js';

const router = Router();

function normalizeKomitent(body) {
  const rawK = body.koeficient ?? body.koificient;
  const kNum = rawK === '' || rawK == null ? undefined : Number(rawK);

  const a = body.aktiv;
  const aktiv =
    a === true || a === 'true' || a === 'Y' || a === 'y'
      ? true
      : a === false || a === 'false' || a === 'N' || a === 'n'
      ? false
      : undefined;

  return {
    emri: typeof body.emri === 'string' ? body.emri.trim() : body.emri,
    id_admin: body.id_admin || undefined,
    koeficient: Number.isNaN(kNum) ? undefined : kNum,
    aktiv
  };
}

// GET /api/komitentet
router.get('/', async (_req, res) => {
  try {
    const rows = await Komitent.find().sort({ emri: 1 });
    res.json({ data: rows });
  } catch (err) {
    console.error('[Komitent] list error:', err);
    res.status(500).json({ error: 'Failed to list komitentet.' });
  }
});

// GET /api/komitentet/:id
router.get('/:id', async (req, res) => {
  try {
    const row = await Komitent.findById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Komitent not found.' });
    res.json({ data: row });
  } catch (err) {
    console.error('[Komitent] get error:', err);
    res.status(500).json({ error: 'Failed to get komitent.' });
  }
});

// POST /api/komitentet
router.post('/', async (req, res) => {
  try {
    const payload = normalizeKomitent(req.body);
    const doc = await Komitent.create(payload);
    res.status(201).json({ data: doc });
  } catch (err) {
    if (err?.name === 'ValidationError') {
      const details = Object.fromEntries(
        Object.entries(err.errors || {}).map(([k, v]) => [k, v.message])
      );
      return res.status(400).json({ error: 'Validation failed', details });
    }
    console.error('[Komitent] create error:', err);
    res.status(500).json({ error: 'Failed to create komitent.' });
  }
});

// PUT /api/komitentet/:id
router.put('/:id', async (req, res) => {
  try {
    const payload = normalizeKomitent(req.body);
    const doc = await Komitent.findByIdAndUpdate(
      req.params.id,
      { $set: payload, $unset: { koificient: 1, id: 1 } },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ error: 'Komitent not found.' });
    res.json({ data: doc });
  } catch (err) {
    if (err?.name === 'ValidationError') {
      const details = Object.fromEntries(
        Object.entries(err.errors || {}).map(([k, v]) => [k, v.message])
      );
      return res.status(400).json({ error: 'Validation failed', details });
    }
    console.error('[Komitent] update error:', err);
    res.status(500).json({ error: 'Failed to update komitent.' });
  }
});

// DELETE /api/komitentet/:id
router.delete('/:id', async (req, res) => {
  try {
    const doc = await Komitent.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Komitent not found.' });
    res.status(204).end();
  } catch (err) {
    console.error('[Komitent] delete error:', err);
    res.status(500).json({ error: 'Failed to delete komitent.' });
  }
});

export default router;
