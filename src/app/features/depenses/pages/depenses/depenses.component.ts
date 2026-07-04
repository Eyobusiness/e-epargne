import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Depense } from '../../models/depense.model';
import { CategorieDepense } from '../../models/categorie-depense.model';
import { DepenseService } from '../../services/depense.service';
import { CategorieDepenseService } from '../../services/categorie-depense.service';
import {
  DepenseFilter,
  DepenseFilterComponent,
} from '../../components/depense-filter/depense-filter.component';
import {
  DepenseFormComponent,
  DepenseFormSubmit,
} from '../../components/depense-form/depense-form.component';
import { DepenseTableComponent } from '../../components/depense-table/depense-table.component';
import { DepenseStatsComponent } from '../../components/depense-stats/depense-stats.component';
import { DepenseDetailComponent } from '../../components/depense-detail/depense-detail.component';
import { AppModalComponent } from '../../../../shared/ui/app-modal/app-modal.component';
import { AppPaginationComponent } from '../../../../shared/ui/app-pagination/app-pagination.component';
import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { AppConfirmDialogComponent } from '../../../../shared/ui/app-confirm-dialog/app-confirm-dialog.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/app-empty-state/app-empty-state.component';
import { ToastService } from '../../../../core/services/toast.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { extractApiErrorMessage } from '../../utils/depense-api.utils';
import { DocumentService } from '../../services/document-dpenses.service';

@Component({
  selector: 'app-depenses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppModalComponent,
    AppPaginationComponent,
    AppPageHeaderComponent,
    AppConfirmDialogComponent,
    AppEmptyStateComponent,
    DepenseFormComponent,
    DepenseTableComponent,
    DepenseFilterComponent,
    DepenseStatsComponent,
    DepenseDetailComponent,
  ],
  templateUrl: './depenses.component.html',
  styleUrls: ['./depenses.component.css'],
})
export class DepensesComponent implements OnInit {
  private readonly depenseService = inject(DepenseService);
  private readonly categorieService = inject(CategorieDepenseService);
  private readonly toastService = inject(ToastService);
  private readonly notifService = inject(NotificationService);
  private readonly documentService = inject(DocumentService);

  loadDocument(depenseId: string): void {
    this.documentService.getByParentId(depenseId).subscribe({
      next: (documents) => {
        console.log('DOCUMENTS', documents);
      },
    });
  }

  readonly documentsMap = signal<Record<string, boolean>>({});
 

  readonly depenses = signal<Depense[]>([]);
  readonly categories = signal<CategorieDepense[]>([]);
  readonly selectedDepense = signal<Depense | null>(null);
  readonly detailDepense = signal<Depense | null>(null);
  readonly isLoading = signal(false);
  readonly isPageLoading = signal(false);
  readonly isDeleteLoading = signal(false);
  readonly isModalOpen = signal(false);
  readonly isDetailOpen = signal(false);
  readonly isDeleteOpen = signal(false);
  readonly currentPage = signal(1);
  readonly itemsPerPage = 10;

  readonly filters = signal<DepenseFilter>({
    search: '',
    categorieId: null,
    startDate: '',
    endDate: '',
  });

  readonly filteredDepenses = computed(() => {
    const filter = this.filters();

    return this.depenses().filter((item) => {
      const matchesSearch =
        !filter.search || item.description?.toLowerCase().includes(filter.search.toLowerCase());

      const matchesCategorie =
        !filter.categorieId || item.categorie_depense_id === filter.categorieId;

      const expenseDate = (item.date_depense || item.created_at || '').split('T')[0];

      const matchesStartDate = !filter.startDate || expenseDate >= filter.startDate;
      const matchesEndDate = !filter.endDate || expenseDate <= filter.endDate;

      return matchesSearch && matchesCategorie && matchesStartDate && matchesEndDate;
    });
  });

  readonly totalItems = computed(() => this.filteredDepenses().length);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage)),
  );

  readonly paginatedDepenses = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredDepenses().slice(start, start + this.itemsPerPage);
  });

  readonly hasMultiplePages = computed(() => this.totalItems() > this.itemsPerPage);
  readonly isEmpty = computed(() => !this.isPageLoading() && this.depenses().length === 0);
  readonly hasStoredDepenses = computed(() => !this.isPageLoading() && this.depenses().length > 0);
  readonly hasFilteredResults = computed(
    () => !this.isPageLoading() && this.filteredDepenses().length > 0,
  );
  readonly isFilterEmpty = computed(
    () => this.hasStoredDepenses() && this.filteredDepenses().length === 0,
  );

  ngOnInit(): void {
    this.loadCategories();
    this.loadDepenses();
  }

  loadCategories(): void {
    this.categorieService.getAll(1, 100).subscribe({
      next: (response) => {
        this.categories.set(response?.data?.items ?? []);
      },
      error: () => {
        this.categories.set([]);
      },
    });
  }

  loadDepenses(): void {
    this.isPageLoading.set(true);

    this.depenseService
      .getAll(1, 100)
      .pipe(finalize(() => this.isPageLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.depenses.set(response.data?.items ?? []);

          this.loadDocumentsMap();

          this.syncCurrentPage();
        },
        error: () => {
          this.depenses.set([]);
          this.toastService.show('Erreur chargement depenses', 'error');
        },
      });
  }
  // loadDocuments(depenseId: string): void {
  //   this.documentService.getByParentId(depenseId).subscribe({
  //     next: (documents) => {
  //       this.documents.set(documents);
  //     },

  //     error: () => {
  //       this.documents.set([]);
  //     },
  //   });
  // }

