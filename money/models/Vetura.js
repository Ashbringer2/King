// models/Vetura.js
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const veturaSchema = new Schema({
  klient:   { type: Schema.Types.ObjectId, ref: 'Klient', required: true },
  komitent: { type: Schema.Types.ObjectId, ref: 'Komitent', required: true },
  emri:     { type: String, required: true },
  shasia:   { type: String },
  targat:   { type: String },
  tipi:     { type: String },
  motor:    { type: String },
  regj:     { type: String },
  km:       { type: Number, default: 0 },
  aktiv:    { type: Boolean, default: true }
}, { timestamps: true });

export default model('Vetura', veturaSchema);
