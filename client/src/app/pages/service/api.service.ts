// src/app/pages/service/api.service.ts

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

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  /* Invoices… */
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
  exportInvoicesExcel(from?: Date, to?: Date): Observable<Blob> {
    let params = new HttpParams();
    if (from) params = params.set('from', from.toISOString());
    if (to)   params = params.set('to',   to.toISOString());
    return this.http.get('/api/invoices/export/excel', { params, responseType: 'blob' });
  }

  /* Transactions… */
  getTransactions(): Observable<{ data: Transaction[] }> {
    return this.http.get<{ data: Transaction[] }>('/api/transactions');
  }
  createTransaction(tx: Partial<Transaction>): Observable<Transaction> {
    return this.http.post<Transaction>('/api/transactions', tx);
  }
  updateTransaction(id: string, tx: Partial<Transaction>): Observable<Transaction> {
    return this.http.put<Transaction>(`/api/transactions/${id}`, tx);
  }
  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`/api/transactions/${id}`);
  }

  /* Transaction Types… */
  getTypes(): Observable<{ data: TransactionType[] }> {
    return this.http.get<{ data: TransactionType[] }>('/api/types');
  }
  createType(type: Partial<TransactionType>): Observable<TransactionType> {
    return this.http.post<TransactionType>('/api/types', type);
  }
  updateType(id: string, type: Partial<TransactionType>): Observable<TransactionType> {
    return this.http.put<TransactionType>(`/api/types/${id}`, type);
  }
  deleteType(id: string): Observable<void> {
    return this.http.delete<void>(`/api/types/${id}`);
  }
}
