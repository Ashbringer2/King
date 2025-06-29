// src/app.routes.ts
import { Routes } from '@angular/router';
import { AppLayout }        from './app/layout/component/app.layout';
import { Dashboard }        from './app/pages/dashboard/dashboard';
import { Documentation }    from './app/pages/documentation/documentation';
import { Landing }          from './app/pages/landing/landing';
import { Notfound }         from './app/pages/notfound/notfound';

import { InvoiceComponent } from './app/pages/invoices/invoices';
import { TransactionsComponent } from './app/pages/transaction/transactions';

export const appRoutes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      { path: '',             component: Dashboard },
      { path: 'invoices',     component: InvoiceComponent },
      { path: 'invoices/transacion', component: TransactionsComponent },
      { path: 'uikit',        loadChildren: () => import('./app/pages/uikit/uikit.routes') },
      { path: 'documentation',component: Documentation },
      { path: 'pages',        loadChildren: () => import('./app/pages/pages.routes') }
    ]
  },
  { path: 'landing',   component: Landing },
  { path: 'notfound',  component: Notfound },
  { path: 'auth',      loadChildren: () => import('./app/pages/auth/auth.routes') },
  { path: '**',        redirectTo: '/notfound' }
];
