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
    path: ':id',
    component: GroupeDetailComponent,
  },
];
