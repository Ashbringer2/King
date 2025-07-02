// src/app.routes.ts

import { Routes }               from '@angular/router';
import { authGuard }            from './app/guards/auth.guard';
import { AppLayout }            from './app/layout/component/app.layout';
import { Dashboard }            from './app/pages/dashboard/dashboard';
import { Documentation }        from './app/pages/documentation/documentation';
import { Landing }              from './app/pages/landing/landing';
import { Notfound }             from './app/pages/notfound/notfound';
import { InvoiceComponent }     from './app/pages/invoices/invoices';
import { TransactionsComponent }from './app/pages/transaction/transactions';

export const appRoutes: Routes = [
  // 1) your auth flow
  {
    path: 'auth',
    loadChildren: () => import('./app/pages/auth/auth.routes').then(m => m.default)
  },

  // 2) the protected shell
  {
    path: '',
    component: AppLayout,
    canMatch: [ authGuard ],
    children: [
      // 2a) default child → dashboard
      { path: '',          component: Dashboard },

      // 2b) all your feature pages under the same prefix
      { path: 'dashboard', component: Dashboard },
      { path: 'invoices',  component: InvoiceComponent },
      { path: 'transactions', component: TransactionsComponent },
      {
        path: 'uikit',
        loadChildren: () => import('./app/pages/uikit/uikit.routes').then(m => m.default)
      },
      { path: 'documentation', component: Documentation },
      {
        path: 'pages',
        loadChildren: () => import('./app/pages/pages.routes').then(m => m.default)
      }
    ]
  },

  // 3) stand-alone landing & 404
  { path: 'landing',  component: Landing },
  { path: 'notfound', component: Notfound },

  // 4) anything else → 404
  { path: '**', redirectTo: 'notfound' }
];
