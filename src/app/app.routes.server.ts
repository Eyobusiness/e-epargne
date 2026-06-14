import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'adherents/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'groupes/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'portefeuille/:id',
    renderMode: RenderMode.Server,
  },
  // {
  //   path: 'profil/:id',
  //   renderMode: RenderMode.Server,
  // },
  {
    path: 'workflow/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'utilisateur',
    renderMode: RenderMode.Server,
  },
  {
    path: 'parametres',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
