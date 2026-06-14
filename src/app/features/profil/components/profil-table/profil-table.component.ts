import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Profile } from '../../models/profil.model';

@Component({
  selector: 'app-profile-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profil-table.component.html',
  styleUrls: ['./profil-table.component.css'],
})
export class ProfileTableComponent {

  readonly profiles = input<Profile[]>([]);

  readonly edit = output<Profile>();

  readonly delete = output<Profile>();

  onEdit(item: Profile): void {
    this.edit.emit(item);
  }

  onDelete(item: Profile): void {
    this.delete.emit(item);
  }

  trackById(index: number, item: Profile): string {
    return item.id ?? index.toString();
  }
}