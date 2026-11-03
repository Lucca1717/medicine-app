import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'my-medications', pathMatch: 'full' },
  {
    path: 'my-medications',
    loadComponent: () => import('./my-medications/my-medications-page.component').then((m) => m.MyMedicationsPageComponent),
  },
  {
    path: 'my-medications/new',
    loadComponent: () => import('./my-medications/user-medication-form-page.component').then((m) => m.UserMedicationFormPageComponent),
  },
  {
    path: 'my-medications/:id/edit',
    loadComponent: () => import('./my-medications/user-medication-form-page.component').then((m) => m.UserMedicationFormPageComponent),
  },
  {
    path: 'schedule',
    loadComponent: () => import('./schedule/schedule-page.component').then((m) => m.SchedulePageComponent),
  },
  {
    path: 'periods/new',
    loadComponent: () =>
      import('./schedule/period-form-page.component').then((m) => m.PeriodFormPageComponent),
  },
  {
    path: 'periods/:id/edit',
    loadComponent: () => import('./schedule/period-form-page.component').then((m) => m.PeriodFormPageComponent),
  },
  {
    path: 'intake-records',
    loadComponent: () => import('./intake/intake-records-page.component').then((m) => m.IntakeRecordsPageComponent),
  },
  {
    path: 'intake-records/new',
    loadComponent: () => import('./intake/intake-record-form-page.component').then((m) => m.IntakeRecordFormPageComponent),
  },
  {
    path: 'intake-records/:id/edit',
    loadComponent: () => import('./intake/intake-record-form-page.component').then((m) => m.IntakeRecordFormPageComponent),
  },
  {
    path: 'catalog',
    loadComponent: () =>
      import('./catalog/catalog-page.component').then((m) => m.CatalogPageComponent),
  },
  {
    path: 'units',
    loadComponent: () =>
      import('./catalog/units/units-page.component').then((m) => m.UnitsPageComponent),
  },
  {
    path: 'units/new',
    loadComponent: () =>
      import('./catalog/units/unit-form-page.component').then((m) => m.UnitFormPageComponent),
  },
  {
    path: 'units/:id/edit',
    loadComponent: () => import('./catalog/units/unit-form-page.component').then((m) => m.UnitFormPageComponent),
  },
  {
    path: 'medications',
    loadComponent: () =>
      import('./catalog/medications/medications-page.component').then((m) => m.MedicationsPageComponent),
  },
  {
    path: 'medications/new',
    loadComponent: () =>
      import('./catalog/medications/medication-form-page.component').then((m) => m.MedicationFormPageComponent),
  },
  {
    path: 'medications/:id/edit',
    loadComponent: () => import('./catalog/medications/medication-form-page.component').then((m) => m.MedicationFormPageComponent),
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users-page.component').then((m) => m.UsersPageComponent),
  },
  {
    path: 'users/new',
    loadComponent: () => import('./users/user-form-page.component').then((m) => m.UserFormPageComponent),
  },
  {
    path: 'users/:id/edit',
    loadComponent: () => import('./users/user-form-page.component').then((m) => m.UserFormPageComponent),
  },
  {
    path: '**',
    redirectTo: 'my-medications',
  },
];
