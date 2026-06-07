import { CommonModule } from '@angular/common';
import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface AdherentFilter {
  search: string;
  status: string;
}

@Component({
  selector: 'app-adherent-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adherent-filter.component.html',
  styleUrls: ['./adherent-filter.component.css'],
})
export class AdherentFilterComponent {
  readonly filterChange = output<AdherentFilter>();

  readonly search = signal('');
  readonly status = signal('');

  applyFilters(): void {
    this.filterChange.emit({
      search: this.search(),
      status: this.status(),
    });
  }

  resetFilters(): void {
    this.search.set('');
    this.status.set('');
    this.applyFilters();
  }
}
