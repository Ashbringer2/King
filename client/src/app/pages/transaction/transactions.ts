import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ApiService } from '../service/api.service';

interface Transaction {
  id?: number;
  type: 'income' | 'expense' | 'debit' | 'credit';
  amount: number;
  date: Date;
  description?: string;
  invoiceId?: number;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DropdownModule,
    DatePickerModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="surface-section px-4 py-5 md:px-6 lg:px-8">
      <h2 class="text-2xl font-semibold mb-4">Transactions</h2>
      <button pButton type="button" label="Add Transaction" class="p-button-success mb-3" (click)="showForm = true"></button>
      <form *ngIf="showForm" (ngSubmit)="addTransaction()" class="mb-4 surface-card p-4 rounded-lg shadow-2 p-fluid">
        <div class="formgrid grid">
          <div class="field col-12 md:col-2">
            <label for="type" class="font-medium">Type</label>
            <p-dropdown id="type" [options]="typeOptions" [(ngModel)]="form.type" name="type" optionLabel="label" optionValue="value" placeholder="Select..." class="w-full"></p-dropdown>
          </div>
          <div class="field col-12 md:col-2">
            <label for="amount" class="font-medium">Amount</label>
            <input id="amount" type="number" pInputText class="w-full" [(ngModel)]="form.amount" name="amount" required min="0" step="0.01" />
          </div>
          <div class="field col-12 md:col-2">
            <label for="date" class="font-medium">Date</label>
            <p-datepicker id="date" [(ngModel)]="form.date" name="date" [showIcon]="true" dateFormat="dd/mm/yy" class="w-full"></p-datepicker>
          </div>
          <div class="field col-12 md:col-3">
            <label for="description" class="font-medium">Description</label>
            <input id="description" type="text" pInputText class="w-full" [(ngModel)]="form.description" name="description" />
          </div>
          <div class="field col-12 md:col-3">
            <label for="invoiceId" class="font-medium">Invoice ID</label>
            <input id="invoiceId" type="number" pInputText class="w-full" [(ngModel)]="form.invoiceId" name="invoiceId" />
          </div>
        </div>
        <div class="mt-4 flex gap-3 justify-content-center">
          <button pButton type="submit" label="Add" class="p-button-success"></button>
          <button pButton type="button" label="Cancel" class="p-button-secondary" (click)="cancelForm()"></button>
        </div>
      </form>
      <p-table [value]="transactions" responsiveLayout="scroll" [rowHover]="true" [showGridlines]="true" styleClass="w-full mt-5">
        <ng-template pTemplate="header">
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Description</th>
            <th>Invoice ID</th>
            <th class="text-center">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-tx let-idx="rowIndex">
          <tr>
            <td>{{ idx + 1 }}</td>
            <td>{{ tx.type }}</td>
            <td>{{ tx.amount }}</td>
            <td>{{ tx.date | date:'dd/MM/yyyy' }}</td>
            <td>{{ tx.description }}</td>
            <td>{{ tx.invoiceId }}</td>
            <td class="text-center">
              <button pButton icon="pi pi-trash" class="p-button-danger p-button-rounded" (click)="deleteTransaction(tx)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="7">No transactions found.</td></tr>
        </ng-template>
      </p-table>
      <p-toast></p-toast>
    </div>
  `,
  styles: [
    `:host ::ng-deep .p-datepicker .p-inputtext { width: 100%; }`
  ]
})
export class TransactionsComponent implements OnInit {
  showForm = false;
  transactions: Transaction[] = [];
  form: Transaction = { type: 'expense', amount: 0, date: new Date() };
  typeOptions = [
    { label: 'Income', value: 'income' },
    { label: 'Expense', value: 'expense' },
    { label: 'Debit', value: 'debit' },
    { label: 'Credit', value: 'credit' }
  ];

  constructor(private api: ApiService, private toast: MessageService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.api.getTransactions().subscribe({
      next: (res: any) => {
        this.transactions = res.data.map((tx: any) => ({
          ...tx,
          date: new Date(tx.date)
        }));
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load transactions.' })
    });
  }

  addTransaction(): void {
    if (!this.form.type || !this.form.amount || !this.form.date) {
      this.toast.add({ severity: 'warn', summary: 'Validation', detail: 'All fields required.' });
      return;
    }
    // Convert date to YYYY-MM-DD for backend
    const dateOnly = this.form.date instanceof Date ? this.form.date.toISOString().substring(0, 10) : this.form.date;
    const payload = { ...this.form, date: dateOnly };
    this.api.createTransaction(payload).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Added', detail: 'Transaction added.' });
        this.showForm = false;
        this.form = { type: 'expense', amount: 0, date: new Date() };
        this.loadTransactions();
      },
      error: (err) => {
        this.toast.add({ severity: 'error', summary: 'Error', detail: err?.error?.error || 'Add failed.' });
      }
    });
  }

  deleteTransaction(tx: Transaction): void {
    if (!tx.id) return;
    this.api.deleteTransaction(tx.id).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Deleted', detail: 'Transaction removed.' });
        this.loadTransactions();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Delete failed.' })
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.form = { type: 'expense', amount: 0, date: new Date() };
  }
}
