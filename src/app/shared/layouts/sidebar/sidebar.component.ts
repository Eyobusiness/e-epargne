import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MENU_ITEMS, NavItem } from '../../../core/constants/menu.constants';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  private readonly router = inject(Router);

  isOpen = input<boolean>(false);
  navItems = MENU_ITEMS;
  currentUrl = signal(this.router.url);
  expandedGroups = signal<string[]>(this.getInitialExpandedGroups(this.router.url));

  readonly visibleItems = computed(() => this.navItems);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = (event as NavigationEnd).urlAfterRedirects;
        this.currentUrl.set(url);
        this.ensureActiveGroupIsOpen(url);
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
    return this.currentUrl() === item.route || this.currentUrl().startsWith(`${item.route}/`);
  }

  private getInitialExpandedGroups(url: string): string[] {
    return this.navItems
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
}
