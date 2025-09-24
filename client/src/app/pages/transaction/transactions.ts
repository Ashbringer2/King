// src/app/pages/transaction/transactions.component.ts

import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { FormsModule }         from '@angular/forms';
import { TableModule }         from 'primeng/table';
import { ButtonModule }        from 'primeng/button';
import { DropdownModule }      from 'primeng/dropdown';
import { DatePickerModule }    from 'primeng/datepicker';
import { InputTextModule }     from 'primeng/inputtext';
import { InputNumberModule }   from 'primeng/inputnumber';
import { ToastModule }         from 'primeng/toast';
import { DialogModule }        from 'primeng/dialog';
import { MessageService }      from 'primeng/api';
import { ApiService }          from '../service/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as XLSX from 'xlsx';

registerLocaleData(localeDe);

interface Transaction {
  id?: string;
  type: string;            // now any string, matched to your dynamic types
  amount: number;
  date: Date;
  description?: string;
  invoiceId?: string;
  amountFormatted: string;
  dateFormatted: string;
}

interface TypeOption {
  label: string;  // will show the TYPE NAME
  value: string;  // will bind to form.type
  icon:  string;  // pi pi-*
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
    InputNumberModule,
    ToastModule,
    DialogModule
  ],
  providers: [
    MessageService,
    { provide: LOCALE_ID, useValue: 'de-DE' }
  ],
  template: `
    <!-- Date-range dialog (unchanged) -->
    <p-dialog
      header="Select report date range"
      [(visible)]="showDialog"
      [modal]="true"
      [blockScroll]="true"
      [closable]="false"
      [breakpoints]="{ '400px': '95vw', '500px': '98vw' }"
      [style]="{ width: 'vw', maxWidth: 'none', minHeight: '600px' }"
      [contentStyle]="{ 'overflow': 'visible', 'padding-bottom': '2rem' }"
      styleClass="sakai-dialog"
    >
      <div class="p-d-flex p-flex-wrap p-jc-between p-ai-center p-mb-4">
        <button
          *ngFor="let p of presets"
          pButton
          type="button"
          icon="{{ p.icon }}"
          label="{{ p.label }}"
          class="p-button-outlined sakai-preset-btn"
          [ngClass]="{ 'p-button-info': selectedPreset === p.label }"
          (click)="selectPreset(p)"
        ></button>
      </div>

      <div *ngIf="customActive" class="p-grid p-ai-center p-mt-3 p-px-4">
        <div class="p-col-12 sm:p-col-6">
          <label class="block mb-2">From</label>
          <p-datepicker
            [(ngModel)]="customFrom"
            dateFormat="dd.mm.yy"
            showIcon="true"
            appendTo="body"
            class="w-full"
          ></p-datepicker>
        </div>
        <div class="p-col-12 sm:p-col-6">
          <label class="block mb-2">To</label>
          <p-datepicker
            [(ngModel)]="customTo"
            dateFormat="dd.mm.yy"
            showIcon="true"
            appendTo="body"
            class="w-full"
          ></p-datepicker>
        </div>
        <div class="p-col-12 p-d-flex p-jc-end p-mt-3">
          <button
            pButton
            type="button"
            label="Go"
            icon="pi pi-arrow-right"
            class="p-button-success"
            (click)="confirmRange()"
          ></button>
        </div>
      </div>
    </p-dialog>

    <!-- Main content -->
    <ng-container *ngIf="!showDialog">
      <div class="surface-section p-6">
        <h2 class="text-2xl font-semibold mb-4">
          Transactions
          <button
            pButton
            icon="pi pi-calendar"
            class="p-button-sm p-button-text ml-2"
            (click)="showDialog = true"
          ></button>
        </h2>

        <!-- summary row (unchanged) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div
            *ngFor="let c of summaryCards"
            class="surface-card p-4 rounded-lg shadow-1 flex flex-col justify-between border-l-4"
            [ngClass]="c.borderClass"
          >
            <div>
              <div class="text-sm text-color-secondary">{{ c.label }}</div>
              <div class="text-xl font-bold text-color-primary">{{ c.value }}</div>
            </div>
            <i [class]="c.icon" [ngClass]="c.iconColor" class="text-2xl"></i>
          </div>
        </div>

        <!-- action buttons (unchanged) -->
        <div class="no-print mb-4 flex items-center">
          <button pButton type="button" icon="pi pi-plus" class="p-button-success" (click)="startAdd()">Add Transaction</button>
          <button pButton type="button" icon="pi pi-file-excel" class="p-button-success p-button-outlined ml-2" (click)="exportExcel()">Export Excel</button>
          <button pButton type="button" icon="pi pi-print" class="p-button-success p-button-outlined ml-2" (click)="printReport()">Print Report</button>
        </div>

        <div *ngIf="!showForm && transactions.length === 0" class="text-center text-color-secondary mb-6 no-print">
          No transactions yet. Click <b>Add Transaction</b>.
        </div>

        <!-- form -->
        <form *ngIf="showForm" (ngSubmit)="submitForm()" class="surface-card p-4 mb-6 rounded-lg shadow-2 no-print">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">

            <!-- TYPE DROPDOWN: updated templates -->
            <div>
              <label class="block mb-1">Type</label>
              <p-dropdown
                [options]="typeOptions"
                [(ngModel)]="form.type"
                name="type"
                optionLabel="label"
                optionValue="value"
                placeholder="Select a type…"
                class="w-full"
                appendTo="body"
              >
                <ng-template let-item pTemplate="item">
                  <div class="flex items-center gap-2">
                    <i [class]="item.icon"></i>
                    <span>{{ item.label }}</span>
                  </div>
                </ng-template>
                <ng-template let-item pTemplate="value">
                  <div class="flex items-center gap-2">
                    <i [class]="item.icon"></i>
                    <span>{{ item.label }}</span>
                  </div>
                </ng-template>
              </p-dropdown>
            </div>

            <!-- rest of the form unchanged -->
            <div>
              <label class="block mb-1">Amount</label>
              <p-inputNumber
                [(ngModel)]="form.amount"
                name="amount"
                mode="currency"
                currency="EUR"
                locale="de-DE"
                [min]="0"
                [useGrouping]="true"
                [minFractionDigits]="2"
                [maxFractionDigits]="2"
                required
                class="w-full"
                (onFocus)="onAmountFocus($event)"
                (onClick)="onAmountFocus($event)"
              ></p-inputNumber>
            </div>
            <div>
              <label class="block mb-1">Date</label>
              <p-datepicker
                [(ngModel)]="form.date"
                name="date"
                dateFormat="dd.mm.yy"
                showIcon="true"
                appendTo="body"
                class="w-full"
              ></p-datepicker>
            </div>
            <div>
              <label class="block mb-1">Description</label>
              <input type="text" pInputText [(ngModel)]="form.description" name="description" class="w-full" />
            </div>
            <div>
              <label class="block mb-1">Invoice ID</label>
              <input
                type="text"
                pInputText
                [(ngModel)]="form.invoiceId"
                name="invoiceId"
                placeholder="Optional (e.g. 1247/S)"
                class="w-full"
              />
            </div>
          </div>

          <div class="mt-4 flex justify-center gap-3">
            <button pButton type="submit" label="Save" icon="pi pi-save" class="p-button-success"></button>
            <button pButton type="button" label="Cancel" icon="pi pi-times" class="p-button-secondary" (click)="cancelForm()"></button>
          </div>
        </form>

        <!-- table and footer (unchanged) -->
        <p-table [value]="transactions" responsiveLayout="scroll" [rowHover]="true" [showGridlines]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Description</th>
              <th>Invoice ID</th>
              <th class="text-center no-print">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-tx let-i="rowIndex">
            <tr>
              <td>{{ i + 1 }}</td>
              <td>{{ tx.type }}</td>
              <td>{{ tx.amountFormatted }}</td>
              <td>{{ tx.dateFormatted }}</td>
              <td>{{ tx.description }}</td>
              <td>{{ tx.invoiceId }}</td>
              <td class="text-center flex justify-center gap-2 no-print">
                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-warning" (click)="startEdit(tx)"></button>
                <button pButton icon="pi pi-print" class="p-button-rounded p-button-info" (click)="printTransaction(tx)"></button>
                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger" (click)="deleteTransaction(tx)"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="7">No transactions found.</td></tr>
          </ng-template>
        </p-table>

        <p-toast></p-toast>
      </div>
    </ng-container>
  `,
  styles: [
    `:host ::ng-deep input[type=number]::-webkit-inner-spin-button,
     :host ::ng-deep input[type=number]::-webkit-outer-spin-button {
       -webkit-appearance: none; margin: 0;
     }
     :host ::ng-deep input[type=number] { -moz-appearance: textfield; }
    `,
    ` .sakai-dialog .p-dialog-content {
         background: var(--sakai-surface);
         color: var(--sakai-text);
         padding: 2rem;
         border-radius: 8px;
       }
       .sakai-preset-btn { margin: 0.5rem; opacity: 0.8; }
       .sakai-preset-btn.p-button-info { opacity: 1; }
    `
  ]
})
export class TransactionsComponent implements OnInit {
  showDialog = false;
  selectedPreset = 'This month';

