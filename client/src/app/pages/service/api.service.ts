// src/app/pages/service/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/* ------ DTOs (existing) ------ */
export interface Invoice {
  id: number;
  number: number;
  invoiceNumber: string;
  type: string;
  totalAmount: number;
  date: string;
  vlera?: string;
  dateGerman?: string;
  totalAmountGerman?: string;
}

export interface Transaction {
  id?: string;
  type: 'income' | 'expense' | 'debit' | 'credit';
  amount: number;
  date: string;
  description?: string;
  invoiceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionType {
  /** MongoDB ObjectId string */
  _id?: string;
  /** Machine name, e.g. 'income' */
  name: string;
  /** Human label, e.g. 'Income' */
  label: string;
  /** Optional icon class, e.g. 'pi pi-wallet' */
  icon?: string;
}

/* ------ Extra DTOs used by pranimi-editor ------ */
type ID = number | string;

export interface CreateOfertaPayload {
  id_pranimi: ID | null;
  id_klient: ID | null;
  id_vetura: ID | null;
  // plus any extra car meta you passed with spread {...extInfo}
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = '/api'; // adjust if your API runs elsewhere

  /* =========================
   * INVOICES (existing)
   * ========================= */
  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.base}/invoices`);
  }
  createInvoice(inv: Partial<Invoice>): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.base}/invoices`, inv);
  }
  updateInvoice(id: number, inv: Partial<Invoice>): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.base}/invoices/${id}`, inv);
  }
  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/invoices/${id}`);
  }
  createInvoicesBulk(invoices: Partial<Invoice>[]): Observable<{ created: number }> {
    return this.http.post<{ created: number }>(`${this.base}/invoices/bulk`, { invoices });
  }
  getInvoicesPaged(
    page = 1,
    pageSize = 10,
    type?: string,
    invoiceNumber?: string
  ): Observable<{ data: Invoice[]; page: number; pageSize: number; total: number }> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (type) params = params.set('type', type);
    if (invoiceNumber) params = params.set('invoiceNumber', invoiceNumber);
    return this.http.get<{ data: Invoice[]; page: number; pageSize: number; total: number }>(
      `${this.base}/invoices`,
      { params }
    );
  }
  exportInvoicesExcel(from?: Date, to?: Date): Observable<Blob> {
    let params = new HttpParams();
    if (from) params = params.set('from', from.toISOString());
    if (to)   params = params.set('to',   to.toISOString());
    return this.http.get(`${this.base}/invoices/export/excel`, { params, responseType: 'blob' });
  }

  /* =========================
   * TRANSACTIONS (existing)
   * ========================= */
  getTransactions(): Observable<{ data: Transaction[] }> {
    return this.http.get<{ data: Transaction[] }>(`${this.base}/transactions`);
  }
  createTransaction(tx: Partial<Transaction>): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.base}/transactions`, tx);
  }
  updateTransaction(id: string, tx: Partial<Transaction>): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.base}/transactions/${id}`, tx);
  }
  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/transactions/${id}`);
  }

  /* =========================
   * TYPES (existing)
   * ========================= */
  getTypes(): Observable<{ data: TransactionType[] }> {
    return this.http.get<{ data: TransactionType[] }>(`${this.base}/types`);
  }
  createType(type: Partial<TransactionType>): Observable<TransactionType> {
    return this.http.post<TransactionType>(`${this.base}/types`, type);
  }
  updateType(id: string, type: Partial<TransactionType>): Observable<TransactionType> {
    return this.http.put<TransactionType>(`${this.base}/types/${id}`, type);
  }
  deleteType(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/types/${id}`);
  }

  /* =========================
   * PRANIMI + LOOKUPS (new)
   * Endpoints match what your component calls.
   * Adjust paths to your backend if different.
   * ========================= */

  // Lookups
  getKlientet(): Observable<any> {
    return this.http.get(`${this.base}/klientet`);
  }
  getKomitentet(): Observable<any> {
    return this.http.get(`${this.base}/komitentet`);
  }
  getAutomjetetByKlient(klientId: ID): Observable<any> {
    return this.http.get(`${this.base}/automjetet/by-klient/${klientId}`);
  }
  getInfosOfCurrentCar(id_vetura: ID): Observable<any> {
    return this.http.get(`${this.base}/automjetet/info/${id_vetura}`);
  }

  // Pranimi CRUD/Open/Close
  getPranimiById(id: ID): Observable<any> {
    return this.http.get(`${this.base}/pranimi/${id}`);
  }
  createPranimi(payload: any): Observable<any> {
    return this.http.post(`${this.base}/pranimi`, payload);
  }
  updatePranimi(id: ID, payload: any): Observable<any> {
    return this.http.put(`${this.base}/pranimi/${id}`, payload);
  }
  closePranimi(id: ID): Observable<any> {
    return this.http.post(`${this.base}/pranimi/${id}/close`, {});
  }
  openPranimi(id: ID): Observable<any> {
    return this.http.post(`${this.base}/pranimi/${id}/open`, {});
  }

  // Lists by pranim
  listOfertatByPranim(id_pranimi: ID, id_klient?: ID | null): Observable<any> {
    let params = new HttpParams();
    if (id_klient != null) params = params.set('id_klient', String(id_klient));
    return this.http.get(`${this.base}/oferta/by-pranim/${id_pranimi}`, { params });
  }
  listFletedergesaByPranim(id_pranimi: ID): Observable<any> {
    return this.http.get(`${this.base}/fletedergesa/by-pranim/${id_pranimi}`);
  }
  listFaturatByPranim(id_pranimi: ID): Observable<any> {
    return this.http.get(`${this.base}/fatura/by-pranim/${id_pranimi}`);
  }
  listPrintedByPranim(id_pranimi: ID): Observable<any> {
    return this.http.get(`${this.base}/printed/by-pranim/${id_pranimi}`);
  }

  // Oferta actions
  createOferta(payload: CreateOfertaPayload): Observable<any> {
    return this.http.post(`${this.base}/oferta`, payload);
  }
  deleteOferta(id_oferta: ID): Observable<any> {
    return this.http.delete(`${this.base}/oferta/${id_oferta}`);
  }
  makeFletedergeseFromOferta(id_oferta: ID): Observable<any> {
    return this.http.post(`${this.base}/fletedergesa/from-oferta/${id_oferta}`, {});
  }

  // Fletëdërgesa actions
  createFletedergese(payload: { id_pranimi: ID | null }): Observable<any> {
    return this.http.post(`${this.base}/fletedergesa`, payload);
  }
  deleteFletedergese(id_fd: ID): Observable<any> {
    return this.http.delete(`${this.base}/fletedergesa/${id_fd}`);
  }
  makeFatureFromFletedergese(id_fd: ID): Observable<any> {
    return this.http.post(`${this.base}/fatura/from-fd/${id_fd}`, {});
  }

  // Faturë actions
  createFature(payload: { id_pranimi: ID | null }): Observable<any> {
    return this.http.post(`${this.base}/fatura`, payload);
  }
  deleteFature(id_fature: ID): Observable<any> {
    return this.http.delete(`${this.base}/fatura/${id_fature}`);
  }
}
