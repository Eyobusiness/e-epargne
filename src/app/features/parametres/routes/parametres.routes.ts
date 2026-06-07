import { Routes } from '@angular/router';

export const PARAMETRES_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Parametres' },
    loadComponent: () => import('../pages/parametres.component').then((c) => c.ParametresComponent),
  },
  // {
  //   path: 'mode-paiement',
  //   data: { breadcrumb: 'Mode de paiement' },
  //   loadComponent: () => import('../pages/parametres.component').then((c) => c.ParametresComponent),
  // },
 
];
