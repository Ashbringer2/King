// src/app/pages/pranimi/pranimi-editor.component.ts
import { Component, OnInit, LOCALE_ID, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// PrimeNG (STANDALONE components for v17+)
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CalendarModule } from 'primeng/calendar';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Your app service
import { ApiService } from '../service/api.service';

type ID = number | string;

interface Pranimi {
  id?: ID;
  id_klient: ID | null;
  id_vetura: ID | null;
  id_komitenti: ID | null;
  km_hyrje: string;
  km_dalje?: string;
  data_pranimit: Date;
  data_dorezimit?: Date | null;
  kl_gar: 1 | 2;     // 1=Klient, 2=Garancion
  tvsh: 'Y' | 'N';
  pagesa?: string;
  ankesa: string;
  diagnoza?: string;
  statusi?: number;   // 1..5 (5 = closed)
}

interface Option {
  label: string;
  value: ID;
  meta?: any;
}

interface OfertaRow {
  id: ID;
  id_rend?: number;
  komenti_pageses?: string;
  cmimi?: number | null;
  data?: string;
  admin?: string;
  delete_fl?: 'Y'|'N';
  delete_fa?: 'Y'|'N';
}

interface SimpleRow {
  id: ID;
  id_rend?: number;
  komenti_pageses?: string;
  cmimi?: number | null;
  data?: string;
  admin?: string;
}

