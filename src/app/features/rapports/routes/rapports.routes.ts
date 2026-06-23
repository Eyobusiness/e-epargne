import { Routes } from '@angular/router';

export const RAPPORTS_ROUTES: Routes = [
  {
    path: 'rapport-financiers',
    loadComponent: () =>
      import('../pages/rapport-financier/rapport-financier.component')
        .then((m) => m.RapportFinancierComponent),
  },

  {
    path: 'rapport-cotisations',
    loadComponent: () =>
      import('../pages/rapport-adherents/rapport-adherents.component')
        .then((m) => m.RapportAdherentsComponent),
  },

  // {
  //   path: '',
  //   redirectTo: 'financier',
  //   pathMatch: 'full',
  // },
];
