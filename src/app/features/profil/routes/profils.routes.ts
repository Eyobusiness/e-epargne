// routes/profils.routes.ts

import { Routes } from '@angular/router';

import { ProfilesComponent } from '../pages/profils/profils.component';

// import { ProfilDetailComponent } from '../pages/profil-detail/profil-detail.component';

export const PROFILS_ROUTES: Routes = [
  {
    path: '',
    component: ProfilesComponent,
  },

  // {
  //   path: ':id',
  //   component: ProfilDetailComponent,
  // },
];
