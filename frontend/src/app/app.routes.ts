import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'my-medications', pathMatch: 'full' },
  {
    path: 'my-medications',
    loadComponent: () => import('./app').then((m) => m.App),
  },
  {
    path: '**',
    redirectTo: 'my-medications',
  },
];