  // will be replaced by API load:
  typeOptions: TypeOption[] = [];

  presets = [
    { label: 'Today',        icon: 'pi pi-calendar-times', calculate: () => this.rangeToday() },
    { label: 'Yesterday',    icon: 'pi pi-history',         calculate: () => this.rangeYesterday() },
    { label: 'Last 7 days',  icon: 'pi pi-refresh',         calculate: () => this.rangeLastNDays(7) },
    { label: 'This month',   icon: 'pi pi-calendar',        calculate: () => this.rangeThisMonth() },
    { label: 'Last month',   icon: 'pi pi-calendar-minus',  calculate: () => this.rangeLastMonth() },
    { label: 'Year to date', icon: 'pi pi-chart-line',      calculate: () => this.rangeYearToDate() },
    { label: 'Custom…',      icon: 'pi pi-sliders-h',       calculate: null }
  ];

  customActive = false;
  customFrom!: Date;
  customTo!: Date;

  transactions: Transaction[] = [];
  showForm = false;
  editingId: string | null = null;

  form: any = {
    type:        '',
    amount:      0,
    date:        new Date(),
    description: '',
    invoiceId:   ''
  };

  summaryCards = [
    { label: 'Income',      value: '', icon: 'pi pi-wallet',       iconColor: 'text-green-500',  borderClass: 'border-green-500' },
    { label: 'Expense',     value: '', icon: 'pi pi-shopping-cart', iconColor: 'text-red-500',    borderClass: 'border-red-500'   },
    { label: 'Debit',       value: '', icon: 'pi pi-arrow-down',    iconColor: 'text-blue-500',   borderClass: 'border-blue-500'  },
    { label: 'Credit',      value: '', icon: 'pi pi-arrow-up',      iconColor: 'text-yellow-500', borderClass: 'border-yellow-500'},
    { label: 'Net Balance', value: '', icon: 'pi pi-calculator',    iconColor: 'text-gray-700',   borderClass: 'border-gray-500'  }
  ];

