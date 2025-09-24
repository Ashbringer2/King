import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// If you have environments, swap this for environment.apiUrl
const BASE_URL = '/api';
type ID = number | string;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // ───────────────────────── LOOKUPS ─────────────────────────
  getKlientet(): Observable<any> {
    return this.http.get(`${BASE_URL}/klientet`);
  }

  getKomitentet(): Observable<any> {
    return this.http.get(`${BASE_URL}/komitentet`);
  }

  getAutomjetetByKlient(klientId: ID): Observable<any> {
    return this.http.get(`${BASE_URL}/klientet/${klientId}/vetturat`);
  }

  getInfosOfCurrentCar(veturaId: ID): Observable<any> {
    return this.http.get(`${BASE_URL}/vetturat/${veturaId}/info`);
  }

  // ───────────────────────── PRANIMI ─────────────────────────
  getPranimiById(id: ID): Observable<any> {
    return this.http.get(`${BASE_URL}/pranimet/${id}`);
  }

  createPranimi(payload: any): Observable<any> {
    // payload should map to tbl_pranimi fields
    return this.http.post(`${BASE_URL}/pranimet`, payload);
  }

  updatePranimi(id: ID, payload: any): Observable<any> {
    return this.http.put(`${BASE_URL}/pranimet/${id}`, payload);
  }

  closePranimi(id: ID): Observable<any> {
    // If your backend uses status=5, you can also PATCH
    return this.http.post(`${BASE_URL}/pranimet/${id}/close`, {});
  }

  openPranimi(id: ID): Observable<any> {
    return this.http.post(`${BASE_URL}/pranimet/${id}/open`, {});
  }

  // ───────────────────────── OFERTAT ─────────────────────────
  listOfertatByPranim(pranimId: ID, idKlient?: ID): Observable<any> {
    let params = new HttpParams();
    if (idKlient != null) params = params.set('id_klient', String(idKlient));
    return this.http.get(`${BASE_URL}/pranimet/${pranimId}/ofertat`, { params });
  }

  createOferta(payload: any): Observable<any> {
    // { id_pranimi, id_klienti, ... }
    return this.http.post(`${BASE_URL}/ofertat`, payload);
  }

  deleteOferta(ofertaId: ID): Observable<any> {
    return this.http.delete(`${BASE_URL}/ofertat/${ofertaId}`);
  }

  makeFletedergeseFromOferta(ofertaId: ID): Observable<any> {
    // creates a fletëdërgesë from oferta items
    return this.http.post(`${BASE_URL}/ofertat/${ofertaId}/fletedergese`, {});
  }

  // ─────────────────────── FLETËDËRGESA ───────────────────────
  listFletedergesaByPranim(pranimId: ID): Observable<any> {
    return this.http.get(`${BASE_URL}/pranimet/${pranimId}/fletedergesa`);
  }

  createFletedergese(payload: any): Observable<any> {
    return this.http.post(`${BASE_URL}/fletedergesa`, payload);
  }

  deleteFletedergese(id: ID): Observable<any> {
    return this.http.delete(`${BASE_URL}/fletedergesa/${id}`);
  }

  makeFatureFromFletedergese(fldId: ID): Observable<any> {
    return this.http.post(`${BASE_URL}/fletedergesa/${fldId}/fatura`, {});
  }

  // ───────────────────────── FATURAT ─────────────────────────
  listFaturatByPranim(pranimId: ID): Observable<any> {
    return this.http.get(`${BASE_URL}/pranimet/${pranimId}/faturat`);
  }

  createFature(payload: any): Observable<any> {
    return this.http.post(`${BASE_URL}/faturat`, payload);
  }

  deleteFature(id: ID): Observable<any> {
    return this.http.delete(`${BASE_URL}/faturat/${id}`);
  }

  // ───────────────────────── PRINTED ─────────────────────────
  listPrintedByPranim(pranimId: ID): Observable<any> {
    return this.http.get(`${BASE_URL}/pranimet/${pranimId}/prints`);
  }
}
