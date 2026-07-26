import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Adherent } from '../../../adherents/models/adherent.model';
import { AppSearchableSelectComponent, SearchableSelectOption } from '../../../../shared/ui/app-searchable-select/app-searchable-select.component';

export interface OperationFilter {
  adherentId: string;
  status: string;
  type: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-operation-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, AppSearchableSelectComponent],
  templateUrl: './operation-filter.component.html',
  styleUrls: ['./operation-filter.component.css'],
})
export class OperationFilterComponent {
  readonly adherents = input<Adherent[]>([]);

  readonly filterChange = output<OperationFilter>();

  readonly adherentSelectOptions = computed<SearchableSelectOption[]>(() =>
    this.adherents().map((adh) => ({
      label: adh.name,
      value: String(adh.id ?? ''),
      subtitle: [adh.matricule, adh.phone].filter(Boolean).join(' • '),
    })),
  );

  readonly adherentId = signal('');

  readonly status = signal('');

  readonly type = signal('');

  readonly startDate = signal('');

  readonly endDate = signal('');

  applyFilters(): void {
    this.filterChange.emit({
      adherentId: this.adherentId(),
      status: this.status(),
      type: this.type(),
      startDate: this.startDate(),
      endDate: this.endDate(),
    });
  }

  resetFilters(): void {
    this.adherentId.set('');
    this.status.set('');
    this.type.set('');
    this.startDate.set('');
    this.endDate.set('');

    this.applyFilters();
  }
}
