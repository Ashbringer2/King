import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { InvoiceComponent } from './invoices/invoices';
import { TransactionsComponent } from './transaction/transactions';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'invoices', component: InvoiceComponent },
    { path: 'invoices/transacion', component: TransactionsComponent },
    { path: '**', redirectTo: '/notfound' }

] as Routes;
