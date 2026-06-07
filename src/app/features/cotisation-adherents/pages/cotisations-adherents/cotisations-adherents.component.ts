import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import {
  CotisationAdherent,
  CreateCotisationAdherentPayload,
  GenerateCotisationAdherentPayload,
  UpdateCotisationAdherentPayload,
} from '../../models/cotisation-adherent.model';
import { CotisationAdherentService } from '../../services/cotisation-adherent.service';
import { CotisationService } from '../../../cotisations/services/cotisation.service';
import { AdherentService } from '../../../adherents/services/adherent.service';
import {
  CotisationAdherentFilter,
  CotisationAdherentFilterComponent,
} from '../../components/cotisation-adherent-filter/cotisation-adherent-filter.component';
import {
  CotisationAdherentFormComponent,
  CotisationAdherentFormPayload,
} from '../../components/cotisation-adherent-form/cotisation-adherent-form.component';
import { CotisationAdherentTableComponent } from '../../components/cotisation-adherent-table/cotisation-adherent-table.component';
import { CotisationAdherentStatsComponent } from '../../components/cotisation-adherent-stats/cotisation-adherent-stats.component';
import { CotisationGenerateComponent } from '../cotisation-generate/cotisation-generate.component';
import { AppModalComponent } from '../../../../shared/ui/app-modal/app-modal.component';
import { AppPaginationComponent } from '../../../../shared/ui/app-pagination/app-pagination.component';
import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { AppConfirmDialogComponent } from '../../../../shared/ui/app-confirm-dialog/app-confirm-dialog.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/app-empty-state/app-empty-state.component';
import { ToastService } from '../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../cotisations/utils/subscription-api.utils';
import { Adherent } from '../../../adherents/models/adherent.model';
import { Cotisation } from '../../../cotisations/models/cotisation.model';

@Component({
  selector: 'app-cotisations-adherents',
  standalone: true,
  imports: [
    CommonModule,
    AppModalComponent,
    AppPaginationComponent,
    AppPageHeaderComponent,
    AppConfirmDialogComponent,
    AppEmptyStateComponent,
    CotisationAdherentFormComponent,
    CotisationAdherentTableComponent,
    CotisationAdherentFilterComponent,
    CotisationAdherentStatsComponent,
    CotisationGenerateComponent,
  ],
  templateUrl: './cotisations-adherents.component.html',
  styleUrls: ['./cotisations-adherents.component.css'],
})
export class CotisationsAdherentsComponent implements OnInit {
  private readonly service = inject(CotisationAdherentService);
  private readonly cotisationService = inject(CotisationService);
  private readonly adherentService = inject(AdherentService);
  private readonly toastService = inject(ToastService);

  readonly cotisations = signal<CotisationAdherent[]>([]);
  readonly adherents = signal<Adherent[]>([]);
  readonly cotisationsList = signal<Cotisation[]>([]);
  readonly selected = signal<CotisationAdherent | null>(null);
  readonly isLoading = signal(false);
  readonly isPageLoading = signal(false);
  readonly isDeleteLoading = signal(false);
  readonly isGenerateLoading = signal(false);
  readonly isModalOpen = signal(false);
  readonly isGenerateOpen = signal(false);
  readonly isDeleteOpen = signal(false);
  readonly currentPage = signal(1);
  readonly itemsPerPage = 10;
  readonly totalItems = signal(0);

