import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const itemSchema = new Schema({
  kodi:   String,
  emri:   String,
  vendi:  String,
  kategoria: String,
  vlera_patvsh: Number,
  vlera_metvsh: Number,
  sasia: Number,
  depo:  String,
  totali: Number
}, { _id: false });

const ofertaSchema = new Schema({
  id_pranimi: { type: Types.ObjectId, ref: 'Pranimi' },
  id_klienti: { type: Types.ObjectId, ref: 'Klient' },
  komenti_pageses: String,
  items: [itemSchema],
  data: { type: Date, default: Date.now },
  adm_o: { type: Types.ObjectId },
  // soft-delete flags like old PHP
  delete_o: { type: String, enum: ['Y','N'], default: 'N' },
  delete_fl:{ type: String, enum: ['Y','N'], default: 'Y' },
  delete_fa:{ type: String, enum: ['Y','N'], default: 'Y' },
  id_rend: Number // display number if you need
}, { timestamps: true });

export default model('Oferta', ofertaSchema);
