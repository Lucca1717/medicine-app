import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'my-medications', pathMatch: 'full' },
  {
    path: 'my-medications',
    loadComponent: () => import('./placeholder-page.component').then((m) => m.PlaceholderPageComponent),
    data: { title: 'My Medications' },
  },
  {
    path: 'schedule',
    loadComponent: () => import('./placeholder-page.component').then((m) => m.PlaceholderPageComponent),
    data: { title: 'Schedule' },
  },
  {
    path: 'intake-records',
    loadComponent: () => import('./placeholder-page.component').then((m) => m.PlaceholderPageComponent),
    data: { title: 'Intake' },
  },
  {
    path: 'catalog',
    loadComponent: () => import('./catalog/catalog-page.component').then((m) => m.CatalogPageComponent),
  },
  {
    path: 'units',
    loadComponent: () => import('./catalog/units/units-page.component').then((m) => m.UnitsPageComponent),
  },
  {
    path: 'units/new',
    loadComponent: () =>
      import('./catalog/units/unit-form-page.component').then((m) => m.UnitFormPageComponent),
  },
  {
    path: '**',
    redirectTo: 'my-medications',
  },
];
