// routes/adherents.routes.ts

import { Routes } from '@angular/router';

export const ADHERENTS_ROUTES: Routes = [

  {
    path: '',
    loadComponent: () =>
      import(
        '../pages/adherents/adherents.component'
      ).then(
        (m) => m.AdherentsComponent,
      ),
  },

  {
    path: ':id',
    loadComponent: () =>
      import(
        '../pages/adherent-detail/adherent-detail.component'
      ).then(
        (m) => m.AdherentDetailComponent,
      ),
  },

];
