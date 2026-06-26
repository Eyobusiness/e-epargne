import { Routes } from '@angular/router';

export const PLAFONDS_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Plafonds' },
    loadComponent: () => import('../pages/plafonds/plafonds.component').then((c) => c.PlafondsComponent),
  },
];
