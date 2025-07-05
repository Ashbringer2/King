// controllers/transactionController.js

import Transaction from '../models/Transaction.js';

/**
 * GET /api/transactions
 * Returns all transactions, sorted oldest → newest
 */
export async function listTransactions(req, res) {
  try {
    const txs = await Transaction
      .find()
      .sort({ date: 1 });   // ← ascending: oldest first, newest last
    res.json({ data: txs });
  } catch (err) {
    console.error('[Transaction] list error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
}

/**
 * POST /api/transactions
 * Creates a new transaction. invoiceId is treated as free-form text.
 */
export async function createTransaction(req, res) {
  try {
    const tx = await Transaction.create(req.body);
    res.status(201).json(tx);
  } catch (err) {
    console.error('[Transaction] create error:', err);
    res.status(500).json({ error: 'Failed to create transaction.' });
  }
}

/**
 * PUT /api/transactions/:id
 * Updates an existing transaction by _id.
 */
export async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const tx = await Transaction.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }
    res.json(tx);
  } catch (err) {
    console.error('[Transaction] update error:', err);
    res.status(500).json({ error: 'Failed to update transaction.' });
  }
}

/**
 * DELETE /api/transactions/:id
 * Deletes a transaction by _id.
 */
export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const tx = await Transaction.findByIdAndDelete(id);
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }
    res.status(204).end();
  } catch (err) {
    console.error('[Transaction] delete error:', err);
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
}
