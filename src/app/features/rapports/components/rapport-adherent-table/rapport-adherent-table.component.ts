import { CommonModule } from '@angular/common';
import { Component, computed, input, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FormatMontantPipe } from '../../../../shared/pipes/pipe.component';

import { RapportAdherent } from '../../models/rapport-adherent.model';

import { AppPaginationComponent } from '../../../../shared/ui/app-pagination/app-pagination.component';

@Component({
  selector: 'app-rapport-adherent-table',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatMontantPipe, AppPaginationComponent],
  templateUrl: './rapport-adherent-table.component.html',
  styleUrls: ['./rapport-adherent-table.component.css'],
})
export class RapportAdherentTableComponent {
  readonly items = input<RapportAdherent[]>([]);

  readonly search = signal('');

  readonly currentPage = signal(1);

  readonly pageSize = 10;

  onSearch(value: string): void {
    this.search.set(value);

    this.currentPage.set(1);
  }

  readonly groupedItems = computed(() => {
    const map = new Map<string, RapportAdherent>();

    this.items().forEach((item) => {
      const key = `${item.adherentId}-${item.groupeId}`;

      if (!map.has(key)) {
        map.set(key, {
          ...item,
          montantPrevu: Number(item.montantPrevu || 0),
          montantPaye: Number(item.montantPaye || 0),
          montantReste: Number(item.montantReste || 0),
        });
      } else {
        const existing = map.get(key)!;

        existing.montantPrevu += Number(item.montantPrevu || 0);
        existing.montantPaye += Number(item.montantPaye || 0);
        existing.montantReste += Number(item.montantReste || 0);

        existing.tauxRealisation =
          existing.montantPrevu > 0 ? (existing.montantPaye / existing.montantPrevu) * 100 : 0;
      }
    });

    return Array.from(map.values());
  });

  readonly filteredItems = computed(() => {

  const term = this.search().trim().toLowerCase();

  const data = this.groupedItems();

  if (!term) {
    return data;
  }

  return data.filter(
    item =>
      item.nom.toLowerCase().includes(term) ||
      item.matricule.toLowerCase().includes(term) ||
      item.groupe.toLowerCase().includes(term) ||
      item.telephone.toLowerCase().includes(term)
  );
});

  readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize));
  });

  readonly paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;

    const end = start + this.pageSize;

    return this.filteredItems().slice(start, end);
  });

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
  }

  readonly exportExcel = output<void>();

  readonly exportPdf = output<void>();

  onExportExcel(): void {
    this.exportExcel.emit();
  }

  onExportPdf(): void {
    this.exportPdf.emit();
  }
}
