import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { User } from '../../models/utilisateur.model';

@Component({
  selector: 'app-utilisateur-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './utilisateur-table.component.html',
  styleUrls: ['./utilisateur-table.component.css'],
})
export class UtilisateurTableComponent {
  readonly utilisateurs = input<User[]>([]);

  readonly edit = output<User>();

  readonly delete = output<User>();

  readonly detail = output<User>();

  onEdit(item: User): void {
    this.edit.emit(item);
  }

  onDelete(item: User): void {
    this.delete.emit(item);
  }

  onDetail(item: User): void {
    this.detail.emit(item);
  }

  trackById(index: number, item: User): string {
    return item.id ?? index.toString();
  }
}
