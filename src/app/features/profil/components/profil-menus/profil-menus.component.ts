// components/profil-menus/profil-menus.component.ts

import { CommonModule } from '@angular/common';

import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-profil-menus',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './profil-menus.component.html',

  styleUrls: ['./profil-menus.component.css'],
})
export class ProfilMenusComponent {
  readonly menus = input<any[]>([]);

  readonly selectedMenus = input<number[]>([]);

  readonly selectedChange = output<number[]>();

  toggleMenu(menuId: number): void {
    const current = [...this.selectedMenus()];

    const exists = current.includes(menuId);

    const updated = exists ? current.filter((id) => id !== menuId) : [...current, menuId];

    this.selectedChange.emit(updated);
  }

  isChecked(menuId: number): boolean {
    return this.selectedMenus().includes(menuId);
  }
}
