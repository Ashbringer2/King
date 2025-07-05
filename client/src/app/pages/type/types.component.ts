// src/app/pages/type/types.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { FormsModule }               from '@angular/forms';
import { TableModule }               from 'primeng/table';
import { ButtonModule }              from 'primeng/button';
import { DialogModule }              from 'primeng/dialog';
import { InputTextModule }           from 'primeng/inputtext';
import { DropdownModule }            from 'primeng/dropdown';
import { ToastModule }               from 'primeng/toast';
import { MessageService }            from 'primeng/api';
import { ApiService, TransactionType } from '../service/api.service';

@Component({
  selector: 'app-types',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ToastModule
  ],
  providers: [ MessageService ],
  template: `
    <p-toast></p-toast>

    <div class="p-grid p-align-center p-justify-between mb-4">
      <div class="p-col">
        <h2 class="text-xl font-semibold">Transaction Types</h2>
      </div>
      <div class="p-col-fixed">
        <button
          pButton
          label="New Type"
          icon="pi pi-plus"
          class="p-button-success"
          (click)="openNew()"
        ></button>
      </div>
    </div>

    <p-table
      [value]="types"
      dataKey="_id"
      [paginator]="true"
      [rows]="10"
      [responsiveLayout]="'scroll'"
      [rowHover]="true"
      class="p-datatable-sm"
    >
      <ng-template pTemplate="header">
        <tr>
          <th class="font-semibold">Name</th>
          <th class="font-semibold">Label</th>
          <th class="font-semibold">Icon</th>
          <th class="text-center font-semibold">Actions</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-t>
        <tr>
          <td>{{ t.name }}</td>
          <td>{{ t.label }}</td>
          <td>
            <i [class]="t.icon" class="mr-2"></i>
            {{ t.icon }}
          </td>
          <td class="text-center">
            <button
              pButton
              icon="pi pi-pencil"
              class="p-button-rounded p-button-warning mr-2"
              (click)="editType(t)"
            ></button>
            <button
              pButton
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger"
              (click)="deleteType(t)"
            ></button>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="4">No types found.</td>
        </tr>
      </ng-template>
    </p-table>

    <p-dialog
  [(visible)]="dialogVisible"
  modal
  closable
  closeOnEscape
  appendTo="body"
  header="{{ isNew ? 'New Type' : 'Edit Type' }}"
  [style]="{ width: '50rem' }"
  [breakpoints]="{ '960px': '90vw', '640px': '95vw' }"
>
  <div class="p-fluid p-formgrid p-grid p-pt-4 p-px-6">
    <!-- Name field -->
    <div class="p-field p-col-12 p-md-6 p-mb-4">
      <label for="name">Name</label>
      <input
        id="name"
        type="text"
        pInputText
        [(ngModel)]="form.name"
        required
        class="w-full"
      />
    </div>

    <!-- Label field -->
    <div class="p-field p-col-12 p-md-6 p-mb-4">
      <label for="label">Label</label>
      <input
        id="label"
        type="text"
        pInputText
        [(ngModel)]="form.label"
        required
        class="w-full"
      />
    </div>

    <!-- Icon dropdown -->
    <div class="p-field p-col-12 p-mb-4">
      <label for="icon">Icon</label>
      <p-dropdown
  id="icon"
  [options]="iconOptions"
  [(ngModel)]="form.icon"
  optionLabel="label"
  optionValue="value"
  placeholder="Select an icon…"
  showClear
  filter
  filterPlaceholder="Search icons"
  class="w-full"
  appendTo="body"
  panelClass="icon-panel"
  [panelStyle]="{ width: '100%', 'max-height': '350px' }"
>
  <ng-template let-item pTemplate="item">
    <div class="p-d-flex p-ai-center p-px-2 p-py-1">
      <i [class]="item.value" style="width:1.5rem;text-align:center"></i>
      <span class="p-ml-2">{{ item.label }}</span>
    </div>
  </ng-template>
</p-dropdown>

    </div>
  </div>

  <ng-template pTemplate="footer">
    <div class="p-d-flex p-jc-end p-gap-3 p-pb-4 p-pr-6">
      <button
        pButton
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        (click)="dialogVisible = false"
      ></button>
      <button
        pButton
        label="Save"
        icon="pi pi-check"
        class="p-button-success"
        [disabled]="!form.name || !form.label"
        (click)="save()"
      ></button>
    </div>
  </ng-template>
</p-dialog>


  `
})
export class TypesComponent implements OnInit {
  private api   = inject(ApiService);
  private toast = inject(MessageService);

  types: TransactionType[]      = [];
  dialogVisible                = false;
  isNew                        = true;
  form: Partial<TransactionType> = {};

  /** Full Sakai icon list goes here */
  iconOptions = [
    { label: 'Wallet',    value: 'pi pi-wallet' },
    { label: 'Tags',      value: 'pi pi-tags' },
    { label: 'Money Bill',value: 'pi pi-money-bill' },
    { label: 'Exchange',  value: 'pi pi-exchange' },
    // … add every icon you need
  ];

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getTypes().subscribe({
      next: res => (this.types = res.data),
      error: () =>
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load types.'
        })
    });
  }

  openNew() {
    this.isNew       = true;
    this.form        = {};
    this.dialogVisible = true;
  }

  editType(t: TransactionType) {
    this.isNew       = false;
    this.form        = { ...t };
    this.dialogVisible = true;
  }

  deleteType(t: TransactionType) {
    this.api.deleteType(t._id!).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Deleted', detail: 'Type removed.' });
        this.load();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Delete failed.' })
    });
  }

  save() {
    const op = this.isNew
      ? this.api.createType(this.form as any)
      : this.api.updateType((this.form as any)._id!, this.form as any);

    op.subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Saved', detail: 'Type saved.' });
        this.dialogVisible = false;
        this.load();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Save failed.' })
    });
  }
}
