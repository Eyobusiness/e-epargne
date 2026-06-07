import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { CategorieDepense } from '../../models/categorie-depense.model';
import { CategorieDepenseService } from '../../services/categorie-depense.service';
import { CategorieDepenseFormComponent } from '../../components/categorie-depense-form/categorie-depense-form.component';
import { CategorieDepenseTableComponent } from '../../components/categorie-depense-table/categorie-depense-table.component';
import { AppModalComponent } from '../../../../shared/ui/app-modal/app-modal.component';
import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { AppPaginationComponent } from '../../../../shared/ui/app-pagination/app-pagination.component';
import { AppConfirmDialogComponent } from '../../../../shared/ui/app-confirm-dialog/app-confirm-dialog.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/app-empty-state/app-empty-state.component';
import { ToastService } from '../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../utils/depense-api.utils';

@Component({
  selector: 'app-categories-depense',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppModalComponent,
    AppPageHeaderComponent,
    AppPaginationComponent,
    AppConfirmDialogComponent,
    AppEmptyStateComponent,
    CategorieDepenseFormComponent,
    CategorieDepenseTableComponent,
  ],
  templateUrl: './categories-depense.component.html',
  styleUrls: ['./categories-depense.component.css'],
})
export class CategoriesDepenseComponent implements OnInit {
  private readonly categorieService = inject(CategorieDepenseService);
  private readonly toastService = inject(ToastService);

  readonly categories = signal<CategorieDepense[]>([]);
  readonly selectedCategorie = signal<CategorieDepense | null>(null);
  readonly isLoading = signal(false);
  readonly isPageLoading = signal(false);
  readonly isDeleteLoading = signal(false);
  readonly isModalOpen = signal(false);
  readonly isDeleteOpen = signal(false);
  readonly search = signal('');
  readonly currentPage = signal(1);
  readonly itemsPerPage = 10;

  readonly filteredCategories = computed(() => {
    const query = this.search().toLowerCase().trim();

    return this.categories().filter((item) => {
      const name = (item.name ?? '').toString().toLowerCase();
      const code = (item.code ?? '').toString().toLowerCase();

      return name.includes(query) || code.includes(query);
    });
  });

  readonly totalItems = computed(() => this.filteredCategories().length);
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage)),
  );

  readonly paginatedCategories = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredCategories().slice(start, start + this.itemsPerPage);
  });

  readonly hasFilteredResults = computed(
    () => !this.isPageLoading() && this.filteredCategories().length > 0,
  );
  readonly hasMultiplePages = computed(() => this.totalItems() > this.itemsPerPage);
  readonly isEmpty = computed(() => !this.isPageLoading() && this.categories().length === 0);
  readonly isFilterEmpty = computed(
    () => this.hasStoredCategories() && this.filteredCategories().length === 0,
  );
  readonly hasStoredCategories = computed(
    () => !this.isPageLoading() && this.categories().length > 0,
  );

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isPageLoading.set(true);

    this.categorieService
      .getAll(1, 100)
      .pipe(finalize(() => this.isPageLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.categories.set(response?.data?.items ?? []);
          this.syncCurrentPage();
        },
        error: (err) => {
          this.toastService.show(
            extractApiErrorMessage(err) || 'Erreur chargement categories',
            'error',
          );
        },
      });
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
  }

  openCreateModal(): void {
    this.selectedCategorie.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(categorie: CategorieDepense): void {
    this.selectedCategorie.set(categorie);
    this.isModalOpen.set(true);
  }

  closeModal(force = false): void {
    if (!force && this.isLoading()) {
      return;
    }

    this.isModalOpen.set(false);
    this.selectedCategorie.set(null);
  }

  openDeleteDialog(categorie: CategorieDepense): void {
    this.selectedCategorie.set(categorie);
    this.isDeleteOpen.set(true);
  }

  closeDeleteDialog(force = false): void {
    if (!force && this.isDeleteLoading()) {
      return;
    }

    this.isDeleteOpen.set(false);
  }

  deleteCategorie(): void {
    const categorie = this.selectedCategorie();

    if (!categorie?.id || this.isDeleteLoading()) {
      return;
    }

    this.isDeleteLoading.set(true);

    this.categorieService
      .delete(categorie.id)
      .pipe(finalize(() => this.isDeleteLoading.set(false)))
      .subscribe({
        next: () => {
          this.categories.update((items) => items.filter((item) => item.id !== categorie.id));
          this.syncCurrentPage();
          this.closeDeleteDialog(true);
          this.toastService.show('Categorie supprimee', 'success');
        },
        error: (err) => {
          this.toastService.show(
            extractApiErrorMessage(err) || 'Erreur suppression categorie',
            'error',
          );
        },
      });
  }

  saveCategorie(payload: CategorieDepense): void {
    const selected = this.selectedCategorie();

    if (this.isLoading()) {
      return;
    }

    const { status: _status, id: _id, created_at, updated_at, deleted_at, ...body } =
      payload as CategorieDepense & {
        created_at?: string;
        updated_at?: string;
        deleted_at?: string | null;
      };

    this.isLoading.set(true);

    if (selected?.id) {
      this.categorieService
        .update(selected.id, body)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: () => {
            this.loadCategories();
            this.closeModal(true);
            this.toastService.show('Categorie modifiee', 'success');
          },
          error: (err) => {
            this.toastService.show(
              extractApiErrorMessage(err) || 'Erreur modification categorie',
              'error',
            );
          },
        });

      return;
    }

    this.categorieService
      .create(body)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.loadCategories();
          this.currentPage.set(1);
          this.closeModal(true);
          this.toastService.show('Categorie creee', 'success');
        },
        error: (err) => {
          this.toastService.show(
            extractApiErrorMessage(err) || 'Erreur creation categorie',
            'error',
          );
        },
      });
  }

  private syncCurrentPage(): void {
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }
}
