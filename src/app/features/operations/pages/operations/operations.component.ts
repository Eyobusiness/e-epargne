import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { Operation } from '../../models/operation.model';
import { OperationService } from '../../services/operation.service';
import { AdherentService } from '../../../adherents/services/adherent.service';

import {
  OperationFilter,
  OperationFilterComponent,
} from '../../components/operation-filter/operation-filter.component';

import { OperationFormComponent } from '../../components/operation-form/operation-form.component';
import { OperationTableComponent } from '../../components/operation-table/operation-table.component';
import { OperationStatsComponent } from '../../components/operation-stats/operation-stats.component';

import { AppModalComponent } from '../../../../shared/ui/app-modal/app-modal.component';
import { AppPaginationComponent } from '../../../../shared/ui/app-pagination/app-pagination.component';
import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { AppConfirmDialogComponent } from '../../../../shared/ui/app-confirm-dialog/app-confirm-dialog.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/app-empty-state/app-empty-state.component';
// import { OperationRejectFormComponent } from '../../components/operation-reject/operation-reject-form.component';



import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-operations',
  standalone: true,
  imports: [
    CommonModule,
    AppModalComponent,
    AppPaginationComponent,
    AppPageHeaderComponent,
    AppConfirmDialogComponent,
    AppEmptyStateComponent,
    OperationFormComponent,
    OperationTableComponent,
    OperationFilterComponent,
    OperationStatsComponent,
    // OperationRejectFormComponent,
  ],
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css'],
})
export class OperationsComponent implements OnInit {
  private readonly service = inject(OperationService);
  private readonly adherentService = inject(AdherentService);
  private readonly toastService = inject(ToastService);

  readonly operations = signal<Operation[]>([]);
  readonly statsOperations = signal<Operation[]>([]);
  readonly adherents = signal<any[]>([]);

  readonly selected = signal<Operation | null>(null);

  readonly isLoading = signal(false);
  readonly isPageLoading = signal(false);
  readonly isDeleteLoading = signal(false);

  readonly isModalOpen = signal(false);
  readonly isDeleteOpen = signal(false);

  readonly currentPage = signal(1);
  readonly itemsPerPage = 10;
  readonly totalItems = signal(0);

  // readonly isRejectOpen = signal(false);

  // readonly isRejectLoading = signal(false);

  readonly filters = signal<OperationFilter>({
    adherentId: '',
    status: '',
    type: '',
    startDate: '',
    endDate: '',
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage)),
  );

  readonly hasMultiplePages = computed(() => this.totalItems() > this.itemsPerPage);

  readonly hasFilteredResults = computed(
    () => !this.isPageLoading() && this.operations().length > 0,
  );

  readonly isEmpty = computed(() => !this.isPageLoading() && this.operations().length === 0);

  ngOnInit(): void {
    this.loadOperations();
    this.loadAdherents();
  }

  loadOperations(): void {
    this.isPageLoading.set(true);

    const filter = this.filters();

    this.service
      .getAll({
        page: this.currentPage(),
        limit: this.itemsPerPage,
        adherentId: filter.adherentId || undefined,
        status: filter.status || undefined,
        type: filter.type || undefined,
        startDate: filter.startDate || undefined,
        endDate: filter.endDate || undefined,
      })
      .pipe(finalize(() => this.isPageLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.operations.set(response?.data?.items ?? []);
          this.totalItems.set(response?.meta?.total ?? 0);
        },
        error: () => {
          this.operations.set([]);
          this.totalItems.set(0);

          this.toastService.show('Erreur chargement opérations', 'error');
        },
      });

    this.service
      .getAll({
        page: 1,
        limit: 100000,
        adherentId: filter.adherentId || undefined,
        status: filter.status || undefined,
        type: filter.type || undefined,
        startDate: filter.startDate || undefined,
        endDate: filter.endDate || undefined,
      })
      .subscribe({
        next: (response) => {
          this.statsOperations.set(response?.data?.items ?? []);
        },
        error: () => {
          this.statsOperations.set([]);
        },
      });
  }

  loadAdherents(): void {
    this.adherentService.getAll(1, 100).subscribe({
      next: (response) => {
        this.adherents.set(response?.data?.items ?? []);
      },
      error: () => {
        this.adherents.set([]);
      },
    });
  }

  onFilterChange(filters: OperationFilter): void {
    this.filters.set(filters);
    this.currentPage.set(1);
    this.loadOperations();
  }

  changePage(page: number): void {
    this.currentPage.set(page);
    this.loadOperations();
  }

  openCreateModal(): void {
    this.selected.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(item: Operation): void {
    this.selected.set(item);
    this.isModalOpen.set(true);
  }

  closeModal(force = false): void {
    if (!force && this.isLoading()) {
      return;
    }

    this.selected.set(null);
    this.isModalOpen.set(false);
  }

  save(payload: Operation): void {
    const selected = this.selected();

    if (!selected?.id) {
      return;
    }

    this.isLoading.set(true);

    this.service
      .activate(selected.id, {
        moyen_operation: payload.moyen_operation,
        compte: payload.compte ?? '',
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.closeModal(true);
          this.loadOperations();

          this.toastService.show('Paiement effectué', 'success');
        },

        error: () => {
          this.toastService.show('Erreur lors du paiement', 'error');
        },
      });
  }

  openDeleteDialog(item: Operation): void {
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
      .deactivate(selected.id)
      .pipe(finalize(() => this.isDeleteLoading.set(false)))
      .subscribe({
        next: () => {
          this.closeDeleteDialog(true);

          this.loadOperations();

          this.toastService.show('Paiement annulé', 'success');
        },

        error: (error) => {
          console.error(error);

          this.toastService.show('Erreur annulation', 'error');
        },
      });
  }
  // openRejectDialog(item: Operation): void {
  //   this.selected.set(item);
  //   this.isRejectOpen.set(true);
  // }

  // closeRejectDialog(force = false): void {
  //   if (!force && this.isRejectLoading()) {
  //     return;
  //   }

  //   this.isRejectOpen.set(false);
  // }
  
  
  // reject(payload: { motif: string; description: string }): void {
  //   const selected = this.selected();

  //   if (!selected?.id) {
  //     return;
  //   }

  //   this.isRejectLoading.set(true);

  //   this.service
  //     .reject(selected.id, payload)
  //     .pipe(finalize(() => this.isRejectLoading.set(false)))
  //     .subscribe({
  //       next: () => {
  //         this.closeRejectDialog(true);

  //         this.loadOperations();

  //         this.toastService.show('Opération rejetée', 'success');
  //       },

  //       error: () => {
  //         this.toastService.show('Erreur lors du rejet', 'error');
  //       },
  //     });
  // }


}
