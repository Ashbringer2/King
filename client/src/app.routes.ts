// src/app.routes.ts

import { Routes } from '@angular/router';

import { AppLayout }             from './app/layout/component/app.layout';
import { Dashboard }             from './app/pages/dashboard/dashboard';
import { Documentation }         from './app/pages/documentation/documentation';
import { Landing }               from './app/pages/landing/landing';
import { Notfound }              from './app/pages/notfound/notfound';

import { InvoiceComponent }      from './app/pages/invoices/invoices';
import { TransactionsComponent } from './app/pages/transaction/transactions';

export const appRoutes: Routes = [
  // 1) Default → send straight into your auth flow
  { path: '',                redirectTo: 'auth/login', pathMatch: 'full' },

  // 2) Auth area (login, access, error, etc.)
  {
    path: 'auth',
    loadChildren: () =>
      import('./app/pages/auth/auth.routes')
        .then(m => m.default)
  },

  // 3) Main app shell (after you’ve logged in)
  {
    path: 'app',
    component: AppLayout,
    children: [
      { path: '',                 component: Dashboard },
      { path: 'invoices',         component: InvoiceComponent },
      // fix typo: use “transactions” instead of “transacion”
      { path: 'transactions',     component: TransactionsComponent },
      { path: 'uikit',            loadChildren: () => import('./app/pages/uikit/uikit.routes').then(m => m.default) },
      { path: 'documentation',    component: Documentation },
      { path: 'pages',            loadChildren: () => import('./app/pages/pages.routes').then(m => m.default) }
    ]
  },

  // 4) stand-alone landing or notfound
  { path: 'landing',          component: Landing },
  { path: 'notfound',         component: Notfound },

  // 5) Anything else → notfound
  { path: '**',               redirectTo: 'notfound' }
];
