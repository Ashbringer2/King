import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const fletSchema = new Schema({
  id_pranimi: { type: Types.ObjectId, ref: 'Pranimi' },
  id_klienti: { type: Types.ObjectId, ref: 'Klient' },
  from_oferta:{ type: Types.ObjectId, ref: 'Oferta' },
  komenti_pageses: String,
  items: [{ 
    kodi:String, emri:String, vendi:String, kategoria:String,
    vlera_patvsh:Number, vlera_metvsh:Number, sasia:Number, depo:String, totali:Number
  }],
  data_fl: { type: Date, default: Date.now },
  adm_fl:  { type: Types.ObjectId },
  delete_fl:{ type: String, enum: ['Y','N'], default:'N' },
  id_fl:   Number
}, { timestamps: true });

export default model('Fletedergese', fletSchema);
