import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Operation } from '../../../operations/models/operation.model';
import { FormatMontantPipe } from '@shared/pipes/pipe.component';

@Component({
  selector: 'app-portefeuille-operations',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatMontantPipe],
  templateUrl: './portefeuille-operations.component.html',
  styleUrls: ['./portefeuille-operations.component.css'],
})
export class PortefeuilleOperationsComponent {
  readonly operations = input<Operation[]>([]);

  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly type_operation = signal('');

  readonly currentPage = signal(1);

  readonly itemsPerPage = 10;

  readonly filteredOperations = computed(() => {
    const start = this.startDate();
    const end = this.endDate();

    return this.operations().filter((item) => {
      const operationDate = new Date(item.date_operation);

      const matchStart = !start || operationDate >= new Date(start);

      const matchEnd = !end || operationDate <= new Date(end);

      const matchType = !this.type_operation() || item.type_operation === this.type_operation();

      return matchStart && matchEnd && matchType;
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredOperations().length / this.itemsPerPage)),
  );

  readonly paginatedOperations = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;

    return this.filteredOperations().slice(start, start + this.itemsPerPage);
  });

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
  }

  applyFilter(): void {
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.type_operation.set('');
    this.currentPage.set(1);
  }

  trackById(index: number, item: Operation): string {
    return item.id ?? index.toString();
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case '200':
        return 'Payé';

      case '100':
        return 'En attente';

      case '300':
        return 'Annulé';

      default:
        return '--';
    }
  }
}
