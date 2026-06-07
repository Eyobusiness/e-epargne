// pages/groupes/groupes.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { finalize } from 'rxjs';

import { Groupe } from '../../models/groupe.model';

import { GroupeService } from '../../services/groupe.service';

import {
  GroupeFilter,
  GroupeFilterComponent,
} from '../../components/groupe-filter/groupe-filter.component';

import { GroupeFormComponent } from '../../components/groupe-form/groupe-form.component';
import { GroupeTableComponent } from '../../components/groupe-table/groupe-table.component';
import { GroupeStatsComponent } from '../../components/groupe-stats/groupe-stats.component';

import { AppModalComponent } from '../../../../shared/ui/app-modal/app-modal.component';
import { AppPaginationComponent } from '../../../../shared/ui/app-pagination/app-pagination.component';
import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { AppConfirmDialogComponent } from '../../../../shared/ui/app-confirm-dialog/app-confirm-dialog.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/app-empty-state/app-empty-state.component';

import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-groupes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppModalComponent,
    AppPaginationComponent,
    AppPageHeaderComponent,
    AppConfirmDialogComponent,
    AppEmptyStateComponent,
    GroupeFormComponent,
    GroupeTableComponent,
    GroupeFilterComponent,
    GroupeStatsComponent,
  ],
  templateUrl: './groupes.component.html',
  styleUrls: ['./groupes.component.css'],
})
export class GroupesComponent implements OnInit {
  private readonly groupeService = inject(GroupeService);

  private readonly toastService = inject(ToastService);

  private readonly router = inject(Router);

  readonly groupes = signal<Groupe[]>([]);

  readonly selectedGroupe = signal<Groupe | null>(null);

  readonly isLoading = signal(false);

  readonly isPageLoading = signal(false);

  readonly isDeleteLoading = signal(false);

  readonly isModalOpen = signal(false);

  readonly isDeleteOpen = signal(false);

  readonly currentPage = signal(1);

  readonly itemsPerPage = 5;

  readonly filters = signal<GroupeFilter>({
    search: '',
    status: '200',
  });

  readonly filteredGroupes = computed(() => {
    const filter = this.filters();

    return this.groupes().filter((item) => {
      const matchesSearch =
        !filter.search || item.name.toLowerCase().includes(filter.search.toLowerCase());

      const matchesStatus = !filter.status || item.status === filter.status;

      return matchesSearch && matchesStatus;
    });
  });

  readonly totalItems = computed(() => this.filteredGroupes().length);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage)),
  );

  readonly paginatedGroupes = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;

    return this.filteredGroupes().slice(start, start + this.itemsPerPage);
  });

  readonly hasMultiplePages = computed(() => this.totalItems() > this.itemsPerPage);

  readonly hasFilteredResults = computed(
    () => !this.isPageLoading() && this.filteredGroupes().length > 0,
  );

  readonly isFilterEmpty = computed(
    () => this.groupes().length > 0 && this.filteredGroupes().length === 0,
  );

  readonly isEmpty = computed(() => !this.isPageLoading() && this.groupes().length === 0);

  ngOnInit(): void {
    this.loadGroupes();
  }

  loadGroupes(): void {
    this.isPageLoading.set(true);

    this.groupeService
      .getAll('200')
      .pipe(finalize(() => this.isPageLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.groupes.set(response.data?.items ?? []);
        },

        error: () => {
          this.groupes.set([]);
        },
      });
  }

  onFilterChange(filters: GroupeFilter): void {
    this.filters.set(filters);

    this.currentPage.set(1);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
  }

  openCreateModal(): void {
    this.selectedGroupe.set(null);

    this.isModalOpen.set(true);
  }

  openEditModal(groupe: Groupe): void {
    this.selectedGroupe.set(groupe);

    this.isModalOpen.set(true);
  }

  closeModal(force = false): void {
    if (!force && this.isLoading()) {
      return;
    }

    this.isModalOpen.set(false);

    this.selectedGroupe.set(null);
  }

  saveGroupe(payload: Groupe): void {
    if (this.isLoading()) {
      return;
    }

    const selected = this.selectedGroupe();

    this.isLoading.set(true);

    if (selected?.id) {
      this.groupeService
        .update(selected.id, payload)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: () => {
            this.groupes.update((items) =>
              items.map((item) =>
                item.id === selected.id
                  ? {
                      ...item,
                      ...payload,
                    }
                  : item,
              ),
            );

            this.closeModal(true);

            this.toastService.show('Groupe modifie', 'success');
          },

          error: () => {
            this.toastService.show('Erreur modification groupe', 'error');
          },
        });

      return;
    }

    this.groupeService
      .create(payload)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.loadGroupes();
          this.currentPage.set(1);

          this.closeModal(true);

          this.toastService.show('Groupe ajoute', 'success');
        },

        error: () => {
          this.toastService.show('Erreur creation groupe', 'error');
        },
      });
  }

  openDeleteDialog(groupe: Groupe): void {
    this.selectedGroupe.set(groupe);

    this.isDeleteOpen.set(true);
  }

  closeDeleteDialog(force = false): void {
    if (!force && this.isDeleteLoading()) {
      return;
    }

    this.isDeleteOpen.set(false);
  }

  deleteGroupe(): void {
    const groupe = this.selectedGroupe();

    if (!groupe?.id) {
      return;
    }

    this.isDeleteLoading.set(true);

    this.groupeService
      .delete(groupe.id)
      .pipe(finalize(() => this.isDeleteLoading.set(false)))
      .subscribe({
        next: () => {
          this.groupes.update((items) => items.filter((item) => item.id !== groupe.id));

          this.closeDeleteDialog(true);

          this.toastService.show('Groupe supprime', 'success');
        },

        error: () => {
          this.toastService.show('Erreur suppression groupe', 'error');
        },
      });
  }

  viewDetail(groupe: Groupe): void {
    if (!groupe.id) {
      return;
    }

    this.router.navigate(['/groupes', groupe.id]);
  }
}
