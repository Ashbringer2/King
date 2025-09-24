export interface ClientOption {
  id: number;
  emri_klinetit: string;
  id_k?: string;           // internal code (used in legacy)
  id_komitent?: number;    // default komitenti for that client
  aktiv?: 'Y'|'N';
}

export interface VehicleOption {
  id: number;
  emri: string;            // display label (brand/model)
  id_komitent?: number;
}

export interface VehicleInfo {
  shasia: string;
  targat: string;
  tipi: string;
  motor: string;
  regj: string;           // first registration
  km?: number | string;
}

export interface KomitentOption {
  id: number;
  emri: string;
}

export interface OfertaRow {
  id: number;
  id_rend?: number;              // N.r. display
  id_rendor?: number;            // alt key used in some lists
  komenti_pageses?: string;
  cmimi?: number | null;
  cmimi_final?: number | null;
  data?: string;                 // dd.mm.yyyy - hh:mm (server-formatted)
  admin?: string;
  isim?: string;                 // admin name (legacy)
  delete_fl?: 'Y'|'N';
  delete_fa?: 'Y'|'N';
}

export interface FleteRow extends OfertaRow {
  id_fl?: number;
  data_fl?: string;
}

export interface FaturaRow extends OfertaRow {
  id_fa?: number;
  data_fa?: string;
}

export interface PrintedRow extends OfertaRow {
  // same columns as “Pranimi” printed list
}

export type KlGar = 1 | 2;  // 1=Klient, 2=Garancion

export interface PranimDTO {
  id?: number;
  id_klient: number;
  id_vetura: number;
  id_komitenti?: number | null;

  km_hyrje: number | string;
  km_dalje?: number | string | null;

  data_pranimit: string;       // dd-mm-yyyy (to match your page)
  data_dorezimit?: string | null;

  kl_gar: KlGar;
  tvsh: 'Y' | 'N';             // N when “Pa TVSH” is checked
  pagesa?: string | number | null;

  ankesa?: string | null;
  diagnoza?: string | null;
  komenti?: string | null;
  puna?: string | null;

  id_admin?: number;
  statusi?: number;            // 1..5
}
