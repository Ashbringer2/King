import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const pranimiSchema = new Schema({
  id_klient:     { type: Types.ObjectId, ref: 'Klient', required: true },
  id_vetura:     { type: Types.ObjectId, ref: 'Vetura', required: true },
  id_komitenti:  { type: Types.ObjectId, ref: 'Komitent' },
  km_hyrje:      { type: Number, default: 0 },
  km_dalje:      { type: Number },
  data_pranimit: { type: Date,   required: true },
  data_dorezimit:{ type: Date },
  kl_gar:        { type: Number, enum: [1,2], default: 1 }, // 1=klient, 2=garancion
  tvsh:          { type: String, enum: ['Y','N'], default: 'Y' },
  pagesa:        { type: String },
  ankesa:        { type: String },
  komenti:       { type: String },
  diagnoza:      { type: String },
  id_admin:      { type: Types.ObjectId }, // optional
  puna:          { type: String },          // notes
  statusi:       { type: Number, enum: [1,2,3,4,5], default: 1 }, // 5=closed
}, { timestamps: true });

export default model('Pranimi', pranimiSchema);
