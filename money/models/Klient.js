// models/Klient.js
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const coerceBool = (v) => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v === 'string') return ['1','true','yes','on'].includes(v.toLowerCase());
  return false;
};

const klientSchema = new Schema({
  // MySQL columns (kept the same names)
  id:              { type: Number },                 // legacy auto-increment (optional)
  id_k:            { type: Number, default: null },  // legacy foreign key
  id_cat:          { type: Number, default: null },  // legacy foreign key
  id_komitent:     { type: Number, default: null },  // legacy foreign key (numeric)

  emri_klinetit:   { type: String, maxlength: 45, trim: true },
  nr_unik_iden:    { type: String, maxlength: 45, trim: true },
  adresa:          { type: String, maxlength: 45, trim: true },
  posta:           { type: String, maxlength: 45, trim: true },
  vendi:           { type: String, maxlength: 45, trim: true },
  shteti:          { type: String, maxlength: 45, trim: true },
  llogaria:        { type: String, maxlength: 45, trim: true },
  tel:             { type: String, maxlength: 45, trim: true },
  banka:           { type: String, maxlength: 45, trim: true },
  email:           { type: String, maxlength: 45, trim: true },
  koment:          { type: String, maxlength: 45, trim: true },
  aktiv:           {
    type: Boolean,
    default: true,
    set: coerceBool
  },

  adresa_klinetit: { type: String, maxlength: 45, trim: true },
  tel_klientit:    { type: String, maxlength: 45, trim: true },

  // Modern refs you can use now (optional)
  komitent: { type: Schema.Types.ObjectId, ref: 'Komitent' }
}, {
  timestamps: true,
  collection: 'klientet'
});

// Helpful text index (like FULLTEXT)
klientSchema.index({
  emri_klinetit: 'text',
  nr_unik_iden:  'text',
  email:         'text',
  tel:           'text',
  adresa:        'text',
  adresa_klinetit:'text'
});

export default model('Klient', klientSchema);
