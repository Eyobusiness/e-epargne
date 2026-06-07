// routes/depenses.routes.ts

import { Routes } from '@angular/router';

export const DEPENSES_ROUTES: Routes = [
  {
    path: 'depense',
    title: 'Liste des Depenses',
    loadComponent: () =>
      import('../pages/depenses/depenses.component').then((m) => m.DepensesComponent),
  },

  {
    path: 'categories',
    title: 'Liste des Categories',
    loadComponent: () =>
      import('../pages/categories-depense/categories-depense.component').then(
        (m) => m.CategoriesDepenseComponent,
      ),
  },
];
