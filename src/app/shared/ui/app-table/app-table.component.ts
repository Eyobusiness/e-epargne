import { Component, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableFilter {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date';
  options?: { label: string; value: any }[];
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app-table.component.html',
  styleUrls: ['./app-table.component.css'],
})
export class AppTableComponent {
  readonly columns = input<string[]>([]);
  readonly data = input<Record<string, unknown>[]>([]);
  readonly filters = input<TableFilter[]>([]);
  readonly showSearch = input(true);
  readonly stripedRows = input(true);

  readonly searchQuery = signal('');
  readonly filterValues = signal<Record<string, any>>({});
  readonly edit = output<any>();

  readonly remove = output<any>();

  readonly filteredData = computed(() => {
    let result = this.data();

    // Apply search
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter((row) => {
        return this.columns().some((column) => String(row[column]).toLowerCase().includes(query));
      });
    }

    // Apply filters
    const filters = this.filterValues();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((row) => row[key] === value);
      }
    });

    return result;
  });

  onFilterChange(filterKey: string, value: any): void {
    const current = this.filterValues();
    this.filterValues.set({ ...current, [filterKey]: value });
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterValues.set({});
  }

  hasActiveFilters(): boolean {
    return this.searchQuery().length > 0 || Object.values(this.filterValues()).some((v) => v);
  }

  hasActionsColumn(column: string): boolean {
    return column === 'actions';
  }

 
}

