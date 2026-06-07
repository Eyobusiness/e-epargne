import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Adherent } from '../../../adherents/models/adherent.model';

export interface CotisationFilter {
  startDate: string;
  endDate: string;
  adherentId: string;
  status: string;
  search: string;
}

@Component({
  selector: 'app-cotisation-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cotisation-filter.component.html',
  styleUrls: ['./cotisation-filter.component.css'],
})
export class CotisationFilterComponent {
  readonly adherents = input<Adherent[]>([]);
  readonly filterChange = output<CotisationFilter>();

  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly adherentId = signal('');
  readonly status = signal('200');
  readonly search = signal('');

  applyFilters(): void {
    this.filterChange.emit({
      startDate: this.startDate(),
      endDate: this.endDate(),
      adherentId: this.adherentId(),
      status: this.status(),
      search: this.search(),
    });
  }

  resetFilters(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.adherentId.set('');
    this.status.set('200');
    this.search.set('');
    this.applyFilters();
  }
}
