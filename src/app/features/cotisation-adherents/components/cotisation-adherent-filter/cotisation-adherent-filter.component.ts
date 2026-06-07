import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Adherent } from '../../../adherents/models/adherent.model';

export interface CotisationAdherentFilter {
  startDate: string;
  endDate: string;
  adherentId: string;
  status: string;
}

@Component({
  selector: 'app-cotisation-adherent-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cotisation-adherent-filter.component.html',
  styleUrls: ['./cotisation-adherent-filter.component.css'],
})
export class CotisationAdherentFilterComponent {
  readonly adherents = input<Adherent[]>([]);
  readonly filterChange = output<CotisationAdherentFilter>();

  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly adherentId = signal('');
  readonly status = signal('200');

  applyFilters(): void {
    this.filterChange.emit({
      startDate: this.startDate(),
      endDate: this.endDate(),
      adherentId: this.adherentId(),
      status: this.status(),
    });
  }

  resetFilters(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.adherentId.set('');
    this.status.set('200');
    this.applyFilters();
  }
}