  constructor(
    private api: ApiService,
    private toast: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1) load your dynamic types
    this.api.getTypes().subscribe({
      next: res => {
        this.typeOptions = res.data.map(t => ({
          label: t.name, // show the TYPE NAME
          value: t.name,
          icon:  t.icon!
        }));
        // default form.type
        this.form.type = this.typeOptions[0]?.value || '';
      },
      error: () => this.toast.add({ severity:'error', summary:'Error', detail:'Failed to load types.' })
    });

    // 2) date-range logic (unchanged)
    const qp = this.route.snapshot.queryParams;
    if (qp['from'] && qp['to']) {
      this.customFrom = new Date(qp['from']);
      this.customTo   = new Date(qp['to']);
      this.selectedPreset = 'Custom…';
      this.applyFilter(this.customFrom, this.customTo);
      this.showDialog = false;
    } else {
      const [f, t] = this.rangeThisMonth();
      this.customFrom = f;
      this.customTo   = t;
      this.showDialog = true;
      this.applyFilter(f, t);
    }
  }

  onAmountFocus(event: any) {
    setTimeout(() => {
      const raw = event.originalEvent?.target || event.target;
      const inputEl = raw as HTMLInputElement;
      if (inputEl.setSelectionRange) {
        inputEl.setSelectionRange(0, inputEl.value.length);
      }
    }, 0);
  }

  exportExcel() {
    const data = this.transactions.map(tx => ({
      ID:         tx.id,
      Type:       tx.type,
      Amount:     tx.amountFormatted,
      Date:       tx.dateFormatted,
      Description:tx.description,
      InvoiceID:  tx.invoiceId
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      header: ['ID','Type','Amount','Date','Description','InvoiceID']
    });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, 'transactions-report.xlsx');
  }

  printReport() { window.print(); }

  selectPreset(p: any) {
    this.selectedPreset = p.label;
    if (!p.calculate) { this.customActive = true; }
    else {
      this.customActive = false;
      const [f, t] = p.calculate!();
      this.confirmRange(f, t);
    }
  }

  confirmRange(from?: Date, to?: Date) {
    const f = from ?? this.customFrom;
    const t = to   ?? this.customTo;
    this.router.navigate([], {
      queryParams: { from: f.toISOString(), to: t.toISOString() }
    });
    this.applyFilter(f, t);
    this.showDialog = false;
  }

  private applyFilter(from: Date, to: Date) {
    this.api.getTransactions().subscribe({
      next: (res: any) => {
        const filtered = res.data
          .map((tx: any) => ({ ...tx, _dt: new Date(tx.date) }))
          .filter((tx: any) => tx._dt >= from && tx._dt <= to);

        this.transactions = filtered.map((tx: any) => {
          const dt  = tx._dt;
          const amt = Number(tx.amount);
          return {
            id:             tx._id,
            type:           tx.type,
            amount:         amt,
            date:           dt,
            description:    tx.description,
            invoiceId:      tx.invoiceId || '',
            amountFormatted:amt.toLocaleString('de-DE',{ style:'currency',currency:'EUR' }),
            dateFormatted:  dt.toLocaleString('de-DE',{
                              day:'2-digit',month:'2-digit',year:'numeric',
                              hour:'2-digit',minute:'2-digit'
                            })
          } as Transaction;
        });

        this.calculateTotals();
      },
      error: () => this.toast.add({ severity:'error', summary:'Error', detail:'Failed to load transactions.' })
    });
  }

  private rangeToday(): [Date, Date]       { const d=new Date(); return [startOfDay(d), endOfDay(d)]; }
  private rangeYesterday(): [Date, Date]   { const d=new Date(); d.setDate(d.getDate()-1); return [startOfDay(d), endOfDay(d)]; }
  private rangeLastNDays(n:number): [Date,Date] { const e=new Date(), s=new Date(); s.setDate(e.getDate()-n+1); return [startOfDay(s), endOfDay(e)]; }
  private rangeThisMonth(): [Date,Date]    { const n=new Date(); return [new Date(n.getFullYear(),n.getMonth(),1), endOfDay(new Date())]; }
  private rangeLastMonth(): [Date,Date]    { const n=new Date(); const s=new Date(n.getFullYear(),n.getMonth()-1,1); const e=new Date(n.getFullYear(),n.getMonth(),0); return [startOfDay(s), endOfDay(e)]; }
  private rangeYearToDate(): [Date,Date]   { const n=new Date(); return [new Date(n.getFullYear(),0,1), endOfDay(n)]; }

  startAdd() {
    this.editingId = null;
    this.form = { type:'', amount:0, date:new Date(), description:'', invoiceId:'' };
    this.showForm = true;
  }

  startEdit(tx: Transaction) {
    this.editingId = tx.id!;
    this.form = { type:tx.type, amount:tx.amount, date:tx.date, description:tx.description, invoiceId:tx.invoiceId };
    this.showForm = true;
  }

  submitForm() {
    const payload = {
      type:        this.form.type,
      amount:      this.form.amount,
      date:        this.form.date.toISOString(),
      description: this.form.description,
      invoiceId:   this.form.invoiceId || undefined
    };

    const obs = this.editingId
      ? this.api.updateTransaction(this.editingId, payload)
      : this.api.createTransaction(payload);

    obs.subscribe({
      next: () => {
        const action = this.editingId ? 'Updated' : 'Added';
        this.toast.add({ severity:'success', summary:action, detail:`Transaction ${action.toLowerCase()}.` });
        this.showForm = false;
        this.applyFilter(this.customFrom, this.customTo);
      },
      error: (err: any) => this.toast.add({ severity:'error', summary:'Error', detail:err?.error?.error || 'Save failed.' })
    });
  }

  printTransaction(_tx: Transaction) { window.print(); }

  deleteTransaction(tx: Transaction) {
    if (!tx.id) return;
    this.api.deleteTransaction(tx.id).subscribe({
      next: () => {
        this.toast.add({ severity:'success', summary:'Deleted', detail:'Transaction removed.' });
        this.applyFilter(this.customFrom, this.customTo);
      },
      error: (err: any) => this.toast.add({ severity:'error', summary:'Error', detail:err?.error?.error || 'Delete failed.' })
    });
  }

  cancelForm() { this.showForm = false; }

  private calculateTotals() {
    const sums = ['income','expense','debit','credit']
      .map(t => this.transactions.filter(x=>x.type===t).reduce((s,x)=>s+x.amount,0));
    const [inc,exp,deb,cr] = sums;
    const net = inc + cr - exp - deb;
    [inc,exp,deb,cr,net].forEach((v,i)=>{
      this.summaryCards[i].value = v.toLocaleString('de-DE',{ style:'currency',currency:'EUR' });
    });
  }
}

function startOfDay(d: Date): Date { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d: Date): Date   { const x = new Date(d); x.setHours(23,59,59,999); return x; }
