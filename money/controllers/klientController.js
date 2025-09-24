// controllers/klientController.js
import Klient from '../models/Klient.js';
import mongoose from 'mongoose';

export async function createKlient(req, res) {
  try { const doc = await Klient.create(req.body); res.status(201).json({ data: doc }); }
  catch (err) { console.error('[Klient] create error:', err); res.status(500).json({ error: 'Failed to create klient.' }); }
}

export async function listKlientet(req, res) {
  try {
    console.log('[Klient] Incoming request to listKlientet:', {
      method: req.method,
      path: req.originalUrl,
      params: req.params,
      query: req.query
    });

    // Ensure no ID is being processed
    if (req.params.id) {
      console.error('[Klient] Unexpected ID in params for listKlientet:', req.params.id);
      return res.status(400).json({ error: 'Invalid request for listKlientet' });
    }

    const { q } = req.query;
    const query = q?.trim() ? { $text: { $search: q.trim() } } : {};
    const docs = await Klient.find(query).sort({ createdAt: -1 });

    console.log('[Klient] Retrieved documents:', docs);
    res.json({ data: docs });
  } catch (err) { console.error('[Klient] list error:', err); res.status(500).json({ error: 'Failed to list klientet.' }); }
}

export async function getKlient(req, res) {
  try {
    const { id } = req.params;

    // Validate if the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`[Klient] Invalid ID format: ${id}`);
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    console.log(`[Klient] Fetching klient with ID: ${id}`);
    const doc = await Klient.findById(id);

    if (!doc) {
      console.error(`[Klient] No document found for ID: ${id}`);
      return res.status(404).json({ error: 'Not found' });
    }

    console.log(`[Klient] Document found:`, doc);
    res.json({ data: doc });
  } catch (err) {
    console.error('[Klient] get error:', err);
    res.status(500).json({ error: 'Failed to fetch klient.' });
  }
}

export async function updateKlient(req, res) {
  try {
    const doc = await Klient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ data: doc });
  } catch (err) { console.error('[Klient] update error:', err); res.status(500).json({ error: 'Failed to update klient.' }); }
}

export async function deleteKlient(req, res) {
  try {
    const doc = await Klient.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) { console.error('[Klient] delete error:', err); res.status(500).json({ error: 'Failed to delete klient.' }); }
}
