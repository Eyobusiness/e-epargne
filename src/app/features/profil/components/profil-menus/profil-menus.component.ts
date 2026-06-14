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
  // Liste de tous les menus disponibles
  readonly menus = input<any[]>([]);
  
  // Liste des menus déjà sélectionnés pour ce profil
  readonly selectedMenus = input<any[]>([]);
  
  // Émet la nouvelle liste de menus sélectionnés vers le parent
  readonly selectedChange = output<any[]>();

  toggleMenu(menu: any): void {
    const current = [...this.selectedMenus()];
    const exists = current.find((m) => m.id_menu === menu.id);

    const updated = exists 
      ? current.filter((m) => m.id_menu !== menu.id) 
      : [...current, { id_menu: menu.id, name: menu.libelle, permission: '1' }]; // '1' par défaut

    this.selectedChange.emit(updated);
  }

  isChecked(menuId: string): boolean {
    return this.selectedMenus().some((m) => m.id_menu === menuId);
  }
}