  readonly filters = signal<CotisationAdherentFilter>({
    startDate: '',
    endDate: '',
    adherentId: '',
    status: '',
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage)),
  );

  readonly hasMultiplePages = computed(() => this.totalItems() > this.itemsPerPage);
  readonly isEmpty = computed(() => !this.isPageLoading() && this.totalItems() === 0);
  readonly hasFilteredResults = computed(
    () => !this.isPageLoading() && this.cotisations().length > 0,
  );
  readonly isFilterEmpty = computed(
    () => !this.isPageLoading() && this.totalItems() > 0 && this.cotisations().length === 0,
  );

  ngOnInit(): void {
    this.loadCotisations();
    this.loadAdherents();
    this.loadCotisationsList();
  }

  loadCotisations(): void {
    this.isPageLoading.set(true);

    const filter = this.filters();

    this.service
      .getAll({
        page: this.currentPage(),
        limit: this.itemsPerPage,
        startDate: filter.startDate || undefined,
        endDate: filter.endDate || undefined,
        adherentId: filter.adherentId || undefined,
        status: filter.status || undefined,
      })
      .pipe(finalize(() => this.isPageLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.cotisations.set(response?.data?.items ?? []);
          this.totalItems.set(response?.meta?.total ?? 0);
        },
        error: (err) => {
          this.cotisations.set([]);
          this.totalItems.set(0);
          this.toastService.show(
            extractApiErrorMessage(err) || 'Erreur chargement paiements',
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

  loadCotisationsList(): void {
    this.cotisationService.getAll({ status: '200', limit: 100, page: 1 }).subscribe({
      next: (response) => {
        this.cotisationsList.set(response?.data?.items ?? []);
      },
      error: () => {
        this.cotisationsList.set([]);
      },
    });
  }

  onFilterChange(filters: CotisationAdherentFilter): void {
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
    this.selected.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(item: CotisationAdherent): void {
    this.selected.set(item);
    this.isModalOpen.set(true);
  }

  closeModal(force = false): void {
    if (!force && this.isLoading()) {
      return;
    }

    this.isModalOpen.set(false);
    this.selected.set(null);
  }

  openGenerateModal(): void {
    this.isGenerateOpen.set(true);
  }

  closeGenerateModal(force = false): void {
    if (!force && this.isGenerateLoading()) {
      return;
    }

    this.isGenerateOpen.set(false);
  }

  generateCotisation(payload: GenerateCotisationAdherentPayload): void {
    this.isGenerateLoading.set(true);

    this.service
      .generate(payload)
      .pipe(finalize(() => this.isGenerateLoading.set(false)))
      .subscribe({
        next: () => {
          this.closeGenerateModal(true);
          this.loadCotisations();
          this.toastService.show('Cotisations generees', 'success');
        },
        error: (err) => {
          this.toastService.show(
            extractApiErrorMessage(err) || 'Erreur generation cotisations',
            'error',
          );
        },
      });
  }

  save(payload: CotisationAdherentFormPayload): void {
    if (this.isLoading()) {
      return;
    }

    const selected = this.selected();
    this.isLoading.set(true);

    if (selected?.id) {
      this.service
        .update(selected.id, payload as UpdateCotisationAdherentPayload)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: () => {
            this.closeModal(true);
            this.toastService.show('Paiement modifie', 'success');
            this.loadCotisations();
          },
          error: (err) => {
            this.toastService.show(
              extractApiErrorMessage(err) || 'Erreur modification paiement',
              'error',
            );
          },
        });

      return;
    }

    this.service
      .create(payload as CreateCotisationAdherentPayload)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.closeModal(true);
          this.toastService.show('Paiement ajoute', 'success');
          this.loadCotisations();
        },
        error: (err) => {
          this.toastService.show(
            extractApiErrorMessage(err) || 'Erreur creation paiement',
            'error',
          );
        },
      });
  }

  openDeleteDialog(item: CotisationAdherent): void {
    this.selected.set(item);
    this.isDeleteOpen.set(true);
  }

  closeDeleteDialog(force = false): void {
    if (!force && this.isDeleteLoading()) {
      return;
    }

    this.isDeleteOpen.set(false);
  }

  delete(): void {
    const selected = this.selected();

    if (!selected?.id) {
      return;
    }

    this.isDeleteLoading.set(true);

    this.service
      .delete(selected.id)
      .pipe(finalize(() => this.isDeleteLoading.set(false)))
      .subscribe({
        next: () => {
          this.closeDeleteDialog(true);
          this.toastService.show('Paiement supprime', 'success');
          this.loadCotisations();
        },
        error: (err) => {
          this.toastService.show(
            extractApiErrorMessage(err) || 'Erreur suppression paiement',
            'error',
          );
        },
      });
  }
}
