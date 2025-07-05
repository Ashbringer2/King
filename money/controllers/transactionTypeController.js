// controllers/transactionTypeController.js
import TransactionType from '../models/TransactionType.js';

/**
 * GET /api/types
 */
export async function listTypes(req, res) {
  try {
    const types = await TransactionType.find().sort({ label: 1 });
    res.json({ data: types });
  } catch (err) {
    console.error('[Type] list error:', err);
    res.status(500).json({ error: 'Failed to fetch types.' });
  }
}

/**
 * POST /api/types
 */
export async function createType(req, res) {
  try {
    const { name, label, icon } = req.body;
    const t = await TransactionType.create({ name, label, icon });
    res.status(201).json(t);
  } catch (err) {
    console.error('[Type] create error:', err);
    res.status(500).json({ error: 'Failed to create type.' });
  }
}

/**
 * PUT /api/types/:id
 */
export async function updateType(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const t = await TransactionType.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });
    if (!t) return res.status(404).json({ error: 'Type not found.' });
    res.json(t);
  } catch (err) {
    console.error('[Type] update error:', err);
    res.status(500).json({ error: 'Failed to update type.' });
  }
}

/**
 * DELETE /api/types/:id
 */
export async function deleteType(req, res) {
  try {
    const { id } = req.params;
    const t = await TransactionType.findByIdAndDelete(id);
    if (!t) return res.status(404).json({ error: 'Type not found.' });
    res.status(204).end();
  } catch (err) {
    console.error('[Type] delete error:', err);
    res.status(500).json({ error: 'Failed to delete type.' });
  }
}
