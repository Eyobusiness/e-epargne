import { Routes } from '@angular/router';

export const COLLECTION_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Collection' },
    loadComponent: () => import('../pages/collection/collection.component').then((c) => c.CollectionComponent),
  },
];
