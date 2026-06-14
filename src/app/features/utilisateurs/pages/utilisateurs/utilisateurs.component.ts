// pages/utilisateurs/utilisateurs.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { User } from '../../models/utilisateur.model';
import { UtilisateurService } from '../../services/utilisateur.service';
import { ProfileService } from '../../../profil/services/profil.service';

import { UtilisateurFormComponent } from '../../components/utilisateur-form/utilisateur-form.component';
import { UtilisateurTableComponent } from '../../components/utilisateur-table/utilisateur-table.component';

import {
  UtilisateurFilter,
  UtilisateurFilterComponent,
} from '../../components/utilisateur-filter/utilisateur-filter.component';

import { UtilisateurStatsComponent } from '../../components/utilisateur-stats/utilisateur-stats.component';

import { AppModalComponent } from '../../../../shared/ui/app-modal/app-modal.component';
import { AppPaginationComponent } from '../../../../shared/ui/app-pagination/app-pagination.component';
import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { AppConfirmDialogComponent } from '../../../../shared/ui/app-confirm-dialog/app-confirm-dialog.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/app-empty-state/app-empty-state.component';

import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [
    CommonModule,
    AppModalComponent,
    AppPaginationComponent,
    AppPageHeaderComponent,
    AppConfirmDialogComponent,
    AppEmptyStateComponent,
    UtilisateurFormComponent,
    UtilisateurTableComponent,
    UtilisateurFilterComponent,
    UtilisateurStatsComponent,
  ],
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.css'],
})
export class UtilisateursComponent implements OnInit {
  private readonly service = inject(UtilisateurService);
  private readonly profilService = inject(ProfileService);

  private readonly router = inject(Router);

  private readonly toastService = inject(ToastService);

  readonly utilisateurs = signal<User[]>([]);

  readonly profils = signal<any[]>([]);

  readonly selected = signal<User | null>(null);

  readonly isLoading = signal(false);

  readonly isPageLoading = signal(false);

  readonly isDeleteLoading = signal(false);

  readonly isModalOpen = signal(false);

  readonly isDeleteOpen = signal(false);

  readonly currentPage = signal(1);

  readonly itemsPerPage = 5;

  readonly filter = signal<UtilisateurFilter>({
    status: '',
    search: '',
  });

  readonly filteredUtilisateurs = computed(() => {
    const filter = this.filter();

    const search = filter.search.toLowerCase().trim();

    return this.utilisateurs().filter((item) => {
      const matchesStatus = !filter.status || item.status === filter.status;

      const matchesSearch =
        !search ||
        item.name?.toLowerCase().includes(search) ||
        item.email?.toLowerCase().includes(search) ||
        item.phone?.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  });

  readonly totalItems = computed(() => this.filteredUtilisateurs().length);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage)),
  );

  readonly paginatedUtilisateurs = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;

    return this.filteredUtilisateurs().slice(start, start + this.itemsPerPage);
  });

  readonly hasMultiplePages = computed(() => this.totalItems() > this.itemsPerPage);

  readonly hasFilteredResults = computed(
    () => !this.isPageLoading() && this.filteredUtilisateurs().length > 0,
  );

  readonly isFilterEmpty = computed(
    () => this.utilisateurs().length > 0 && this.filteredUtilisateurs().length === 0,
  );

  readonly isEmpty = computed(() => !this.isPageLoading() && this.utilisateurs().length === 0);

  ngOnInit(): void {
    this.loadUtilisateurs();

    this.loadProfils();
  }

  loadUtilisateurs(): void {
    this.isPageLoading.set(true);

    const currentFilter = this.filter();

    this.service
      .getAll({
        page: this.currentPage(),
        limit: this.itemsPerPage,
        search: currentFilter.search || undefined,
        status: currentFilter.status || '200', // Default status
      })
      .pipe(finalize(() => this.isPageLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.utilisateurs.set(response.data.items ?? []);
        },

        error: (error) => {
          console.error('Erreur chargement utilisateurs:', error);
          this.toastService.show('Erreur chargement utilisateurs', 'error');
        },
      });
  }

  loadProfils(): void {
    this.profilService.getAll().subscribe({
      next: (response) => {
        this.profils.set(response.data.items ?? []);
      },
      error: () => {
        this.profils.set([]);
      },
    });
  }

  onFilterChange(filter: UtilisateurFilter): void {
    this.filter.set(filter);

    this.currentPage.set(1);

    this.loadUtilisateurs();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);

    this.loadUtilisateurs();
  }

  openCreateModal(): void {
    this.selected.set(null);

    this.isModalOpen.set(true);
  }

  openEditModal(item: User): void {
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

  save(payload: any): void {
    if (this.isLoading()) {
      return;
    }

    const selected = this.selected();

    this.isLoading.set(true);

    if (selected?.id) {
      // Mode modification : nettoyer le payload en excluant le password vide
      const updatePayload = { ...payload };
      if (!updatePayload.password || updatePayload.password.trim() === '') {
        delete updatePayload.password;
      }

      this.service
        .update(selected.id, updatePayload)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: () => {
            this.loadUtilisateurs();

            this.closeModal(true);

            this.toastService.show('Utilisateur modifie', 'success');
          },
          error: (error) => {
            const errorMessage = this.extractErrorMessage(error);
            console.error('Erreur modification utilisateur:', error);
            this.toastService.show(errorMessage || 'Erreur modification utilisateur', 'error');
          },
        });

      return;
    }

    this.service
      .create(payload)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.closeModal(true);

          this.toastService.show('Utilisateur ajoute', 'success');

          this.loadUtilisateurs();
        },
        error: (error) => {
          const errorMessage = this.extractErrorMessage(error);
          console.error('Erreur creation utilisateur:', error);
          this.toastService.show(errorMessage || 'Erreur creation utilisateur', 'error');
        },
      });
  }

  private extractErrorMessage(error: any): string {
    // Handle array of error messages
    if (error?.error?.message && Array.isArray(error.error.message)) {
      return error.error.message
        .map((msg: any) => (typeof msg === 'string' ? msg : msg?.message || JSON.stringify(msg)))
        .join(', ');
    }

    // Handle single error message
    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    return '';
  }

  openDeleteDialog(item: User): void {
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
          this.loadUtilisateurs();

          this.closeDeleteDialog(true);

          this.toastService.show('Utilisateur supprime', 'success');
        },
        error: () => {
          this.toastService.show('Erreur suppression utilisateur', 'error');
        },
      });
  }

  viewDetail(item: User): void {
    if (!item.id) {
      return;
    }

    this.router.navigate(['/utilisateur', item.id]);
  }
}
