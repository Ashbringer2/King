// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './app/guards/auth.guard';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { InvoiceComponent } from './app/pages/invoices/invoices';
import { TransactionsComponent } from './app/pages/transaction/transactions';
import { TypesComponent } from './app/pages/type/types.component';

// 👇 import the standalone editor
import { PranimiEditorComponent } from './app/pages/pranimi/pranimi-editor.component';

export const appRoutes: Routes = [
  // 1) Auth module (login/register)
  {
    path: 'auth',
    loadChildren: () =>
      import('./app/pages/auth/auth.routes').then(m => m.default)
  },

  // 2) Protected shell
  {
    path: '',
    component: AppLayout,
    canMatch: [AuthGuard],
    children: [
      { path: '',             component: Dashboard },
      { path: 'dashboard',    component: Dashboard },
      { path: 'invoices',     component: InvoiceComponent },
      { path: 'transactions', component: TransactionsComponent },
      { path: 'types',        component: TypesComponent },

      // 👇 Pranimet
      { path: 'pranimet',       redirectTo: 'pranimet/new', pathMatch: 'full' },
      { path: 'pranimet/new',   component: PranimiEditorComponent, title: 'Pranim i ri' },
      { path: 'pranimet/:id',   component: PranimiEditorComponent, title: 'Pranim' },

      {
        path: 'uikit',
        loadChildren: () =>
          import('./app/pages/uikit/uikit.routes').then(m => m.default)
      },
      { path: 'documentation', component: Documentation },
      {
        path: 'pages',
        loadChildren: () =>
          import('./app/pages/pages.routes').then(m => m.default)
      }
    ]
  },

  // 3) Public landing & 404
  { path: 'landing',  component: Landing },
  { path: 'notfound', component: Notfound },

  // 4) Catch‐all → 404
  { path: '**', redirectTo: 'notfound' }
];
