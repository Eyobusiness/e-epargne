// components/profil-permissions/profil-permissions.component.ts

import { CommonModule } from '@angular/common';

import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-profil-permissions',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './profil-permissions.component.html',

  styleUrls: ['./profil-permissions.component.css'],
})
export class ProfilPermissionsComponent {
  readonly permissions = input<string[]>([]);

  readonly selected = input<string[]>([]);

  readonly selectedChange = output<string[]>();

  togglePermission(permission: string): void {
    const current = [...this.selected()];

    const exists = current.includes(permission);

    const updated = exists
      ? current.filter((item) => item !== permission)
      : [...current, permission];

    this.selectedChange.emit(updated);
  }

  isChecked(permission: string): boolean {
    return this.selected().includes(permission);
  }
}
