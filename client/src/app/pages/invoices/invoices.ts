// src/app/invoice/invoice.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../service/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    ToastModule,
    CalendarModule
  ],
  providers: [MessageService],
  template: `
    <div class="surface-section px-4 py-5 md:px-6 lg:px-8">
      <h2 class="text-2xl font-semibold mb-4">Expense Worksheet</h2>
      <button *ngIf="!showForm" pButton type="button" label="Add Expense" class="p-button-primary mb-4" (click)="showForm = true"></button>
      <form *ngIf="showForm" (ngSubmit)="addExpense()" class="mb-4 bg-gray-50 p-4 rounded shadow">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Removed the input field for 'number' as it is auto-incremented -->
          <!-- Updated styles for input fields to make them larger -->
          <div>
            <label class="block mb-1">NUMRI I FATURES</label>
            <input type="text" class="w-full p-3 text-lg" [(ngModel)]="form.invoiceNumber" name="invoiceNumber" required />
          </div>
          <div>
            <label class="block mb-1">TIPI</label>
            <p-dropdown [options]="typeOptions" [(ngModel)]="form.type" name="type" optionLabel="label" optionValue="value" placeholder="Zgjidh..." class="w-full p-3 text-lg"></p-dropdown>
          </div>
          <div>
            <label class="block mb-1">VLERA</label>
            <input type="number" class="w-full p-3 text-lg" [(ngModel)]="form.value" name="value" required min="0" />
          </div>
        </div>
        <div class="mt-6 flex gap-4 justify-center">
          <button *ngIf="editingId !== null" pButton type="submit" label="Ruaj" class="p-button-success p-button-lg rounded-full px-8 py-3 text-lg"></button>
          <button *ngIf="editingId === null" pButton type="submit" label="Shto" class="p-button-success p-button-lg rounded-full px-8 py-3 text-lg"></button>
          <button pButton type="button" label="Anulo" class="p-button-secondary p-button-lg rounded-full px-8 py-3 text-lg" (click)="cancelForm()"></button>
        </div>
      </form>
      <!-- Table of unsaved expenses (to be saved) -->
      <table *ngIf="expenses.length > 0" class="w-full border border-collapse mt-2 bg-white">
        <thead>
          <tr class="bg-gray-100">
            <th class="p-2 border">NUMRI I FATURES</th>
            <th class="p-2 border">TIPI</th>
            <th class="p-2 border">VLERA</th>
            <th class="p-2 border">DATA</th>
            <th class="p-2 border">AKSIONET</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let expense of expenses; let i = index">
            <td class="p-2 border">{{ expense.invoiceNumber }}</td>
            <td class="p-2 border">{{ expense.type }}</td>
            <td class="p-2 border">{{ expense.value }}</td>
            <td class="p-2 border">{{ expense.date | date:'dd/MM/yyyy' }}</td>
            <td class="p-2 border">
              <button pButton type="button" label="Edit" class="p-button-warning" (click)="editExpense(i)"></button>
              <button pButton type="button" label="Delete" class="p-button-danger" (click)="removeExpense(i)"></button>
            </td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="expenses.length > 0" class="mt-4 flex gap-2">
        <button pButton type="button" label="Ruaj të gjitha" class="p-button-primary" (click)="saveAll()"></button>
        <button pButton type="button" label="Pastro" class="p-button-warning" (click)="clearExpenses()"></button>
      </div>
      <!-- Table of saved expenses (from server) -->
      <table *ngIf="invoices.length > 0" class="w-full border border-collapse mt-10 bg-white">
        <thead>
          <tr class="bg-gray-100">
            <th class="p-2 border">NUMRI RENDOR</th>
            <th class="p-2 border">NUMRI I FATURES</th>
            <th class="p-2 border">TIPI</th>
            <th class="p-2 border">VLERA</th>
            <th class="p-2 border">DATA</th>
            <th class="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let inv of invoices">
            <td class="p-2 border">{{ inv.number }}</td>
            <td class="p-2 border">{{ inv.invoiceNumber }}</td>
            <td class="p-2 border">{{ inv.type }}</td>
            <td class="p-2 border">{{ inv.totalAmount }}</td>
            <td class="p-2 border">{{ inv.date }}</td>
            <td class="p-2 border text-center flex gap-2 justify-center">
              <button pButton type="button" icon="pi pi-trash" class="p-button-danger p-button-rounded p-button-lg" (click)="deleteInvoice(inv)"></button>
            </td>
          </tr>
        </tbody>
      </table>
      <p-toast></p-toast>

      <!-- Bulk Entry Dialog -->
      <div *ngIf="showBulkForm" class="fixed inset-0 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
          <h3 class="text-xl font-semibold mb-4">Add Bulk Expenses</h3>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block mb-1">NUMRI I FATURES (comma or newline separated)</label>
              <textarea class="w-full border rounded p-2" [(ngModel)]="bulkInvoiceNumbers" rows="3"></textarea>
            </div>
            <div>
              <label class="block mb-1">VLERA (comma or newline separated)</label>
              <textarea class="w-full border rounded p-2" [(ngModel)]="bulkValues" rows="3"></textarea>
            </div>
            <div>
              <label class="block mb-1">TIPI</label>
              <p-dropdown [options]="typeOptions" [(ngModel)]="bulkType" name="bulkType" optionLabel="label" optionValue="value" placeholder="Zgjidh..." class="w-full"></p-dropdown>
            </div>
            <div>
              <label class="block mb-1">DATA</label>
              <p-calendar [(ngModel)]="bulkDate" [showIcon]="true" class="w-full"></p-calendar>
            </div>
          </div>
          <div class="mt-4 flex gap-2 justify-end">
            <button pButton type="button" label="Shto" class="p-button-success" (click)="addBulkExpenses()"></button>
            <button pButton type="button" label="Anulo" class="p-button-secondary" (click)="closeBulkForm()"></button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InvoiceComponent implements OnInit {
  showForm = false;
  form = { number: 0, invoiceNumber: '', type: '', value: '', date: new Date() };
  expenses: any[] = [];
  invoices: any[] = [];
  editingId: number | null = null;
  typeOptions = [
    { label: 'Shp.Firm(Servis&Klient)', value: 'Shp.Firm(Servis&Klient)' },
    { label: 'Marrje Cash me Faturë', value: 'Marrje Cash me Faturë' },
    { label: 'Marrje Cash Auto', value: 'Marrje Cash Auto' },
    { label: 'Fatura me Bank', value: 'Fatura me Bank' },
    { label: 'Pagesat Dtbh', value: 'Pagesat Dtbh' },
    { label: 'Pagesat Mac', value: 'Pagesat Mac' },
    { label: 'Depozime', value: 'Depozime' },
    { label: 'Borxhet', value: 'Borxhet' }
  ];

  // Bulk entry logic: allow multi-line input for invoice numbers and values
  bulkInvoiceNumbers = '';
  bulkValues = '';
  bulkType = '';
  bulkDate = new Date();
  showBulkForm = false;

  constructor(private api: ApiService, private message: MessageService) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    // Fetch all invoices, not paged
    this.api.getInvoicesPaged(1, 10000).subscribe(res => {
      this.invoices = res.data || res;
    });
  }

  addExpense() {
    if (!this.form.invoiceNumber || !this.form.type || this.form.value === '' || !this.form.date) {
      this.message.add({ severity: 'warn', summary: 'Validation', detail: 'All fields required.' });
      return;
    }
    // Always show the table after adding
    this.expenses.push({ ...this.form });
    this.showForm = true;
    this.form = { number: 0, invoiceNumber: '', type: '', value: '', date: new Date() };
  }

  cancelForm() {
    this.form = { number: 0, invoiceNumber: '', type: '', value: '', date: new Date() };
    this.showForm = false;
  }

  removeExpense(i: number) {
    this.expenses.splice(i, 1);
  }

  clearExpenses() {
    this.expenses = [];
  }

  openBulkForm() {
    this.showBulkForm = true;
  }

  closeBulkForm() {
    this.showBulkForm = false;
  }

  addBulkExpenses() {
    const numbers = this.bulkInvoiceNumbers.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    const values = this.bulkValues.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    if (!this.bulkType || numbers.length === 0 || values.length === 0) {
      this.message.add({ severity: 'warn', summary: 'Validation', detail: 'All fields required.' });
      return;
    }
    for (let i = 0; i < Math.max(numbers.length, values.length); i++) {
      this.expenses.push({
        invoiceNumber: numbers[i] || '',
        type: this.bulkType,
        value: values[i] || '',
        date: this.bulkDate
      });
    }
    this.bulkInvoiceNumbers = '';
    this.bulkValues = '';
    this.bulkType = '';
    this.bulkDate = new Date();
    this.closeBulkForm();
  }

  saveAll() {
    if (this.expenses.length === 0) {
      this.message.add({ severity: 'warn', summary: 'Validation', detail: 'No expenses to save.' });
      return;
    }
    this.api.createInvoicesBulk(this.expenses).subscribe({
      next: () => {
        this.message.add({ severity: 'success', summary: 'Saved', detail: 'All expenses saved.' });
        this.clearExpenses();
        this.loadInvoices();
      },
      error: () => {
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to save expenses.' });
      }
    });
  }

  deleteInvoice(inv: any) {
    this.api.deleteInvoice(inv.number).subscribe({
      next: () => {
        this.message.add({ severity: 'success', summary: 'Deleted', detail: 'Expense deleted.' });
        this.loadInvoices();
      },
      error: () => {
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete expense.' });
      }
    });
  }

  editInvoice(inv: any) {
    // Populate the form with the selected invoice for editing
    this.form = {
      number: inv.number || 0,
      invoiceNumber: inv.invoiceNumber,
      type: inv.type,
      value: inv.totalAmount,
      date: new Date() // or parse inv.date if needed
    };
    this.showForm = true;
    // Optionally, store the invoice id for update
    this.editingId = inv.number;
  }

  printInvoice(inv: any) {
    window.print(); // Simple print, or implement custom print logic
  }

  editExpense(index: number) {
    const expense = this.expenses[index];
    this.form = { ...expense };
    this.editingId = index;
    this.showForm = true;
  }

  saveExpense() {
    if (this.editingId !== null) {
      this.expenses[this.editingId] = { ...this.form };
      this.editingId = null;
    } else {
      this.addExpense();
    }
  }
}
