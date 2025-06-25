import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/* ------ DTOs ------ */
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
export interface Transaction { /* unchanged */ }

/* ------ Service ------ */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>('/api/invoices');
  }
  createInvoice(inv: Partial<Invoice>): Observable<Invoice> {
    return this.http.post<Invoice>('/api/invoices', inv);
  }
  updateInvoice(id: number, inv: Partial<Invoice>): Observable<Invoice> {
    return this.http.put<Invoice>(`/api/invoices/${id}`, inv);
  }
  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`/api/invoices/${id}`);
  }
  createInvoicesBulk(invoices: Partial<Invoice>[]): Observable<{ created: number }> {
    return this.http.post<{ created: number }>('/api/invoices/bulk', { invoices });
  }
  getInvoicesPaged(
    page = 1,
    pageSize = 10,
    type?: string,
    invoiceNumber?: string
  ): Observable<{ data: Invoice[]; page: number; pageSize: number; total: number }> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    if (type) params = params.set('type', type);
    if (invoiceNumber) params = params.set('invoiceNumber', invoiceNumber);
    return this.http.get<{ data: Invoice[]; page: number; pageSize: number; total: number }>(
      '/api/invoices',
      { params }
    );
  }

  /** Export invoices as Excel, optional from/to dates */
  exportInvoicesExcel(from?: Date, to?: Date): Observable<Blob> {
    let params = new HttpParams();
    if (from) {
      params = params.set('from', from.toISOString());
    }
    if (to) {
      params = params.set('to', to.toISOString());
    }
    return this.http.get('/api/invoices/export/excel', {
      params,
      responseType: 'blob'
    });
  }

  /* Transactions… */
  getTransactions(): Observable<{ data: Transaction[] }> {
    return this.http.get<{ data: Transaction[] }>('/api/transactions');
  }
  createTransaction(tx: Partial<Transaction>): Observable<Transaction> {
    return this.http.post<Transaction>('/api/transactions', tx);
  }
  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`/api/transactions/${id}`);
  }
}
