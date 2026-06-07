// routes/portefeuilles.routes.ts

import { Routes } from '@angular/router';

import { PortefeuilleDetailComponent } from '../pages/portefeuille-detail/portefeuille-detail.component';

export const PORTEFEUILLES_ROUTES: Routes = [
  {
    path: ':id',
    component: PortefeuilleDetailComponent,
  },
];
