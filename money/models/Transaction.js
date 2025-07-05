import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type:        { type: String, required: true },
  amount:      { type: Number, required: true },
  date:        { type: Date, default: Date.now },
  description: { type: String },
  invoiceId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
