import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import {
  Cotisation,
  CreateCotisationPayload,
  UpdateCotisationPayload,
} from '../../models/cotisation.model';
import { CotisationService } from '../../services/cotisation.service';
import { AdherentService } from '../../../adherents/services/adherent.service';
import {
  CotisationFilter,
  CotisationFilterComponent,
} from '../../components/cotisation-filter/cotisation-filter.component';
import {
  CotisationFormComponent,
  CotisationFormPayload,
} from '../../components/cotisation-form/cotisation-form.component';
import { CotisationTableComponent } from '../../components/cotisation-table/cotisation-table.component';
import { CotisationStatsComponent } from '../../components/cotisation-stats/cotisation-stats.component';
import { AppModalComponent } from '../../../../shared/ui/app-modal/app-modal.component';
import { AppPaginationComponent } from '../../../../shared/ui/app-pagination/app-pagination.component';
import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { AppConfirmDialogComponent } from '../../../../shared/ui/app-confirm-dialog/app-confirm-dialog.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/app-empty-state/app-empty-state.component';
import { ToastService } from '../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../utils/subscription-api.utils';
import { Adherent } from '../../../adherents/models/adherent.model';

@Component({
  selector: 'app-cotisations',
  standalone: true,
  imports: [
    CommonModule,
    AppModalComponent,
    AppPaginationComponent,
    AppPageHeaderComponent,
    AppConfirmDialogComponent,
    AppEmptyStateComponent,
    CotisationFormComponent,
    CotisationTableComponent,
    CotisationFilterComponent,
    CotisationStatsComponent,
  ],
  templateUrl: './cotisations.component.html',
  styleUrls: ['./cotisations.component.css'],
})
export class CotisationsComponent implements OnInit {
  private readonly cotisationService = inject(CotisationService);
  private readonly adherentService = inject(AdherentService);
  private readonly toastService = inject(ToastService);

  readonly cotisations = signal<Cotisation[]>([]);
  readonly adherents = signal<Adherent[]>([]);
  readonly selectedCotisation = signal<Cotisation | null>(null);
  readonly isLoading = signal(false);
  readonly isPageLoading = signal(false);
  readonly isDeleteLoading = signal(false);
  readonly isModalOpen = signal(false);
  readonly isDeleteOpen = signal(false);
  readonly currentPage = signal(1);
  readonly totalItems = signal(0);
  readonly itemsPerPage = 10;

