import { Component, EventEmitter, Output, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommissionConfig } from '../../models/commission.model';

@Component({
  selector: 'app-commission-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './commission-table.component.html',
  styleUrls: ['./commission-table.component.css'],
})
export class CommissionTableComponent {
  readonly commissions = input<CommissionConfig[]>([]);
  @Output() readonly edit = new EventEmitter<CommissionConfig>();
  @Output() readonly delete = new EventEmitter<CommissionConfig>();
  @Output() readonly toggleStatus = new EventEmitter<CommissionConfig>();

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
      return this.commissions();
    }
    return this.commissions().filter((item) => {
      return (
        (item.libelle ?? '').toLowerCase().includes(term) ||
        (item.type_operation ?? '').toLowerCase().includes(term) ||
        (item.mode_commission ?? '').toLowerCase().includes(term) ||
        (item.valeur !== null && item.valeur !== undefined ? item.valeur.toString().includes(term) : false)
      );
    });
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
