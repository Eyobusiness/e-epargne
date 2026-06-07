import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { Profil } from '../../models/profil.model';

@Component({
  selector: 'app-profil-table',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './profil-table.component.html',

  styleUrls: ['./profil-table.component.css'],
})
export class ProfilTableComponent {
  readonly profils = input<Profil[]>([]);

  readonly edit = output<Profil>();

  readonly delete = output<Profil>();

  readonly detail = output<Profil>();

  onEdit(item: Profil): void {
    this.edit.emit(item);
  }

  onDetail(item: Profil): void {
    this.detail.emit(item);
  }

  onDelete(item: Profil): void {
    this.delete.emit(item);
  }

  trackById(index: number, item: Profil): string {
    return item.id ?? index.toString();
  }
}
