import { Component, EventEmitter, Output, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectorLimit } from '../../models/plafond.model';

@Component({
  selector: 'app-affectation-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './affectation-table.component.html',
  styleUrls: ['./affectation-table.component.css'],
})
export class AffectationTableComponent {
  readonly affectations = input<CollectorLimit[]>([]);
  @Output() readonly edit = new EventEmitter<CollectorLimit>();
  @Output() readonly delete = new EventEmitter<CollectorLimit>();

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
      return this.affectations();
    }
    return this.affectations().filter((item) =>
      (item.agent?.name ?? '').toLowerCase().includes(term) ||
      (item.profil?.name ?? '').toLowerCase().includes(term) ||
      (item.plafond?.name ?? '').toLowerCase().includes(term) ||
      (item.plafond?.amount ?? '').toString().includes(term)
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
