// models/Transaction.js
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const transactionSchema = new Schema({
  type:        { type: String, required: true },
  amount:      { type: Number, required: true },
  date:        { type: Date,   required: true },
  description: { type: String },
  invoiceId:   { type: String },  // plain text now
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now }
});

// auto‐update `updatedAt`
transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default model('Transaction', transactionSchema);
