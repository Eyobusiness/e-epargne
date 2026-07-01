// routes/groupes.routes.ts

import { Routes } from '@angular/router';

import { GroupesComponent } from '../pages/groupes/groupes.component';

import { GroupeDetailComponent } from '../pages/groupes-detail/groupe-detail.component';

export const GROUPES_ROUTES: Routes = [
  {
    path: '',
    component: GroupesComponent,
  },

  {
    path: 'commissions',
    loadComponent: () =>
      import('../../commissions/pages/commissions/commissions.component').then(
        (m) => m.CommissionsComponent,
      ),
  },

  {
    path: ':id',
    component: GroupeDetailComponent,
  },
];
