// models/Komitent.js
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const komitentSchema = new Schema(
  {
    emri:       { type: String, required: [true, 'emri is required'], trim: true, maxlength: 100 },
    id_admin:   { type: Schema.Types.ObjectId, ref: 'User' },
    koeficient: { type: Number, default: 1, min: 0 },
    aktiv:      { type: Boolean, default: true }
  },
  { timestamps: true }
);

komitentSchema.index({ emri: 'text' });
export default model('Komitent', komitentSchema);
