import { Routes } from '@angular/router';
import { Access } from './access';
import { Login }  from './login';
import { Error }  from './error';

const routes: Routes = [
  // when user hits “/” → send to /login
  { path: '',       redirectTo: 'login', pathMatch: 'full' },

  // your existing pages
  { path: 'login',  component: Login },
  { path: 'access', component: Access },
  { path: 'error',  component: Error },

  // anything else → back to login
  { path: '**',     redirectTo: 'login' }
];

export default routes;
