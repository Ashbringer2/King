// controllers/transactionController.js
import Transaction from '../models/Transaction.js';

export async function listTransactions(req, res) {
  const data = await Transaction.find().sort({ date: -1 });
  res.json({ data });
}

export async function createTransaction(req, res) {
  const tx = await Transaction.create(req.body);
  res.status(201).json(tx);
}

export async function updateTransaction(req, res) {
  const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
}

export async function deleteTransaction(req, res) {
  await Transaction.findByIdAndDelete(req.params.id);
  res.status(204).end();
}
