import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Menu } from '../../models/menu.model';

@Component({
  selector: 'app-profile-menu-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-menu-selector.component.html',
  styleUrls: ['./profile-menu-selector.component.css'],
})
export class ProfileMenuSelectorComponent {
  readonly menus = input<Menu[]>([]);

  readonly change = output<Menu[]>();

  readonly permissionLevels = [
    {
      label: 'Création',
      value: '1',
    },
    {
      label: 'Lecture',
      value: '1,2',
    },
    {
      label: 'Modification',
      value: '1,2,3',
    },
    {
      label: 'Suppression',
      value: '1,2,3,4',
    },
    {
      label: 'Accès Total',
      value: '1,2,3,4',
    },
  ];

  onChange(): void {
    this.change.emit(this.menus());
  }

  trackById(index: number, item: Menu): string {
    return item.id ?? index.toString();
  }
}
