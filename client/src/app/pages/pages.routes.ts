import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { InvoiceComponent } from './invoices/invoices'; 

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'Invoice', component: InvoiceComponent },
    { path: '**', redirectTo: '/notfound' }

] as Routes;
