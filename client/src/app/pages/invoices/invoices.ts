// src/app/invoice/invoice.ts
import { Component, OnInit, signal } from '@angular/core';
import { ApiService, Invoice } from '../service/api.service';
import { CommonModule }               from '@angular/common';
import { FormsModule }                from '@angular/forms';
import { TableModule }                from 'primeng/table';
import { ButtonModule }               from 'primeng/button';
import { DialogModule }               from 'primeng/dialog';
import { InputTextModule }            from 'primeng/inputtext';
import { ToolbarModule }              from 'primeng/toolbar';
import { ToastModule }                from 'primeng/toast';
import { MessageService }             from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="surface-section px-4 py-5 md:px-6 lg:px-8">
      <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-5">
        <div>
          <h2 class="text-2xl font-semibold mb-2">Invoices</h2>
          <span class="text-color-secondary">Manage your invoices efficiently</span>
        </div>
        <div class="mt-3 md:mt-0">
          <button pButton pRipple type="button" label="New Invoice" icon="pi pi-plus" class="p-button-primary" (click)="openNew()"></button>
        </div>
      </div>

      <p-table [value]="invoices()" [paginator]="true" [rows]="10" dataKey="id" 
        [responsiveLayout]="'scroll'" 
        [stripedRows]="true" 
        [showGridlines]="true" 
        [rowHover]="true">
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="number">Number <p-sortIcon field="number"></p-sortIcon></th>
            <th pSortableColumn="dateGerman">Date <p-sortIcon field="dateGerman"></p-sortIcon></th>
            <th pSortableColumn="totalAmount">Total <p-sortIcon field="totalAmount"></p-sortIcon></th>
            <th class="text-center">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-inv>
          <tr>
            <td>{{ inv.number }}</td>
            <td>{{ inv.dateGerman || '-' }}</td>
            <td>{{ inv.totalAmount || '-' }}</td>
            <td class="text-center">
              <button pButton pRipple type="button" icon="pi pi-pencil" class="p-button-rounded p-button-outlined p-button-info mr-2" title="Edit" (click)="editInvoice(inv)"></button>
              <button pButton pRipple type="button" icon="pi pi-trash" class="p-button-rounded p-button-outlined p-button-danger mr-2" title="Delete" (click)="deleteInvoice(inv)"></button>
              <button pButton pRipple type="button" icon="pi pi-print" class="p-button-rounded p-button-outlined p-button-success" title="Print" (click)="printInvoice(inv)"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-dialog header="Invoice Details"
                [(visible)]="displayDialog"
                [modal]="true"
                [style]="{width: '400px'}"
                [closable]="false"
                [contentStyle]="{'padding':'2rem'}">
        <form class="p-fluid">
          <div class="p-field mb-4">
            <label for="number" class="font-medium mb-2">Number</label>
            <input id="number" pInputText [(ngModel)]="newInv.number" name="number" required class="w-full"/>
          </div>
          <div class="p-field mb-4">
            <label for="date" class="font-medium mb-2">Date</label>
            <input id="date" type="date" pInputText [(ngModel)]="newInv.date" name="date" required class="w-full"/>
          </div>
          <div class="p-field mb-4">
            <label for="totalAmount" class="font-medium mb-2">Total</label>
            <input id="totalAmount" type="number" min="0" step="0.01" pInputText [(ngModel)]="newInv.totalAmount" name="totalAmount" required class="w-full"/>
          </div>
        </form>
        <ng-template pTemplate="footer">
          <button pButton pRipple type="button" label="Save" icon="pi pi-check" class="p-button-success mr-2 w-6rem" (click)="save()"></button>
          <button pButton pRipple type="button" label="Cancel" icon="pi pi-times" class="p-button-secondary w-6rem" (click)="cancel()"></button>
        </ng-template>
      </p-dialog>

      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `
})
// InvoiceComponent handles displaying, creating, editing, and deleting invoices
export class InvoiceComponent implements OnInit {
  // Holds the list of invoices loaded from the backend
  invoices = signal<Invoice[]>([]);
  // Controls the visibility of the invoice dialog
  displayDialog = false;
  // Tracks if the dialog is in edit mode
  isEdit = false;
  // Holds the data for the new or edited invoice
  newInv: Partial<Invoice> = { number: '', date: '', totalAmount: 0 };

  constructor(
    private api: ApiService,
    private message: MessageService,
    private confirm: ConfirmationService
  ) {}

  // Loads invoices from the backend
  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getInvoices()
      .subscribe((data: Invoice[]) => this.invoices.set(data));
  }

  // Opens the dialog for creating a new invoice
  openNew() {
    this.newInv = { number: '', date: '', totalAmount: 0 };
    this.isEdit = false;
    this.displayDialog = true;
  }

  // Saves a new or edited invoice
  save() {
    if (!this.newInv.number || !this.newInv.date || this.newInv.totalAmount == null) {
      this.message.add({ severity:'warn', summary:'Validation', detail:'All fields required' });
      return;
    }
    if (this.isEdit && this.newInv.id) {
      // Update existing invoice
      this.api.updateInvoice(this.newInv.id, this.newInv)
        .subscribe({
          next: () => {
            this.message.add({ severity:'success', summary:'Updated', detail:'Invoice updated' });
            this.displayDialog = false;
            this.load();
          },
          error: (err) => {
            const msg = err?.error?.error || 'Failed to update invoice';
            this.message.add({ severity:'error', summary:'Error', detail: msg });
          }
        });
    } else {
      // Create new invoice
      this.api.createInvoice(this.newInv)
        .subscribe({
          next: () => {
            this.message.add({ severity:'success', summary:'Saved', detail:'Invoice created' });
            this.displayDialog = false;
            this.load();
          },
          error: (err) => {
            const msg = err?.error?.error || 'Failed to create invoice';
            this.message.add({ severity:'error', summary:'Error', detail: msg });
          }
        });
    }
  }

  // Closes the invoice dialog
  cancel() {
    this.displayDialog = false;
  }

  // Opens the dialog for editing an invoice
  editInvoice(inv: Invoice) {
    // Fetch the latest invoice data from the backend before editing
    this.api.getInvoices().subscribe((invoices) => {
      const found = invoices.find(i => i.id === inv.id);
      if (found) {
        this.newInv = { ...found };
      } else {
        this.newInv = { ...inv };
      }
      this.isEdit = true;
      this.displayDialog = true;
    });
  }

  // Deletes an invoice with PrimeNG confirm dialog
  deleteInvoice(inv: Invoice) {
    this.confirm.confirm({
      message: `Delete invoice #${inv.number}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.deleteInvoice(inv.id).subscribe({
          next: () => {
            this.message.add({ severity: 'success', summary: 'Deleted', detail: 'Invoice deleted' });
            this.load();
          },
          error: (err) => {
            const msg = err?.error?.error || 'Failed to delete invoice';
            this.message.add({ severity: 'error', summary: 'Error', detail: msg });
          }
        });
      }
    });
  }

  // Shows a message for print (implement actual print logic as needed)
  printInvoice(inv: Invoice) {
    // TODO: Implement print logic
    this.message.add({ severity: 'info', summary: 'Print', detail: `Print invoice #${inv.number}` });
  }

  // Add keyboard shortcuts for ESC (close) and ENTER (save)
  // Listen for keydown events when dialog is open
  ngAfterViewInit() {
    window.addEventListener('keydown', this.handleKeydown);
  }
  ngOnDestroy() {
    window.removeEventListener('keydown', this.handleKeydown);
  }
  handleKeydown = (event: KeyboardEvent) => {
    if (!this.displayDialog) return;
    if (event.key === 'Escape') {
      this.cancel();
    } else if (event.key === 'Enter') {
      this.save();
    }
  }
}
