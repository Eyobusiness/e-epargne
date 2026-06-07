import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface DepenseFilter {
  search: string;
  categorieId: string | null;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-depense-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './depense-filter.component.html',
  styleUrls: ['./depense-filter.component.css'],
})
export class DepenseFilterComponent {
  readonly categories = input<any[]>([]);

  readonly filterChange = output<DepenseFilter>();

  readonly search = signal('');

  readonly categorieId = signal<string | null>(null);

  readonly startDate = signal('');

  readonly endDate = signal('');

  applyFilters(): void {
    this.filterChange.emit({
      search: this.search(),
      categorieId: this.categorieId(),
      startDate: this.startDate(),
      endDate: this.endDate(),
    });
  }

  resetFilters(): void {
    this.search.set('');

    this.categorieId.set(null);

    this.startDate.set('');

    this.endDate.set('');

    this.applyFilters();
  }
}
