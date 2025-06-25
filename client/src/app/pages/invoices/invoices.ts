// src/app/pages/invoices/invoices.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';
import { TableModule }         from 'primeng/table';
import { ButtonModule }        from 'primeng/button';
import { DropdownModule }      from 'primeng/dropdown';
import { DatePickerModule }    from 'primeng/datepicker';
import { InputTextModule }     from 'primeng/inputtext';
import { ToastModule }         from 'primeng/toast';
import { MessageService }      from 'primeng/api';
import { ApiService, Invoice } from '../service/api.service';

/** Extend Invoice so dateGerman is always a string */
type DisplayInvoice = Invoice & { dateGerman: string };

/** Form model uses actual Date objects */
interface FormInvoice {
  invoiceNumber: string;
  type: string;
  totalAmount: number;
  date: Date;
}

@Component({
  selector: 'app-invoices',
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
      <h2 class="text-2xl font-semibold mb-4">Expense Worksheet</h2>

      <!-- Toolbar -->
      <div class="flex flex-wrap align-items-center gap-2 mb-4">
        <!-- Add Expense -->
        <button
          *ngIf="!showForm"
          pButton
          type="button"
          label="Add Expense"
          class="p-button-success"
          (click)="showForm = true"
        ></button>

        <!-- FROM / TO pickers -->
        <p-datepicker
          [(ngModel)]="exportFromDate"
          [showIcon]="true"
          placeholder="From"
          dateFormat="dd/mm/yy"
          inputStyleClass="w-8rem"
        ></p-datepicker>
        <p-datepicker
          [(ngModel)]="exportToDate"
          [showIcon]="true"
          placeholder="To"
          dateFormat="dd/mm/yy"
          inputStyleClass="w-8rem"
        ></p-datepicker>

        <!-- FILTER -->
        <button
          pButton
          type="button"
          label="Filter"
          class="p-button-primary"
          (click)="filterInvoices()"
        ></button>

        <!-- CLEAR -->
        <button
          *ngIf="exportFromDate && exportToDate"
          pButton
          type="button"
          label="Clear"
          class="p-button-secondary"
          (click)="clearDateFilter()"
        ></button>

        <!-- EXPORT -->
        <button
          pButton
          type="button"
          label="Export to Excel"
          icon="pi pi-file-excel"
          class="p-button-info ml-auto"
          (click)="exportExcel()"
        ></button>
      </div>

      <!-- Add/Edit Form -->
      <form
        *ngIf="showForm"
        (ngSubmit)="addExpense()"
        class="mb-4 surface-card p-4 rounded-lg shadow-2 p-fluid"
      >
        <div class="formgrid grid">
          <div class="field col-12 md:col-3">
            <label for="invoiceNumber" class="font-medium">INVOICE NUMBER</label>
            <input
              id="invoiceNumber"
              type="text"
              pInputText
              class="w-full"
              [(ngModel)]="form.invoiceNumber"
              name="invoiceNumber"
              required
            />
          </div>
          <div class="field col-12 md:col-3">
            <label for="type" class="font-medium">TYPE</label>
            <p-dropdown
              id="type"
              [options]="typeOptions"
              [(ngModel)]="form.type"
              name="type"
              optionLabel="label"
              optionValue="value"
              placeholder="Select..."
              class="w-full"
            ></p-dropdown>
          </div>
          <div class="field col-12 md:col-3">
            <label for="totalAmount" class="font-medium">AMOUNT (€)</label>
            <input
              id="totalAmount"
              type="number"
              pInputText
              class="w-full"
              [(ngModel)]="form.totalAmount"
              name="totalAmount"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div class="field col-12 md:col-3">
            <label for="date" class="font-medium">DATE</label>
            <p-datepicker
              id="date"
              [(ngModel)]="form.date"
              name="date"
              [showIcon]="true"
              dateFormat="dd/mm/yy"
              class="w-full"
            ></p-datepicker>
          </div>
        </div>
        <div class="mt-4 flex gap-3 justify-content-center">
          <button
            *ngIf="editingIndex !== null"
            pButton
            type="submit"
            label="Save"
            class="p-button-success"
          ></button>
          <button
            *ngIf="editingIndex === null"
            pButton
            type="submit"
            label="Add"
            class="p-button-success"
          ></button>
          <button
            pButton
            type="button"
            label="Cancel"
            class="p-button-secondary"
            (click)="cancelForm()"
          ></button>
        </div>
      </form>

      <!-- Unsaved Drafts Table -->
      <table
        *ngIf="drafts.length"
        class="w-full border-collapse bg-white dark:bg-gray-900"
      >
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-800 text-sm">
            <th class="p-2 border">INVOICE NUMBER</th>
            <th class="p-2 border">TYPE</th>
            <th class="p-2 border">AMOUNT</th>
            <th class="p-2 border">DATE</th>
            <th class="p-2 border text-center">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr
            *ngFor="let exp of drafts; let i = index"
            class="hover:surface-hover"
          >
            <td class="p-2 border">{{ exp.invoiceNumber }}</td>
            <td class="p-2 border">{{ exp.type }}</td>
            <td class="p-2 border">{{ exp.totalAmount }}</td>
            <td class="p-2 border">{{ exp.date | date:'dd/MM/yyyy' }}</td>
            <td class="p-2 border text-center">
              <button
                pButton
                icon="pi pi-pencil"
                class="p-button-warning p-button-rounded mr-2"
                (click)="editDraft(i)"
              ></button>
              <button
                pButton
                icon="pi pi-trash"
                class="p-button-danger p-button-rounded"
                (click)="removeDraft(i)"
              ></button>
            </td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="drafts.length" class="mt-3 flex gap-2">
        <button
          pButton
          label="Save all"
          class="p-button-primary"
          (click)="saveAll()"
        ></button>
        <button
          pButton
          label="Clear"
          class="p-button-warning"
          (click)="clearDrafts()"
        ></button>
      </div>

      <!-- Saved Invoices Table -->
      <p-table
        *ngIf="filteredInvoices.length"
        [value]="filteredInvoices"
        responsiveLayout="scroll"
        [rowHover]="true"
        [showGridlines]="true"
        styleClass="w-full mt-5"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>#</th>
            <th>INVOICE NUMBER</th>
            <th>TYPE</th>
            <th>AMOUNT</th>
            <th>DATE (DE)</th>
            <th class="text-center">ACTIONS</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-inv let-idx="rowIndex">
          <tr>
            <td>{{ idx + 1 }}</td>
            <td>{{ inv.invoiceNumber }}</td>
            <td>{{ inv.type }}</td>
            <td>{{ inv.vlera }}</td>
            <td>{{ inv.dateGerman }}</td>
            <td class="text-center">
              <button
                pButton
                icon="pi pi-trash"
                class="p-button-danger p-button-rounded"
                (click)="deleteInvoice(inv)"
              ></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6">No invoices found.</td>
          </tr>
        </ng-template>
      </p-table>

      <p-toast></p-toast>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .p-datepicker .p-inputtext {
        width: 100%;
      }
    `
  ]
})
export class InvoiceComponent implements OnInit {
  showForm   = false;
  form: FormInvoice = {
    invoiceNumber: '',
    type:          '',
    totalAmount:   0,
    date:          new Date()
  };

  drafts: FormInvoice[] = [];
  invoices: DisplayInvoice[] = [];
  filteredInvoices: DisplayInvoice[] = [];
  editingIndex: number | null = null;

  typeOptions = [
    { label: 'Outgoing Company (Service & Client)', value: 'Outgoing Company (Service & Client)' },
    { label: 'Cash Withdrawal with Invoice',        value: 'Cash Withdrawal with Invoice' },
    { label: 'Cash Withdrawal Auto',                value: 'Cash Withdrawal Auto' },
    { label: 'Invoice via Bank',                    value: 'Invoice via Bank' },
    { label: 'Payments Dtbh',                       value: 'Payments Dtbh' },
    { label: 'Payments Mac',                       value: 'Payments Mac' },
    { label: 'Deposits',                            value: 'Deposits' },
    { label: 'Debts',                               value: 'Debts' }
  ];

  // only from/to remain
  exportFromDate: Date | null = null;
  exportToDate:   Date | null = null;

  constructor(private api: ApiService, private toast: MessageService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  private loadInvoices(): void {
    this.api.getInvoicesPaged(1, 10000).subscribe({
      next: res => {
        this.invoices = res.data.map(inv => ({
          ...inv,
          dateGerman: inv.dateGerman ?? inv.date
        }));
        this.filteredInvoices = [...this.invoices];
      },
      error: () =>
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load invoices.' })
    });
  }

  deleteInvoice(inv: DisplayInvoice): void {
    this.api.deleteInvoice(inv.id).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Deleted', detail: 'Invoice removed.' });
        this.loadInvoices();
      },
      error: () =>
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Delete failed.' })
    });
  }

  saveAll(): void {
    if (!this.drafts.length) {
      this.toast.add({ severity: 'warn', summary: 'Warning', detail: 'No drafts to save.' });
      return;
    }
    const payload: Partial<Invoice>[] = this.drafts.map(d => ({
      invoiceNumber: d.invoiceNumber,
      type:          d.type,
      totalAmount:   d.totalAmount,
      date:          d.date.toISOString()
    }));
    this.api.createInvoicesBulk(payload).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Saved', detail: 'All drafts saved.' });
        this.drafts = [];
        this.loadInvoices();
      },
      error: () =>
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Bulk save failed.' })
    });
  }

  addExpense(): void {
    if (!this.form.invoiceNumber || !this.form.type || this.form.totalAmount === null) {
      this.toast.add({ severity: 'warn', summary: 'Validation', detail: 'All fields required.' });
      return;
    }
    if (this.editingIndex !== null) {
      this.drafts[this.editingIndex] = { ...this.form };
      this.editingIndex = null;
    } else {
      this.drafts.push({ ...this.form });
    }
    this.resetForm();
  }

  editDraft(idx: number): void {
    this.form = { ...this.drafts[idx] };
    this.editingIndex = idx;
    this.showForm = true;
  }

  removeDraft(idx: number): void {
    this.drafts.splice(idx, 1);
  }

  clearDrafts(): void {
    this.drafts = [];
  }

  cancelForm(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.form = { invoiceNumber: '', type: '', totalAmount: 0, date: new Date() };
    this.showForm = false;
    this.editingIndex = null;
  }

  /** Filter invoices between two selected dates */
  filterInvoices(): void {
    console.log('filterInvoices() called with:', this.exportFromDate, this.exportToDate);
    if (!this.exportFromDate || !this.exportToDate) {
      return;
    }

    const fromMs = this.exportFromDate.getTime();
    const toDate = new Date(this.exportToDate);
    toDate.setHours(23, 59, 59, 999);
    const toMs = toDate.getTime();

    this.filteredInvoices = this.invoices.filter(inv => {
      const invMs = new Date(inv.date).getTime();
      return invMs >= fromMs && invMs <= toMs;
    });

    console.log(' matched rows:', this.filteredInvoices.length);
  }

  clearDateFilter(): void {
    this.exportFromDate = null;
    this.exportToDate   = null;
    this.filteredInvoices = [...this.invoices];
  }

  exportExcel(): void {
    this.api
      .exportInvoicesExcel(this.exportFromDate ?? undefined, this.exportToDate ?? undefined)
      .subscribe({
        next: blob => {
          const url = window.URL.createObjectURL(blob);
          const a   = document.createElement('a');
          a.href  = url;
          a.download = 'invoices.xlsx';
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: () =>
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'Export failed.' })
      });
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    // fast-input focus logic here if needed
  }
}
