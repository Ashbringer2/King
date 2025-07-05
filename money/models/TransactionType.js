// models/TransactionType.js
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const transactionTypeSchema = new Schema({
  /** the machine‐name, e.g. "income", "expense", etc */
  name:  { type: String, required: true, unique: true },
  /** human label, e.g. "Income", "Expense" */
  label: { type: String, required: true },
  /** optional primeNG icon, e.g. "pi pi-wallet" */
  icon:  { type: String, default: '' }
}, {
  timestamps: true
});

export default model('TransactionType', transactionTypeSchema);