loadDocumentsMap(): void {

  this.depenses().forEach((depense) => {

    if (!depense.id) {
      return;
    }

    this.documentService
      .getByParentId(depense.id)
      .subscribe({

        next: (documents) => {

          this.documentsMap.update(current => ({
            ...current,
            [depense.id!]: documents.length > 0,
          }));

        },

      });

  });

}



  onFilterChange(filters: DepenseFilter): void {
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
    this.selectedDepense.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(depense: Depense): void {
    this.selectedDepense.set(depense);
    this.isModalOpen.set(true);
  }

  openDetailModal(depense: Depense): void {
    if (depense.id) {
      this.loadDocument(depense.id);
    }

    if (!depense.id) {
      this.detailDepense.set(depense);
      this.isDetailOpen.set(true);

      return;
    }

    this.depenseService.getById(depense.id).subscribe({
      next: (response) => {
        this.detailDepense.set(response.data ?? depense);

        this.isDetailOpen.set(true);
      },

      error: () => {
        this.detailDepense.set(depense);
        this.isDetailOpen.set(true);
      },
    });
  }


  closeModal(force = false): void {
    if (!force && this.isLoading()) {
      return;
    }

    this.isModalOpen.set(false);
    this.selectedDepense.set(null);
  }

  closeDetailModal(): void {
    this.isDetailOpen.set(false);
    this.detailDepense.set(null);
  }

  saveDepense(event: DepenseFormSubmit): void {
    if (this.isLoading()) {
      return;
    }

    const selected = this.selectedDepense();
    this.isLoading.set(true);

    if (selected?.id) {
      this.depenseService
        .update(selected.id, event.payload)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: () => {
            const desc = (event.payload as any)?.description ?? selected?.description ?? '';
            this.notifService.add({
              type: 'depense',
              action: 'update',
              title: 'Dépense modifiée',
              message: `${desc || 'La dépense'} a été mise à jour.`,
            });
            this.loadDepenses();
            this.closeModal(true);
            this.toastService.show('Depense modifiee', 'success');
          },
          error: (err) => {
            this.toastService.show(
              extractApiErrorMessage(err) || 'Erreur modification depense',
              'error',
            );
          },
        });

      return;
    }

    this.depenseService
      .create(event.payload)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          const desc = (event.payload as any)?.description ?? '';
          const amount = (event.payload as any)?.montant ? ` — ${(event.payload as any).montant} FCFA` : '';
          this.notifService.add({
            type: 'depense',
            action: 'create',
            title: 'Nouvelle dépense',
            message: `${desc || 'Dépense'}${amount} enregistrée.`,
          });
          this.loadDepenses();
          this.currentPage.set(1);
          this.closeModal(true);
          this.toastService.show('Depense ajoutee', 'success');
        },
        error: (err) => {
          this.toastService.show(extractApiErrorMessage(err) || 'Erreur creation depense', 'error');
        },
      });
  }

  openDeleteDialog(depense: Depense): void {
    this.selectedDepense.set(depense);
    this.isDeleteOpen.set(true);
  }

  closeDeleteDialog(force = false): void {
    if (!force && this.isDeleteLoading()) {
      return;
    }

    this.isDeleteOpen.set(false);
  }

  deleteDepense(): void {
    const depense = this.selectedDepense();

    if (!depense?.id) {
      return;
    }

    this.isDeleteLoading.set(true);

    this.depenseService
      .delete(depense.id)
      .pipe(finalize(() => this.isDeleteLoading.set(false)))
      .subscribe({
        next: () => {
          this.notifService.add({
            type: 'depense',
            action: 'delete',
            title: 'Dépense supprimée',
            message: `${depense.description || 'La dépense'} a été supprimée.`,
          });
          this.depenses.update((items) => items.filter((item) => item.id !== depense.id));
          this.syncCurrentPage();
          this.closeDeleteDialog(true);
          this.toastService.show('Depense supprimee', 'success');
        },
        error: (err) => {
          this.toastService.show(
            extractApiErrorMessage(err) || 'Erreur suppression depense',
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
