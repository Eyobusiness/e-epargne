import { Component, computed, inject, input, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MENU_ITEMS, NavItem } from '../../../core/constants/menu.constants';
import { MenuService } from '../../../core/services/menu.service';

const REFERENCE_ROUTE_MAP: Record<string, string> = {
  'dashboard': '/dashboard',
  'adherents': '/adherents',
  'cotisations': '/cotisations',
  'cotisation-adherents': '/cotisation-adherents',
  'groupes': '/groupes',
  'main_groupes': '/groupes',
  'main_operations': '/operations',
  'operations': '/operations',
  'operations_depot_view': '/operations',
  'operations_retrait_view': '/operations',
  'main_depenses': '/depense',
  'depenses': '/depense',
  'depense': '/depense',
  'categories': '/categories',
  'main_rapports': '/rapports',
  'rapports': '/rapport-cotisations',
  'rapports_create_view': '/rapport-cotisations',
  'rapports_retrait_view': '/rapport-financiers',
  'rapports_depot_view': '/rapport-financiers',
  'legacy_sous_rapport_31afcc': '/rapport-financiers',
  'legacy_sous_rapport_998ac5': '/rapport-financiers',
  'legacy_sous_rapport_6b791e': '/rapport-financiers',
  'legacy_sous_rapport_071052': '/rapport-financiers',
  'notifications': '/notifications',
  'legacy_menu_profils': '/profil',
  'legacy_sous_profils_31afce': '/profil',
  'legacy_sous_profils_071054': '/profil',
  'legacy_sous_utilisateurs_071053': '/utilisateur',
  'legacy_sous_utilisateurs_31afcf': '/utilisateur',
  'main_works': '/workflow',
  'works': '/workflow',
  'works_associer_view': '/workflow',
  'main_plafons_associer': '/plafonds',
  'associations': '/plafonds',
  'associations_update_view': '/plafonds',
  'associations_create_view': '/plafonds',
  'associations_delete_view': '/plafonds',
  'main_collectes': '/collection',
  'collectes': '/collection',
  'collectes_create_view': '/collection',
  'main_plafons': '/plafonds',
  'plafons': '/plafonds',
  'plafons_update_view': '/plafonds',
  'plafons_create_view': '/plafonds',
  'plafons_delete_view': '/plafonds',
  'parametres': '/parametres',
  'legacy_menu_parametre': '/parametres',
};

