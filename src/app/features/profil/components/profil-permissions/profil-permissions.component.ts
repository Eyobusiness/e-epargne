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
  // Liste des niveaux possibles
  readonly levels = [
    { label: 'Lecture', value: '1' },
    { label: 'Création', value: '1,2' },
    { label: 'Modification', value: '1,2,3' },
    { label: 'Suppression', value: '1,2,3,4' },
    { label: 'Accès Total', value: '1,2,3,4' },
  ];

  // Valeur actuelle reçue (ex: "1,2,3")
  readonly selectedPermission = input<string>('1');

  // Émet le changement de permission
  readonly permissionChange = output<string>();

  /**
   * Le template attend permissions() qui retourne une liste de valeurs.
   * (ex: ['1','1,2','1,2,3',...])
   */
  permissions(): string[] {
    return this.levels.map((l) => l.value);
  }

  isChecked(item: string): boolean {
    const selected = (this.selectedPermission() ?? '').split(',').map((s) => s.trim());
    return selected.includes(item);
  }

  togglePermission(item: string): void {
    // Les niveaux sont des "paliers". Si l'utilisateur clique un palier,
    // on émet directement sa valeur.
    this.permissionChange.emit(item);
  }

  // Compatibilité avec l'éventuel code existant
  selectPermission(value: string): void {
    this.togglePermission(value);
  }
}