@Component({
  selector: 'app-pranimi-editor',
  standalone: true,
  imports: [
  CommonModule, FormsModule, HttpClientModule,
  ButtonModule, DropdownModule, RadioButtonModule, CheckboxModule, InputTextModule, TextareaModule,
  CalendarModule, TabViewModule, TableModule, ToastModule, ConfirmDialogModule
  ],
  providers: [
    ApiService,
    MessageService,
    ConfirmationService,
    { provide: LOCALE_ID, useValue: 'de-DE' }
  ],
  template: `
  <div class="surface-section p-4 md:p-6">

    <!-- Header + Close/Open -->
    <div class="flex flex-wrap items-center justify-between mb-4">
      <h2 class="text-2xl font-semibold m-0">
        {{ isNew ? 'New Pranim' : ('Pranim #' + pranimId) }}
      </h2>

      <div class="flex gap-2" *ngIf="!isNew">
  <button pButton type="button" icon="pi pi-lock"
    class="p-button-danger"
    (click)="toggleClose(true)"
    *ngIf="!isClosed">Close</button>
  <button pButton type="button" icon="pi pi-lock-open"
    class="p-button-success"
    (click)="toggleClose(false)"
    *ngIf="isClosed">Open</button>
      </div>
    </div>

    <!-- Top row: Klient / Vetura / Komitent -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block mb-2">Client</label>
        <p-dropdown
          [options]="klientet"
          [(ngModel)]="form.id_klient"
          optionLabel="label"
          optionValue="value"
          placeholder="Select client"
          class="w-full"
          appendTo="body"
          [disabled]="isClosed"
          (onChange)="onKlientChange()"
        ></p-dropdown>
      </div>

      <div>
        <label class="block mb-2">Vehicle</label>
        <p-dropdown
          [options]="vetturat"
          [(ngModel)]="form.id_vetura"
          optionLabel="label"
          optionValue="value"
          placeholder="Select vehicle"
          class="w-full"
          appendTo="body"
          [disabled]="isClosed || !form.id_klient"
          (onChange)="onVeturaChange()"
        ></p-dropdown>
      </div>

      <div>
        <label class="block mb-2">Komitent</label>
        <p-dropdown
          [options]="komitentet"
          [(ngModel)]="form.id_komitenti"
          optionLabel="label"
          optionValue="value"
          placeholder="Select komitent"
          class="w-full"
          appendTo="body"
          [disabled]="isClosed"
        ></p-dropdown>
      </div>
    </div>

    <!-- Info panel (vehicle extended) -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
      <div><b>Chassis:</b> <span class="opacity-80">{{ extInfo.shasia || '-' }}</span></div>
      <div><b>Plates:</b> <span class="opacity-80">{{ extInfo.targat || '-' }}</span></div>
      <div><b>Type:</b> <span class="opacity-80">{{ extInfo.tipi || '-' }}</span></div>
      <div><b>Engine No:</b> <span class="opacity-80">{{ extInfo.motor || '-' }}</span></div>
      <div><b>First Reg:</b> <span class="opacity-80">{{ extInfo.regj || '-' }}</span></div>
    </div>

    <!-- Second row: Warranty/TVSH + KM + Dates + Payment -->
    <div class="surface-card p-4 rounded-md shadow-1 mt-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div>
          <label class="block mb-2">Client / Warranty</label>
          <div class="flex items-center gap-3 mt-1">
            <p-radioButton name="kl_gar" [value]="1" [(ngModel)]="form.kl_gar"
                           inputId="kl" [disabled]="isClosed"></p-radioButton>
            <label for="kl">Client</label>
            <p-radioButton name="kl_gar" [value]="2" [(ngModel)]="form.kl_gar"
                           inputId="gar" [disabled]="isClosed"></p-radioButton>
            <label for="gar">Warranty</label>
          </div>
        </div>

        <div>
          <label class="block mb-2">KM In</label>
          <input pInputText type="text" class="w-full"
                 [(ngModel)]="form.km_hyrje" [disabled]="isClosed" />
          <small class="block opacity-70 mt-1">KM Out is enabled on existing records.</small>
        </div>

        <div>
          <label class="block mb-2">KM Out</label>
          <input pInputText type="text" class="w-full"
                 [(ngModel)]="form.km_dalje" [disabled]="isClosed || isNew" />
        </div>

        <div>
          <label class="block mb-2">Payment</label>
          <input pInputText type="text" class="w-full"
                 [(ngModel)]="form.pagesa" [disabled]="isClosed" />
          <div class="flex items-center gap-2 mt-2">
            <p-checkbox [(ngModel)]="noTVSH" binary="true" inputId="notvsh"
                        [disabled]="isClosed"></p-checkbox>
            <label for="notvsh">No VAT (Pa TVSH)</label>
          </div>
        </div>

        <div>
          <label class="block mb-2">Received</label>
          <p-datepicker [(ngModel)]="form.data_pranimit" class="w-full"
                        [disabled]="isClosed" appendTo="body" dateFormat="dd.mm.yy"></p-datepicker>
        </div>

        <div>
          <label class="block mb-2">Delivered</label>
          <p-datepicker [(ngModel)]="form.data_dorezimit" class="w-full"
                        [disabled]="isClosed || isNew" appendTo="body" dateFormat="dd.mm.yy"></p-datepicker>
        </div>

      </div>
    </div>

    <!-- Textareas -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div>
        <label class="block mb-2">Complaint (Ankesa)</label>
        <textarea pInputTextarea class="w-full" rows="8"
                  [(ngModel)]="form.ankesa" [disabled]="isClosed"></textarea>
      </div>
      <div>
        <label class="block mb-2">Mechanic Diagnosis (Diagnoza)</label>
        <textarea pInputTextarea class="w-full" rows="8"
                  [(ngModel)]="form.diagnoza" [disabled]="isClosed"></textarea>
      </div>
    </div>

    <!-- Actions -->
      <div class="mt-4 flex gap-2">
      <button pButton type="button"
        icon="pi pi-check"
        class="p-button-success"
        (click)="save()"
        [disabled]="isClosed">{{ isNew ? 'Save' : 'Update' }}</button>

      <button pButton type="button"
        icon="pi pi-arrow-left"
        class="p-button-secondary"
        (click)="goBack()">Back</button>
    </div>

    <!-- Tabs -->
    <p-tabView class="mt-5" *ngIf="!isNew">
      <p-tabPanel header="Offers (Ofertat)">
        <div class="flex justify-between items-center mb-3">
          <div class="text-color-secondary">Offers created for this client/pranim.</div>
    <button pButton type="button" icon="pi pi-plus"
      class="p-button-success"
      (click)="createOferta()"
      [disabled]="isClosed">New Offer</button>
        </div>

        <p-table [value]="ofertat" [rowHover]="true" [showGridlines]="true" responsiveLayout="scroll">
          <ng-template pTemplate="header">
            <tr>
              <th>#</th>
              <th>Comment</th>
              <th>Price</th>
              <th>Date</th>
              <th>Admin</th>
              <th class="text-center">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-r>
            <tr>
              <td>{{ r.id_rend || r.id }}</td>
              <td>{{ r.komenti_pageses || '-' }}</td>
              <td>{{ (r.cmimi ?? 0) | currency:'EUR':'symbol':'1.2-2':'de-DE' }}</td>
              <td>{{ r.data || '-' }}</td>
              <td>{{ r.admin || '—' }}</td>
              <td class="text-center flex justify-center gap-2">
                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-warning"
                        (click)="openOferta(r)"></button>
                <button pButton icon="pi pi-file-import" class="p-button-rounded p-button-help"
                        (click)="makeFletedergese(r)" [disabled]="isClosed"></button>
                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger"
                        (click)="deleteOferta(r)" [disabled]="isClosed"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6">No offers.</td></tr>
          </ng-template>
        </p-table>
      </p-tabPanel>

      <p-tabPanel header="Confirmations & Delivery (Fletëdërgesa)">
        <div class="flex justify-between items-center mb-3">
          <div class="text-color-secondary">Confirm and generate delivery notes from offers.</div>
    <button pButton type="button" icon="pi pi-plus"
      class="p-button-success"
      (click)="createFletedergese()"
      [disabled]="isClosed">New Delivery Note</button>
        </div>

        <p-table [value]="fletedergesa" [rowHover]="true" [showGridlines]="true" responsiveLayout="scroll">
          <ng-template pTemplate="header">
            <tr>
              <th>#</th>
              <th>Comment</th>
              <th>Price</th>
              <th>Date</th>
              <th>Admin</th>
              <th class="text-center">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-r>
            <tr>
              <td>{{ r.id_rend || r.id }}</td>
              <td>{{ r.komenti_pageses || '-' }}</td>
              <td>{{ (r.cmimi ?? 0) | currency:'EUR':'symbol':'1.2-2':'de-DE' }}</td>
              <td>{{ r.data || '-' }}</td>
              <td>{{ r.admin || '—' }}</td>
              <td class="text-center flex justify-center gap-2">
                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-warning"
                        (click)="openFletedergese(r)"></button>
                <button pButton icon="pi pi-file" class="p-button-rounded p-button-info"
                        (click)="makeFature(r)" [disabled]="isClosed"></button>
                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger"
                        (click)="deleteFletedergese(r)" [disabled]="isClosed"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6">No delivery notes.</td></tr>
          </ng-template>
        </p-table>
      </p-tabPanel>

      <p-tabPanel header="Invoices (Faturat)">
        <div class="flex justify-between items-center mb-3">
          <div class="text-color-secondary">Invoices created from delivery notes.</div>
    <button pButton type="button" icon="pi pi-plus"
      class="p-button-success"
      (click)="createFature()"
      [disabled]="isClosed">New Invoice</button>
        </div>

        <p-table [value]="faturat" [rowHover]="true" [showGridlines]="true" responsiveLayout="scroll">
          <ng-template pTemplate="header">
            <tr>
              <th>#</th>
              <th>Comment</th>
              <th>Price</th>
              <th>Date</th>
              <th>Admin</th>
              <th class="text-center">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-r>
            <tr>
              <td>{{ r.id_rend || r.id }}</td>
              <td>{{ r.komenti_pageses || '-' }}</td>
              <td>{{ (r.cmimi ?? 0) | currency:'EUR':'symbol':'1.2-2':'de-DE' }}</td>
              <td>{{ r.data || '-' }}</td>
              <td>{{ r.admin || '—' }}</td>
              <td class="text-center flex justify-center gap-2">
                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-warning"
                        (click)="openFature(r)"></button>
                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger"
                        (click)="deleteFature(r)" [disabled]="isClosed"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6">No invoices.</td></tr>
          </ng-template>
        </p-table>
      </p-tabPanel>

      <p-tabPanel header="Printed (Pranimi)">
        <div class="text-color-secondary mb-3">Printed invoices / previews.</div>
        <p-table [value]="prints" [rowHover]="true" [showGridlines]="true" responsiveLayout="scroll">
          <ng-template pTemplate="header">
            <tr>
              <th>#</th>
              <th>Comment</th>
              <th>Price</th>
              <th>Date</th>
              <th>Admin</th>
              <th class="text-center">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-r>
            <tr>
              <td>{{ r.id_rend || r.id }}</td>
              <td>{{ r.komenti_pageses || '-' }}</td>
              <td>{{ (r.cmimi ?? 0) | currency:'EUR':'symbol':'1.2-2':'de-DE' }}</td>
              <td>{{ r.data || '-' }}</td>
              <td>{{ r.admin || '—' }}</td>
              <td class="text-center">
                <button pButton icon="pi pi-eye" class="p-button-rounded p-button-info"
                        (click)="previewPrint(r)"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6">No prints.</td></tr>
          </ng-template>
        </p-table>
      </p-tabPanel>
    </p-tabView>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  </div>
  `,
  styles: [`
    :host ::ng-deep .p-tabview .p-tabview-nav { flex-wrap: wrap; }
    .opacity-80 { opacity: .8; }
  `]
})
export class PranimiEditorComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(MessageService);
  private confirm = inject(ConfirmationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  pranimId!: ID | null;
  isNew = true;
  isClosed = false;

  // dropdowns
  klientet: Option[] = [];
  vetturat: Option[] = [];
  komitentet: Option[] = [];

  // vehicle extended info
  extInfo: any = { shasia: '', targat: '', tipi: '', motor: '', regj: '' };

  // tables
  ofertat: OfertaRow[] = [];
  fletedergesa: SimpleRow[] = [];
  faturat: SimpleRow[] = [];
  prints: SimpleRow[] = [];

  // form model
  form: Pranimi = {
    id_klient: null,
    id_vetura: null,
    id_komitenti: null,
    km_hyrje: '',
    km_dalje: '',
    data_pranimit: new Date(),
    data_dorezimit: null,
    kl_gar: 1,
    tvsh: 'Y',
    pagesa: '',
    ankesa: '',
    diagnoza: ''
  };

  get noTVSH() { return this.form.tvsh === 'N'; }
  set noTVSH(v: boolean) { this.form.tvsh = v ? 'N' : 'Y'; }

  ngOnInit(): void {
    // read :id
    const id = this.route.snapshot.paramMap.get('id');
    this.isNew = !id;
    this.pranimId = id;

    this.loadLookups().then(() => {
      if (this.isNew) {
        // defaults for new
        this.form.data_pranimit = new Date();
        this.form.kl_gar = 1;
        this.form.tvsh = 'Y';
      } else {
        this.loadPranimi(String(id));
      }
    });
  }

  async loadLookups() {
    // Clients
    await this.api.getKlientet().toPromise().then((res: any) => {
      this.klientet = (res?.data || []).map((k: any) => ({
        label: k.emri_klinetit || k.name || `#${k.id}`,
        value: k.id,
        meta: { id_komitenti: k.id_komitent }
      }));
    });

    // Komitents
    await this.api.getKomitentet().toPromise().then((res: any) => {
      this.komitentet = (res?.data || []).map((k: any) => ({
        label: k.emri || k.name || `#${k.id}`,
        value: k.id
      }));
    });
  }

  loadVetturatByKlient(klientId: ID, preselect?: ID) {
    this.vetturat = [];
    this.api.getAutomjetetByKlient(klientId).subscribe((res: any) => {
      this.vetturat = (res?.data || []).map((v: any) => ({
        label: v.emri || v.name || `#${v.id}`,
        value: v.id,
        meta: v
      }));
      if (preselect) this.form.id_vetura = preselect;
      // auto-fill komitent if provided on klient meta
      const selK = this.klientet.find(k => k.value === klientId);
      if (selK?.meta?.id_komitenti) {
        this.form.id_komitenti = selK.meta.id_komitenti;
      }
      // extended info
      if (this.form.id_vetura) this.onVeturaChange();
    });
  }

  loadPranimi(id: string) {
    this.api.getPranimiById(id).subscribe({
      next: (res: any) => {
        const p = res?.data as any;
        if (!p) return;

        this.form = {
          id_klient: p.id_klient,
          id_vetura: p.id_vetura,
          id_komitenti: p.id_komitenti,
          km_hyrje: String(p.km_hyrje ?? ''),
          km_dalje: String(p.km_dalje ?? ''),
          data_pranimit: p.data_pranimit ? new Date(p.data_pranimit) : new Date(),
          data_dorezimit: p.data_dorezimit ? new Date(p.data_dorezimit) : null,
          kl_gar: (Number(p.kl_gar) === 2 ? 2 : 1),
          tvsh: p.tvsh === 'N' ? 'N' : 'Y',
          pagesa: p.pagesa || '',
          ankesa: p.ankesa || '',
          diagnoza: p.diagnoza || '',
          statusi: Number(p.statusi || 0)
        };

        this.isClosed = this.form.statusi === 5;

        // preload vehicles
        if (this.form.id_klient) {
          this.loadVetturatByKlient(this.form.id_klient, this.form.id_vetura!);
        }

        // load lists
        this.reloadOfertat();
        this.reloadFletdergesa();
        this.reloadFaturat();
        this.reloadPrinted();
      },
      error: () => this.toast.add({ severity:'error', summary:'Error', detail:'Failed to load pranim.' })
    });
  }

  onKlientChange() {
    this.form.id_vetura = null;
    this.extInfo = { shasia:'', targat:'', tipi:'', motor:'', regj:'' };
    if (this.form.id_klient) {
      this.loadVetturatByKlient(this.form.id_klient);
    }
  }

  onVeturaChange() {
    if (!this.form.id_vetura) {
      this.extInfo = { shasia:'', targat:'', tipi:'', motor:'', regj:'' };
      return;
    }
    this.api.getInfosOfCurrentCar(this.form.id_vetura).subscribe((res: any) => {
      const v = res?.data?.[0] || {};
      this.extInfo = {
        shasia: v.shasia || v.nr_shasis || '',
        targat: v.targat || '',
        tipi: v.tipi || v.lloji || '',
        motor: v.motor || '',
        regj: v.regj || ''
      };
      if (!this.form.km_hyrje) this.form.km_hyrje = String(v.km ?? '');
    });
  }

  // Save / Update
  save() {
    if (!this.form.id_klient || !this.form.id_vetura || !this.form.ankesa || !this.form.km_hyrje || !this.form.data_pranimit) {
      this.toast.add({ severity:'warn', summary:'Missing', detail:'Please fill required fields.' });
      return;
    }

    const payload: any = {
      id_klient: this.form.id_klient,
      id_vetura: this.form.id_vetura,
      id_komitenti: this.form.id_komitenti,
      km_hyrje: this.form.km_hyrje,
      km_dalje: this.form.km_dalje || null,
      data_pranimit: this.form.data_pranimit?.toISOString(),
      data_dorezimit: this.form.data_dorezimit ? this.form.data_dorezimit.toISOString() : null,
      kl_gar: this.form.kl_gar,
      tvsh: this.form.tvsh,
      pagesa: this.form.pagesa,
      ankesa: this.form.ankesa,
      diagnoza: this.form.diagnoza
    };

    if (this.isNew) {
      this.api.createPranimi(payload).subscribe({
        next: (res: any) => {
          const newId = res?.data?.id || res?.id || res;
          this.toast.add({ severity:'success', summary:'Saved', detail:'Pranim created.' });
          this.router.navigate(['/pages/pranimet', newId]);
        },
        error: (err) => this.toast.add({ severity:'error', summary:'Error', detail: err?.error?.error || 'Create failed.' })
      });
    } else {
      this.api.updatePranimi(String(this.pranimId), payload).subscribe({
        next: () => {
          this.toast.add({ severity:'success', summary:'Updated', detail:'Pranim updated.' });
          this.loadPranimi(String(this.pranimId));
        },
        error: (err) => this.toast.add({ severity:'error', summary:'Error', detail: err?.error?.error || 'Update failed.' })
      });
    }
  }

  toggleClose(close: boolean) {
    if (!this.pranimId) return;
    const action = close ? 'close' : 'open';
    this.confirm.confirm({
      message: `Are you sure you want to ${action} this pranim?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const obs = close ? this.api.closePranimi(String(this.pranimId))
                          : this.api.openPranimi(String(this.pranimId));
        obs.subscribe({
          next: () => {
            this.toast.add({ severity:'success', summary:'Done', detail:`Pranim ${action}d.` });
            this.loadPranimi(String(this.pranimId));
          },
          error: () => this.toast.add({ severity:'error', summary:'Error', detail:`Failed to ${action}.` })
        });
      }
    });
  }

  // Lists reloaders
  reloadOfertat() {
    if (!this.pranimId) return;
    this.api.listOfertatByPranim(String(this.pranimId), this.form.id_klient).subscribe((res: any) => {
      this.ofertat = res?.data || [];
    });
  }
  reloadFletdergesa() {
    if (!this.pranimId) return;
    this.api.listFletedergesaByPranim(String(this.pranimId)).subscribe((res: any) => {
      this.fletedergesa = res?.data || [];
    });
  }
  reloadFaturat() {
    if (!this.pranimId) return;
    this.api.listFaturatByPranim(String(this.pranimId)).subscribe((res: any) => {
      this.faturat = res?.data || [];
    });
  }
  reloadPrinted() {
    if (!this.pranimId) return;
    this.api.listPrintedByPranim(String(this.pranimId)).subscribe((res: any) => {
      this.prints = res?.data || [];
    });
  }

  // Actions (stubs call your API then reload)
  createOferta() {
    if (!this.pranimId) return;
    this.api.createOferta({
      id_pranimi: this.pranimId,
      id_klient: this.form.id_klient,
      id_vetura: this.form.id_vetura,
      ...this.extInfo
    }).subscribe({
      next: () => { this.toast.add({severity:'success', summary:'Created', detail:'Offer created.'}); this.reloadOfertat(); },
      error: () => this.toast.add({severity:'error', summary:'Error', detail:'Failed to create offer.'})
    });
  }
  openOferta(r: OfertaRow) { /* route or popup as you wish */ }
  deleteOferta(r: OfertaRow) {
    this.confirm.confirm({
      message: 'Delete this offer?',
      accept: () => {
        this.api.deleteOferta(String(r.id)).subscribe({
          next: () => { this.toast.add({severity:'success', summary:'Deleted', detail:'Offer removed.'}); this.reloadOfertat(); },
          error: () => this.toast.add({severity:'error', summary:'Error', detail:'Delete failed.'})
        });
      }
    });
  }
  makeFletedergese(r: OfertaRow) {
    this.api.makeFletedergeseFromOferta(String(r.id)).subscribe({
      next: () => { this.toast.add({severity:'success', summary:'Done', detail:'Delivery note created.'}); this.reloadFletdergesa(); },
      error: () => this.toast.add({severity:'error', summary:'Error', detail:'Operation failed.'})
    });
  }

  createFletedergese() {
    if (!this.pranimId) return;
    this.api.createFletedergese({ id_pranimi: this.pranimId }).subscribe({
      next: () => { this.toast.add({severity:'success', summary:'Created', detail:'Delivery note created.'}); this.reloadFletdergesa(); },
      error: () => this.toast.add({severity:'error', summary:'Error', detail:'Failed to create delivery note.'})
    });
  }
  openFletedergese(r: SimpleRow) { /* route or popup */ }
  deleteFletedergese(r: SimpleRow) {
    this.confirm.confirm({
      message: 'Delete this delivery note?',
      accept: () => {
        this.api.deleteFletedergese(String(r.id)).subscribe({
          next: () => { this.toast.add({severity:'success', summary:'Deleted', detail:'Delivery note removed.'}); this.reloadFletdergesa(); },
          error: () => this.toast.add({severity:'error', summary:'Error', detail:'Delete failed.'})
        });
      }
    });
  }
  makeFature(r: SimpleRow) {
    this.api.makeFatureFromFletedergese(String(r.id)).subscribe({
      next: () => { this.toast.add({severity:'success', summary:'Done', detail:'Invoice created.'}); this.reloadFaturat(); },
      error: () => this.toast.add({severity:'error', summary:'Error', detail:'Operation failed.'})
    });
  }

  createFature() {
    if (!this.pranimId) return;
    this.api.createFature({ id_pranimi: this.pranimId }).subscribe({
      next: () => { this.toast.add({severity:'success', summary:'Created', detail:'Invoice created.'}); this.reloadFaturat(); },
      error: () => this.toast.add({severity:'error', summary:'Error', detail:'Failed to create invoice.'})
    });
  }
  openFature(r: SimpleRow) { /* route or popup */ }
  deleteFature(r: SimpleRow) {
    this.confirm.confirm({
      message: 'Delete this invoice?',
      accept: () => {
        this.api.deleteFature(String(r.id)).subscribe({
          next: () => { this.toast.add({severity:'success', summary:'Deleted', detail:'Invoice removed.'}); this.reloadFaturat(); },
          error: () => this.toast.add({severity:'error', summary:'Error', detail:'Delete failed.'})
        });
      }
    });
  }

  previewPrint(r: SimpleRow) { /* open preview */ }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
