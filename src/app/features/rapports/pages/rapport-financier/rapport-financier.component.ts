import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RapportService } from '../../services/rapport.service';

import { RapportFilter } from '../../models/rapport-filter.model';
import { RapportFinancier } from '../../models/rapport-financier.model';
import { RapportFinancierStatsComponent } from '../../components/rapport-financier-stats/rapport-financier-stats.component';
import { RapportFinancierTableComponent} from'../../components/rapport-financier-table/rapport-financier-table.component';
import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';


@Component({
  selector: 'app-rapport-financier',
  standalone: true,
  imports: [
    CommonModule,
    RapportFinancierStatsComponent,
    RapportFinancierTableComponent,
    AppPageHeaderComponent,
  ],
  templateUrl: './rapport-financier.component.html',
  styleUrls: ['./rapport-financier.component.css'],
})
export class RapportFinancierComponent implements OnInit {
  private readonly rapportService = inject(RapportService);

  readonly isLoading = signal(false);

  readonly rapport = signal<RapportFinancier | null>(null);

  readonly filter = signal<RapportFilter>({
    startDate: '',
    endDate: '',
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    this.rapportService.getRapportFinancier(this.filter()).subscribe({
      next: (data) => {
        this.rapport.set(data);

        this.isLoading.set(false);
      },

      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onFilter(filter: RapportFilter): void {
    this.filter.set(filter);

    this.loadData();
  }

  resetFilters(): void {
    this.filter.set({
      startDate: '',
      endDate: '',
    });

    this.loadData();
  }

  exportExcel(): void {
    console.log('Export Excel Rapport Financier');
  }

  exportPdf(): void {
    console.log('Export PDF Rapport Financier');
  }
}
