import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  /* =====================================================
  MAIN LAYOUT
  ===================================================== */

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layouts/main/main-layout.component').then((m) => m.MainLayoutComponent),

    children: [
      /* =====================================================
      DEFAULT
      ===================================================== */

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      // routes DASHBOARD

      {
        path: 'dashboard',
        title: 'Tableau de bord',
        loadChildren: () =>
          import('./features/dashboard/routes/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      // routes  adherents

      {
        path: 'adherents',
        title: 'Liste des Adherents',
        loadChildren: () =>
          import('./features/adherents/routes/adherents.routes').then((m) => m.ADHERENTS_ROUTES),
      },

      // routes cotisations

      {
        path: 'cotisations',
        title: 'Liste des Cotisations',
        loadChildren: () =>
          import('./features/cotisations/routes/cotisations.routes').then(
            (m) => m.COTISATIONS_ROUTES,
          ),
      },

      // aroutes operation

      {
        path: 'operations',
        title: 'Liste des Operations',
        loadChildren: () =>
          import('./features/operations/routes/operations.routes').then((m) => m.OPERATIONS_ROUTES),
      },

      // routes cotisations-adherents

      {
        path: 'cotisation-adherents',
        title: 'Liste des Cotisations Adherents',
        loadChildren: () =>
          import('./features/cotisation-adherents/routes/cotisations-adherents.routes').then(
            (m) => m.COTISATIONS_ADHERENTS_ROUTES,
          ),
      },

      // routes portefeuilles

      {
        path: 'portefeuille',
        title: 'Portefeuilles',
        loadChildren: () =>
          import('./features/portefeuille/routes/portefeuilles.routes').then(
            (m) => m.PORTEFEUILLES_ROUTES,
          ),
      },

      // routes profil

      {
        path: 'profil',
        loadChildren: () =>
          import('./features/profil/routes/profils.routes').then((m) => m.PROFILS_ROUTES),
      },
      {
        path: 'utilisateur',
        loadChildren: () =>
          import('./features/utilisateurs/routes/utilisateurs.routes').then(
            (m) => m.UTILISATEURS_ROUTES,
          ),
      },

      // Routes groupes
      {
        path: 'groupes',
        loadChildren: () =>
          import('./features/groupes/routes/groupes.routes').then((m) => m.GROUPES_ROUTES),
      },
      //routes  depenses et categories
      {
        path: '',
        loadChildren: () =>
          import('./features/depenses/routes/depenses.routes').then((m) => m.DEPENSES_ROUTES),
      },

      // routes parametres
      {
        path: 'parametres',
        title: 'Liste des Parametres',
        loadChildren: () =>
          import('./features/parametres/routes/parametres.routes').then((m) => m.PARAMETRES_ROUTES),
      },

      //workflow routes 
      {
        path: 'workflow',
        title: 'Workflows',
        loadChildren: () =>
          import('./features/workflow/routes/workflow.routes').then((m) => m.WORKFLOW_ROUTES),
      },

      //change password routes 
      {
        path: 'auth',
        title: 'Changer le mot de passe',
        loadChildren: () =>
          import('./features/auth/routes/auth.routes').then((m) => m.CHANGE_PASSWORD_ROUTE),
      },




    ],

  },

  /* =====================================================
  AUTH LAYOUT
  ===================================================== */

  {
    path: 'auth',

    loadComponent: () =>
      import('./shared/layouts/auth/auth-layout.component').then((m) => m.AuthLayoutComponent),

    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },

      {
        path: '',
        loadChildren: () => import('./features/auth/routes/auth.routes').then((m) => m.AUTH_ROUTES),
      },
    ],
  },

  {
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  /* =====================================================
  ERROR / NOT FOUND
  ===================================================== */

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
