import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Groupe } from '../../../groupes/models/groupe.model';

export interface CommissionFilter {
  search: string;
  type_operation: string;
  groupe_cotisation_id: string;
  status: string;
}

@Component({
  selector: 'app-commission-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './commission-filter.component.html',
  styleUrls: ['./commission-filter.component.css'],
})
export class CommissionFilterComponent {
  readonly groupes = input<Groupe[]>([]);
  readonly filterChange = output<CommissionFilter>();

  readonly search = signal('');
  readonly type_operation = signal('');
  readonly groupe_cotisation_id = signal('');
  readonly status = signal('200'); // '200' = active by default, '' = all

  applyFilters(): void {
    this.filterChange.emit({
      search: this.search(),
      type_operation: this.type_operation(),
      groupe_cotisation_id: this.groupe_cotisation_id(),
      status: this.status(),
    });
  }

  resetFilters(): void {
    this.search.set('');
    this.type_operation.set('');
    this.groupe_cotisation_id.set('');
    this.status.set('200');
    this.applyFilters();
  }
}
