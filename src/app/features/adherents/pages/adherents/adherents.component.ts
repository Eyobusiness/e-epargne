import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

import { Adherent, CreateMemberPayload, UpdateMemberPayload } from '../../models/adherent.model';
import { AdherentService } from '../../services/adherent.service';
import {
  AdherentFilter,
  AdherentFilterComponent,
} from '../../components/adherent-filter/adherent-filter.component';
import { AdherentFormComponent, AdherentFormSubmit } from '../../components/adherent-form/adherent-form.component';
import { AdherentTableComponent } from '../../components/adherent-table/adherent-table.component';
import { AppModalComponent } from '../../../../shared/ui/app-modal/app-modal.component';
import { AppPaginationComponent } from '../../../../shared/ui/app-pagination/app-pagination.component';
import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { AppConfirmDialogComponent } from '../../../../shared/ui/app-confirm-dialog/app-confirm-dialog.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/app-empty-state/app-empty-state.component';
import { ToastService } from '../../../../core/services/toast.service';
import { AdherentStatsComponent } from '../../components/adherent-stats/adherent-stats.component';
import { extractApiErrorMessage } from '../../utils/member-api.utils';

@Component({
  selector: 'app-adherents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppModalComponent,
    AppPaginationComponent,
    AppPageHeaderComponent,
    AppConfirmDialogComponent,
    AppEmptyStateComponent,
    AdherentFormComponent,
    AdherentTableComponent,
    AdherentFilterComponent,
    AdherentStatsComponent,
  ],
  templateUrl: './adherents.component.html',
  styleUrls: ['./adherents.component.css'],
})
export class AdherentsComponent implements OnInit {
  private readonly adherentService = inject(AdherentService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly adherents = signal<Adherent[]>([]);
  readonly selectedAdherent = signal<Adherent | null>(null);
  readonly isLoading = signal(false);
  readonly isPageLoading = signal(false);
  readonly isDeleteLoading = signal(false);
  readonly isModalOpen = signal(false);
  readonly isDeleteOpen = signal(false);
  readonly currentPage = signal(1);
  readonly itemsPerPage = 10;

  readonly filters = signal<AdherentFilter>({
    search: '',
    status: '',
  });

  readonly filteredAdherents = computed(() => {
    const filter = this.filters();

    return this.adherents().filter((item) => {
      const query = filter.search.toLowerCase();

      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.phone.toLowerCase().includes(query) ||
        (item.matricule ?? '').toLowerCase().includes(query);

      const matchesStatus = !filter.status || item.status === filter.status;

      return matchesSearch && matchesStatus;
    });
  });

  readonly totalItems = computed(() => this.filteredAdherents().length);
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage)),
  );

  readonly paginatedAdherents = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredAdherents().slice(start, start + this.itemsPerPage);
  });

  readonly hasFilteredResults = computed(
    () => !this.isPageLoading() && this.filteredAdherents().length > 0,
  );
  readonly hasMultiplePages = computed(() => this.totalItems() > this.itemsPerPage);
  readonly isEmpty = computed(() => !this.isPageLoading() && this.adherents().length === 0);
  readonly hasStoredAdherents = computed(
    () => !this.isPageLoading() && this.adherents().length > 0,
  );
  readonly isFilterEmpty = computed(
    () => this.hasStoredAdherents() && this.filteredAdherents().length === 0,
  );

  ngOnInit(): void {
    this.loadAdherents();
  }

  openWallet(adherent: Adherent): void {
    if (!adherent.id) {
      return;
    }

    this.router.navigate(['/portefeuille', adherent.id]);
  }

  loadAdherents(): void {
    this.isPageLoading.set(true);

    this.adherentService
      .getAll(1, 100, this.filters().search)
      .pipe(finalize(() => this.isPageLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.adherents.set(response.data?.items ?? []);
          this.syncCurrentPage();
        },
        error: (err) => {
          this.adherents.set([]);
          this.toastService.show(
            extractApiErrorMessage(err) || 'Erreur chargement adherents',
            'error',
          );
        },
      });
  }

  onFilterChange(filters: AdherentFilter): void {
    this.filters.set(filters);
    this.currentPage.set(1);
    this.loadAdherents();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
  }

  openCreateModal(): void {
    this.selectedAdherent.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(adherent: Adherent): void {
    this.selectedAdherent.set(adherent);
    this.isModalOpen.set(true);
  }

  closeModal(force = false): void {
    if (!force && this.isLoading()) {
      return;
    }

    this.isModalOpen.set(false);
    this.selectedAdherent.set(null);
  }

  saveAdherent(event: AdherentFormSubmit): void {
    if (this.isLoading()) {
      return;
    }

    const selected = this.selectedAdherent();
    this.isLoading.set(true);

    if (selected?.id) {
      this.adherentService
        .update(selected.id, event.payload as UpdateMemberPayload)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: () => {
            this.loadAdherents();
            this.closeModal(true);
            this.toastService.show('Adherent modifie', 'success');
          },
          error: (err) => {
            this.toastService.show(
              extractApiErrorMessage(err) || 'Erreur modification adherent',
              'error',
            );
          },
        });

      return;
    }

    this.adherentService
      .create(event.payload as CreateMemberPayload)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.loadAdherents();
          this.currentPage.set(1);
          this.closeModal(true);
          this.toastService.show('Adherent ajoute', 'success');
        },
        error: (err) => {
          this.toastService.show(
            extractApiErrorMessage(err) || 'Erreur creation adherent',
            'error',
          );
        },
      });
  }

  openDeleteDialog(adherent: Adherent): void {
    this.selectedAdherent.set(adherent);
    this.isDeleteOpen.set(true);
  }

  closeDeleteDialog(force = false): void {
    if (!force && this.isDeleteLoading()) {
      return;
    }

    this.isDeleteOpen.set(false);
  }

  deleteAdherent(): void {
    const adherent = this.selectedAdherent();

    if (!adherent?.id) {
      return;
    }

    this.isDeleteLoading.set(true);

    this.adherentService
      .delete(adherent.id)
      .pipe(finalize(() => this.isDeleteLoading.set(false)))
      .subscribe({
        next: () => {
          this.adherents.update((items) => items.filter((item) => item.id !== adherent.id));
          this.syncCurrentPage();
          this.closeDeleteDialog(true);
          this.toastService.show('Adherent supprime', 'success');
        },
        error: (err) => {
          this.toastService.show(
            extractApiErrorMessage(err) || 'Erreur suppression adherent',
            'error',
          );
        },
      });
  }

  viewDetail(adherent: Adherent): void {
    if (!adherent?.id) {
      return;
    }

    this.router.navigate(['/adherents', adherent.id]);
  }

  private syncCurrentPage(): void {
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }
}