const ICON_MAP: Record<string, string> = {
  'ni ni-settings': 'bi bi-gear',
  'ni ni-vector': 'bi bi-shuffle',
  'ni ni-basket': 'bi bi-basket3',
  'handyman_outlined': 'bi bi-tools',
  'bi bi-speedometer2': 'bi bi-speedometer2',
  'bi bi-people': 'bi bi-people',
  'bi bi-cash-stack': 'bi bi-cash-stack',
  'bi bi-collection': 'bi bi-collection',
  'bi bi-arrow-repeat': 'bi bi-arrow-repeat',
  'bi bi-basket3': 'bi bi-basket3',
  'bi bi-graph-up': 'bi bi-graph-up',
  'bi bi-bell': 'bi bi-bell',
  'bi bi-people-fill': 'bi bi-people-fill',
  'bi bi-gear': 'bi bi-gear',
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly menuService = inject(MenuService);

  isOpen = input<boolean>(false);
  navItems = signal<NavItem[]>([]);
  currentUrl = signal(this.router.url);
  expandedGroups = signal<string[]>(this.getInitialExpandedGroups(this.router.url));

  readonly visibleItems = computed(() => this.navItems());

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = (event as NavigationEnd).urlAfterRedirects;
        this.currentUrl.set(url);
        this.ensureActiveGroupIsOpen(url);
      });
  }

  ngOnInit(): void {
    this.loadMenus();
  }

  loadMenus(): void {
    this.menuService.getMenus().subscribe({
      next: (response) => {
        console.log('API Menus Response:', response);
        let items: any[] = [];
        if (Array.isArray(response)) {
          items = response;
        } else if (response?.data && Array.isArray(response.data)) {
          items = response.data;
        } else if (response?.data?.items && Array.isArray(response.data.items)) {
          items = response.data.items;
        }

        if (items && items.length > 0) {
          const apiItems = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          const mapped = apiItems.map((item) => this.mapApiMenuToNavItem(item));
          this.navItems.set(mapped);
          this.ensureActiveGroupIsOpen(this.currentUrl());
        } else {
          this.navItems.set([]);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des menus API', err);
        this.navItems.set([]);
      }
    });
  }

  toggleGroup(label: string): void {
    this.expandedGroups.update((groups) =>
      groups.includes(label)
        ? groups.filter((group) => group !== label)
        : [...groups, label]
    );
  }

  isGroupExpanded(label: string): boolean {
    return this.expandedGroups().includes(label);
  }

  isItemActive(item: NavItem): boolean {
    if (item.children && item.children.length > 0) {
      return false;
    }
    return this.currentUrl() === item.route || this.currentUrl().startsWith(`${item.route}/`);
  }

  private getInitialExpandedGroups(url: string): string[] {
    return this.navItems()
      .filter((item) => item.children?.some((child) => url.startsWith(child.route) || url.startsWith(item.route)))
      .map((item) => item.label);
  }

  private ensureActiveGroupIsOpen(url: string): void {
    const matchingGroups = this.getInitialExpandedGroups(url);

    if (!matchingGroups.length) {
      return;
    }

    this.expandedGroups.update((groups) => Array.from(new Set([...groups, ...matchingGroups])));
  }

  private mapApiMenuToNavItem(apiItem: any): NavItem {
    const ref = apiItem.reference || '';
    let route = '';

    const pathStr = apiItem.path || '';
    if (pathStr && pathStr !== '#' && !pathStr.startsWith('{{')) {
      route = pathStr.startsWith('/') ? pathStr : '/' + pathStr;
    } else if (REFERENCE_ROUTE_MAP[ref]) {
      route = REFERENCE_ROUTE_MAP[ref];
    } else {
      if (pathStr.includes('dashboard')) route = '/dashboard';
      else if (pathStr.includes('adherent')) route = '/adherents';
      else if (pathStr.includes('cotisation')) route = '/cotisations';
      else if (pathStr.includes('groupe')) route = '/groupes';
      else if (pathStr.includes('operation')) route = '/operations';
      else if (pathStr.includes('depense')) route = '/depense';
      else if (pathStr.includes('categorie')) route = '/categories';
      else if (pathStr.includes('notification')) route = '/notifications';
      else if (pathStr.includes('utilisateur')) route = '/utilisateur';
      else if (pathStr.includes('profil')) route = '/profil';
      else if (pathStr.includes('workflow')) route = '/workflow';
      else if (pathStr.includes('plafond')) route = '/plafonds';
      else if (pathStr.includes('collection')) route = '/collection';
      else if (pathStr.includes('parametre')) route = '/parametres';
      else {
        const match = pathStr.match(/route\('([^']+)'\)/);
        if (match) {
          route = '/' + match[1].replace(/\./g, '/');
        } else if (pathStr && pathStr !== '#' && !pathStr.startsWith('{{')) {
          route = '/' + pathStr.replace(/^\/+/, '');
        } else {
          route = '#';
        }
      }
    }

    let icon = apiItem.icon || 'bi bi-circle';
    if (ICON_MAP[icon]) {
      icon = ICON_MAP[icon];
    } else if (!icon.startsWith('bi bi-')) {
      if (icon.startsWith('ni ni-')) {
        if (icon.includes('settings')) icon = 'bi bi-gear';
        else if (icon.includes('vector')) icon = 'bi bi-shuffle';
        else if (icon.includes('basket')) icon = 'bi bi-basket3';
        else icon = 'bi bi-circle';
      } else {
        icon = 'bi bi-circle';
      }
    }

    const children = apiItem.sousMenus && apiItem.sousMenus.length > 0
      ? apiItem.sousMenus
          .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
          .map((c: any) => this.mapApiMenuToNavItem(c))
      : undefined;

    return {
      label: apiItem.libelle || apiItem.name || '',
      icon: icon,
      route: route,
      children: children
    };
  }
}
