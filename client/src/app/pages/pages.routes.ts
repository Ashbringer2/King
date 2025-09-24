import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { InvoiceComponent } from './invoices/invoices';
import { TransactionsComponent } from './transaction/transactions';

// 👇 import the standalone component
import { PranimiEditorComponent } from './pranimi/pranimi-editor.component';

export default [
  { path: 'documentation', component: Documentation },
  { path: 'crud',          component: Crud },
  { path: 'empty',         component: Empty },
  { path: 'invoices',      component: InvoiceComponent },
  { path: 'invoices/transacion', component: TransactionsComponent },

  // 👇 Pranimet (under /pages)
  { path: 'pranimet',     redirectTo: 'pranimet/new', pathMatch: 'full' },
  { path: 'pranimet/new', component: PranimiEditorComponent, title: 'Pranim i ri' },
  { path: 'pranimet/:id', component: PranimiEditorComponent, title: 'Pranim' },

  { path: '**', redirectTo: '/notfound' }
] as Routes;
