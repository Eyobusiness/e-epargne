import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, computed, input, output, signal } from '@angular/core';
import { FormatMontantPipe } from '../../../../shared/pipes/pipe.component';
import { ChangerDatePipe } from '../../../../shared/pipes/changer-date.pipe';

import { RapportFinancierLigne } from '../../models/rapport-financier-ligne.model';

import { AppPaginationComponent } from '../../../../shared/ui/app-pagination/app-pagination.component';

@Component({
  selector: 'app-rapport-financier-table',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatMontantPipe, ChangerDatePipe, AppPaginationComponent],
  templateUrl: './rapport-financier-table.component.html',
  styleUrls: ['./rapport-financier-table.component.css'],
})
export class RapportFinancierTableComponent {
  readonly lignes = input<RapportFinancierLigne[]>([]);

  readonly search = signal('');

  readonly currentPage = signal(1);

  readonly pageSize = 10;

  readonly startDate = signal('');

  readonly endDate = signal('');

  readonly applyFilter = output<{
    startDate: string;
    endDate: string;
  }>();

  readonly resetFilter = output<void>();

  readonly exportExcel = output<void>();

  readonly exportPdf = output<void>();

  onSearch(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
  }

  onFilter(): void {
    this.applyFilter.emit({
      startDate: this.startDate(),
      endDate: this.endDate(),
    });
  }

  onReset(): void {
    this.startDate.set('');
    this.endDate.set('');

    this.resetFilter.emit();
  }

  onExportExcel(): void {
    this.exportExcel.emit();
  }

  onExportPdf(): void {
    this.exportPdf.emit();
  }

  readonly filteredItems = computed(() => {
    const term = this.search().trim().toLowerCase();

    if (!term) {
      return this.lignes();
    }

    return this.lignes().filter(
      (item) =>
        item.adherent?.toLowerCase().includes(term) ||
        item.type?.toLowerCase().includes(term) ||
        item.statut?.toLowerCase().includes(term),
    );
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize)),
  );

  readonly paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;

    const end = start + this.pageSize;

    return this.filteredItems().slice(start, end);
  });

  }

