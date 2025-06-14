// src/app/services/api.service.ts


import { Injectable, inject } from '@angular/core';
import { HttpClient }         from '@angular/common/http';
import { Observable }         from 'rxjs';
import { map }                from 'rxjs/operators';

export interface Invoice {
  id: number;
  number: string;
  date: string;
  totalAmount: number;
}

export interface Transaction {
  id: number;
  type: string;
  amount: number;
  date: string;
  description?: string;
  invoiceId?: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // Invoices
  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>('/api/invoices'); // No further formatting needed, backend sends German format
  }
  createInvoice(inv: Partial<Invoice>): Observable<Invoice> {
    return this.http.post<Invoice>('/api/invoices', inv);
  }
  updateInvoice(id: number, inv: Partial<Invoice>): Observable<Invoice> {
    return this.http.put<Invoice>(`/api/invoices/${id}`, inv);
  }
  deleteInvoice(id: number): Observable<any> {
    return this.http.delete(`/api/invoices/${id}`);
  }

  // Transactions
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>('/api/transactions');
  }
  createTransaction(tx: Partial<Transaction>): Observable<Transaction> {
    return this.http.post<Transaction>('/api/transactions', tx);
  }
}
