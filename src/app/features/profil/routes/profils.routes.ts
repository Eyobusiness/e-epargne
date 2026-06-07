// routes/profils.routes.ts

import { Routes } from '@angular/router';

import { ProfilsComponent } from '../pages/profils/profils.component';

import { ProfilDetailComponent } from '../pages/profil-detail/profil-detail.component';

export const PROFILS_ROUTES: Routes = [
  {
    path: '',
    component: ProfilsComponent,
  },

  {
    path: ':id',
    component: ProfilDetailComponent,
  },
];
