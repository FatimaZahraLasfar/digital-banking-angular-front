import { Routes } from '@angular/router';
import { authGuard } from './security/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.LoginComponent)
  },
  {
    path: 'customers',
    loadComponent: () => import('./customers/customers').then(m => m.CustomersComponent),
    canActivate: [authGuard]
  },
  {
    path: 'accounts',
    loadComponent: () => import('./accounts/accounts').then(m => m.AccountsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'new-customer',
    loadComponent: () => import('./customers/new-customer/new-customer').then(m => m.NewCustomerComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit-customer/:id',
    loadComponent: () => import('./customers/edit-customer/edit-customer').then(m => m.EditCustomerComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'customers',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'customers'
  }
];
