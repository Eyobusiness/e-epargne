export interface NavItem {
  label: string;
  icon: string;
  route: string;
  children?: NavItem[];
}

export const MENU_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'bi bi-speedometer2',
    route: '/dashboard',
  },
  {
    label: 'Adherents',
    icon: 'bi bi-people',
    route: '/adherents',
  },
  {
    label: 'Cotisations',
    icon: 'bi bi-cash-stack',
    route: '/cotisations',
  },
  {
    label: 'Cotisation Adherents',
    icon: 'bi bi-cash-stack',
    route: '/cotisation-adherents',
  },
  {
    label: 'Groupes',
    icon: 'bi bi-collection',
    route: '/groupe',
    children: [
      {
        label: 'Liste groupes',
        icon: 'bi bi-list-ul',
        route: '/groupes',
      },
      // {
      //   label: 'Affectations',
      //   icon: 'bi bi-link-45deg',
      //   route: '/groupes/affectations',
      // },
    ],
  },

  // {
  //   label: 'Portefeuille',
  //   icon: 'bi bi-wallet2',
  //   route: '/portefeuille',
  // },
  {
    label: 'Operations',
    icon: 'bi bi-arrow-repeat',
    route: '/operations',
  },
  {
    label: 'Depenses',
    icon: 'bi bi-basket3',
    route: '/depenses',
    children: [
      {
        label: 'Categories',
        icon: 'bi bi-tags',
        route: '/categories',
      },
      {
        label: 'Liste depenses',
        icon: 'bi bi-receipt',
        route: '/depense',
      },
    ],
  },

  {
    label: 'Rapports',
    icon: 'bi bi-graph-up',
    route: '/rapports',
    children: [
      {
        label: 'Rapports financiers',
        icon: 'bi bi-pie-chart',
        route: '/rapport-financiers',
      },
      {
        label: 'Rapports Adhérents',
        icon: 'bi bi-file-earmark-bar-graph',
        route: '/rapport-cotisations',
      },
    ],
  },
  {
    label: 'Notifications',
    icon: 'bi bi-bell',
    route: '/notifications',
  },
  {
    label: 'Utilisateurs',
    icon: 'bi bi-people-fill',
    route: '/utilisateurs',
    children: [
      {
        label: 'Utilisateur',
        icon: 'bi bi-person-add',
        route: '/utilisateur',
      },
      {
        label: 'Profils',
        icon: 'bi bi-shield-fill-check',
        route: '/profil',
      },
    ],
  },
  {
    label: 'Configuration',
    icon: 'bi bi-gear',
    route: '/configuration',
    children: [
      {
        label: 'Wokflow',
        icon: 'bi bi-shuffle',
        route: '/workflow',
      },
      {
        label: 'Plafonds',
        icon: 'bi bi-sliders',
        route: '/plafonds',
      },
      {
        label: 'Collection',
        icon: 'bi bi-collection',
        route: '/collection',
      }
    ],
  },
  {
    label: 'Parametres',
    icon: 'bi bi-gear',
    route: '/parametres',
  },
];
