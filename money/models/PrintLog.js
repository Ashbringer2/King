import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const printLogSchema = new Schema({
  id_pranimi: { type: Types.ObjectId, ref: 'Pranimi' },
  komenti_pageses: String,
  totali: Number,
  data: { type: Date, default: Date.now },
  admin: String
}, { timestamps: true });

export default model('PrintLog', printLogSchema);
