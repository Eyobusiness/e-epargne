import { Component, EventEmitter, Output, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Plafond } from '../../models/plafond.model';

@Component({
  selector: 'app-plafond-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plafond-table.component.html',
  styleUrls: ['./plafond-table.component.css'],
})
export class PlafondTableComponent {
  readonly plafonds = input<Plafond[]>([]);
  @Output() readonly edit = new EventEmitter<Plafond>();
  @Output() readonly delete = new EventEmitter<Plafond>();
  @Output() readonly toggleStatus = new EventEmitter<Plafond>();

  readonly search = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 5;

  onSearch(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
  }

  readonly filteredItems = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) {
      return this.plafonds();
    }
    return this.plafonds().filter((item) =>
      (item.name ?? '').toLowerCase().includes(term) ||
      (item.description ?? '').toLowerCase().includes(term) ||
      (item.amount ?? '').toString().includes(term)
    );
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize))
  );

  readonly paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredItems().slice(start, start + this.pageSize);
  });

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.currentPage.set(page);
  }
}
