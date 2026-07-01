import { CommonModule } from '@angular/common';
import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface CommissionFilter {
  search: string;
  type_operation: string;
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
  readonly filterChange = output<CommissionFilter>();

  readonly search = signal('');
  readonly type_operation = signal('');
  readonly status = signal('200'); // '200' = active by default, '' = all

  applyFilters(): void {
    this.filterChange.emit({
      search: this.search(),
      type_operation: this.type_operation(),
      status: this.status(),
    });
  }

  resetFilters(): void {
    this.search.set('');
    this.type_operation.set('');
    this.status.set('200');
    this.applyFilters();
  }
}