  readonly filters = signal<CotisationFilter>({
    startDate: '',
    endDate: '',
    adherentId: '',
    status: '200',
    search: '',
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage)),
  );

  readonly hasMultiplePages = computed(() => this.totalItems() > this.itemsPerPage);
  readonly hasFilteredResults = computed(
    () => !this.isPageLoading() && this.cotisations().length > 0,
  );
  readonly isFilterEmpty = computed(
    () => !this.isPageLoading() && this.totalItems() > 0 && this.cotisations().length === 0,
  );
  readonly isEmpty = computed(() => !this.isPageLoading() && this.totalItems() === 0);

  ngOnInit(): void {
    this.loadCotisations();
    this.loadAdherents();
  }

  loadCotisations(): void {
    this.isPageLoading.set(true);

    const filter = this.filters();

    this.cotisationService
      .getAll({
        page: this.currentPage(),
        limit: this.itemsPerPage,
        status: filter.status || '200',
        startDate: filter.startDate || undefined,
        endDate: filter.endDate || undefined,
        adherentId: filter.adherentId || undefined,
        search: filter.search || undefined,
      })
      .pipe(finalize(() => this.isPageLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.cotisations.set(response.data?.items ?? []);
          this.totalItems.set(response.meta?.total ?? 0);
        },
        error: (err) => {
          this.cotisations.set([]);
          this.totalItems.set(0);
          this.toastService.show(
            extractApiErrorMessage(err) || 'Erreur chargement cotisations',
            'error',
          );
        },
      });
  }

  loadAdherents(): void {
    this.adherentService.getAll(1, 100).subscribe({
      next: (response) => {
        this.adherents.set(response.data?.items ?? []);
      },
      error: () => {
        this.adherents.set([]);
      },
    });
  }

  onFilterChange(filters: CotisationFilter): void {
    this.filters.set(filters);
    this.currentPage.set(1);
    this.loadCotisations();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
    this.loadCotisations();
  }

  openCreateModal(): void {
    this.selectedCotisation.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(cotisation: Cotisation): void {
    this.selectedCotisation.set(cotisation);
    this.isModalOpen.set(true);
  }

  closeModal(force = false): void {
    if (!force && this.isLoading()) {
      return;
    }

    this.isModalOpen.set(false);
    this.selectedCotisation.set(null);
  }

  saveCotisation(payload: CotisationFormPayload): void {
    if (this.isLoading()) {
      return;
    }

    const selected = this.selectedCotisation();
    this.isLoading.set(true);

    if (selected?.id) {
      this.cotisationService
        .update(selected.id, payload as UpdateCotisationPayload)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: () => {
            this.loadCotisations();
            this.closeModal(true);
            this.toastService.show('Cotisation modifiee', 'success');
          },
          error: (err) => {
            this.toastService.show(
              extractApiErrorMessage(err) || 'Erreur modification cotisation',
              'error',
            );
          },
        });

      return;
    }

    this.cotisationService
      .create(payload as CreateCotisationPayload)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.currentPage.set(1);
          this.loadCotisations();
          this.closeModal(true);
          this.toastService.show('Cotisation ajoutee', 'success');
        },
        error: (err) => {
          this.toastService.show(
            extractApiErrorMessage(err) || 'Erreur creation cotisation',
            'error',
          );
        },
      });
  }

  openDeleteDialog(cotisation: Cotisation): void {
    this.selectedCotisation.set(cotisation);
    this.isDeleteOpen.set(true);
  }

  closeDeleteDialog(force = false): void {
    if (!force && this.isDeleteLoading()) {
      return;
    }

    this.isDeleteOpen.set(false);
  }

  deleteCotisation(): void {
    const cotisation = this.selectedCotisation();

    if (!cotisation?.id) {
      return;
    }

    this.isDeleteLoading.set(true);

    this.cotisationService
      .delete(cotisation.id)
      .pipe(finalize(() => this.isDeleteLoading.set(false)))
      .subscribe({
        next: () => {
          this.closeDeleteDialog(true);
          this.loadCotisations();
          this.toastService.show('Cotisation supprimee', 'success');
        },
        error: (err) => {
          this.toastService.show(
            extractApiErrorMessage(err) || 'Erreur suppression cotisation',
            'error',
          );
        },
      });
  }

  activateCotisation(cotisation: Cotisation): void {
    if (this.isPageLoading() || !cotisation.id) {
      return;
    }

    this.isPageLoading.set(true);

    this.cotisationService
      .activate(cotisation.id, cotisation)
      .pipe(finalize(() => this.isPageLoading.set(false)))
      .subscribe({
        next: () => {
          this.toastService.show('Cotisation activée', 'success');
          this.loadCotisations();
        },
        error: (err) => {
          this.toastService.show(
            extractApiErrorMessage(err) || 'Erreur activation cotisation',
            'error',
          );
        },
      });
  }

  deactivateCotisation(cotisation: Cotisation): void {
    if (this.isPageLoading() || !cotisation.id) {
      return;
    }

    this.isPageLoading.set(true);

    this.cotisationService
      .deactivate(cotisation.id, cotisation)
      .pipe(finalize(() => this.isPageLoading.set(false)))
      .subscribe({
        next: () => {
          this.toastService.show('Cotisation désactivée', 'success');
          this.loadCotisations();
        },
        error: (err) => {
          this.toastService.show(
            extractApiErrorMessage(err) || 'Erreur désactivation cotisation',
            'error',
          );
        },
      });
  }
}
