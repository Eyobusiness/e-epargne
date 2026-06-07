import { CommonModule } from '@angular/common';
import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface UtilisateurFilter {
  status: string;
  search: string;
}

@Component({
  selector: 'app-utilisateur-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilisateur-filter.component.html',
  styleUrls: ['./utilisateur-filter.component.css'],
})
export class UtilisateurFilterComponent {
  readonly filterChange = output<UtilisateurFilter>();

  readonly status = signal('');

  readonly search = signal('');

  applyFilters(): void {
    this.filterChange.emit({
      status: this.status(),
      search: this.search(),
    });
  }

  resetFilters(): void {
    this.status.set('');
    this.search.set('');
    this.applyFilters();
  }
}
