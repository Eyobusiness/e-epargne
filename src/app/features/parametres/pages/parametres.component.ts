import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, map, of, switchMap } from 'rxjs';

import { Parametre } from '../models/parametre.models';
import { ParametreService } from '../services/parametre.service';
import { ParametreFormComponent } from '../components/parametre-form/parametre-form.component';
import { ParametreTableComponent } from '../components/parametre-table/parametre-table.component';
import { AppConfirmDialogComponent } from '../../../shared/ui/app-confirm-dialog/app-confirm-dialog.component';
import { AppEmptyStateComponent } from '../../../shared/ui/app-empty-state/app-empty-state.component';
import { AppModalComponent } from '../../../shared/ui/app-modal/app-modal.component';
import { AppPageHeaderComponent } from '../../../shared/ui/app-page-header/app-page-header.component';
import { AppPaginationComponent } from '../../../shared/ui/app-pagination/app-pagination.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppPageHeaderComponent,
    AppModalComponent,
    AppConfirmDialogComponent,
    AppEmptyStateComponent,
    AppPaginationComponent,
    ParametreFormComponent,
    ParametreTableComponent,
  ],
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.css'],
})
export class ParametresComponent implements OnInit {
  private readonly parametreService = inject(ParametreService);
  private readonly toastService = inject(ToastService);

  readonly parametres = signal<Parametre[]>([]);
  readonly selectedParametre = signal<Parametre | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isPageLoading = signal<boolean>(false);
  readonly isDeleteLoading = signal<boolean>(false);
  readonly isModalOpen = signal<boolean>(false);
  readonly isDeleteOpen = signal<boolean>(false);
  readonly search = signal<string>('');
  readonly selectedType = signal<string>('all');
  readonly currentPage = signal<number>(1);
  readonly itemsPerPage = 5;

  readonly filteredParametres = computed(() => {
    const query = this.search().toLowerCase().trim();
    const type = this.selectedType();
    const list = this.parametres() || [];

    return list.filter((item) => {
      if (!item) {
        return false;
      }
      const matchesSearch =
        !query ||
        (item.nom ?? '').toLowerCase().includes(query) ||
        (item.type ?? '').toLowerCase().includes(query) ||
        (item.valeur ?? '').toLowerCase().includes(query) ||
        (item.libelle ?? '').toLowerCase().includes(query);

      const matchesType = type === 'all' || item.type === type;

      return matchesSearch && matchesType;
    });
  });

  readonly totalItems = computed(() => (this.filteredParametres() || []).length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage)));
  readonly paginatedParametres = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;

    return (this.filteredParametres() || []).slice(start, start + this.itemsPerPage);
  });
  readonly isEmpty = computed(() => !this.isPageLoading() && (this.parametres() || []).length === 0);
  readonly hasMultiplePages = computed(() => this.totalItems() > this.itemsPerPage);
  readonly hasStoredParametres = computed(() => !this.isPageLoading() && (this.parametres() || []).length > 0);
  readonly hasFilteredResults = computed(() => !this.isPageLoading() && (this.filteredParametres() || []).length > 0);
  readonly isFilterEmpty = computed(() => this.hasStoredParametres() && (this.filteredParametres() || []).length === 0);
  readonly emptyStateDescription = computed(() => 'Aucun parametre disponible actuellement');

  ngOnInit(): void {
    this.loadParametres();
  }

  loadParametres(): void {
    if (this.isPageLoading()) {
      return;
    }

    this.isPageLoading.set(true);

    this.parametreService
      .getAll()
      .pipe(finalize(() => this.isPageLoading.set(false)))
      .subscribe({
        next: (response) => {
          const items = Array.isArray(response?.data)
            ? response.data
            : (response?.data?.items ?? []);
          this.parametres.set(items);
          this.syncCurrentPage();
        },
        error: () => {
          this.parametres.set([]);
          this.toastService.show('Erreur chargement parametres', 'error');
        },
      });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
  }

  onTypeChange(value: string): void {
    this.selectedType.set(value);
    this.currentPage.set(1);
  }

  openCreateModal(): void {
    this.selectedParametre.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(parametre: Parametre): void {
    this.selectedParametre.set(parametre);
    this.isModalOpen.set(true);
  }

  closeModal(force = false): void {
    if (!force && this.isLoading()) {
      return;
    }

    this.isModalOpen.set(false);
    this.selectedParametre.set(null);
  }

  openDeleteDialog(parametre: Parametre): void {
    this.selectedParametre.set(parametre);
    this.isDeleteOpen.set(true);
  }

  closeDeleteDialog(force = false): void {
    if (!force && this.isDeleteLoading()) {
      return;
    }

    this.isDeleteOpen.set(false);
  }

  deleteParametre(): void {
    const parametre = this.selectedParametre();

    if (!parametre?.id || this.isDeleteLoading()) {
      return;
    }

    this.isDeleteLoading.set(true);

    this.parametreService
      .delete(parametre.id)
      .pipe(finalize(() => this.isDeleteLoading.set(false)))
      .subscribe({
        next: () => {
          this.parametres.update((items) => (items || []).filter((item) => item.id !== parametre.id));
          this.syncCurrentPage();
          this.closeDeleteDialog(true);
          this.closeModal(true);
          this.selectedParametre.set(null);
          this.toastService.show('Parametre supprime avec succes', 'success');
        },
        error: () => {
          this.toastService.show('Erreur suppression parametre', 'error');
        },
      });
  }

  saveParametre(payload: Parametre): void {
    const selected = this.selectedParametre();

    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    const request$ = this.preparePayload(payload).pipe(
      switchMap((preparedPayload) =>
        selected?.id
          ? this.parametreService.update(selected.id, preparedPayload)
          : this.parametreService.create(preparedPayload),
      ),
      finalize(() => this.isLoading.set(false)),
    );

    request$.subscribe({
      next: () => {
        this.loadParametres();
        this.currentPage.set(1);
        this.closeModal(true);
        const msg = selected?.id ? 'Parametre modifie avec succes' : 'Parametre cree avec succes';
        this.toastService.show(msg, 'success');
      },
      error: (error) => {
        const errorMessage = this.extractErrorMessage(error);
        console.error('Erreur enregistrement parametre:', error);
        this.toastService.show(errorMessage || 'Erreur enregistrement parametre', 'error');
      },
    });
  }

  private extractErrorMessage(error: any): string {
    if (error?.error?.message && Array.isArray(error.error.message)) {
      return error.error.message
        .map((msg: any) => (typeof msg === 'string' ? msg : msg?.message || JSON.stringify(msg)))
        .join(', ');
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    return '';
  }

  private preparePayload(payload: Parametre) {
    if (!this.shouldEncrypt(payload.type) || !payload.valeur.trim()) {
      return of(payload);
    }

    return this.parametreService.encrypt(payload).pipe(
      map((response) => ({
        ...payload,
        valeur: this.extractEncryptedValue(response, payload.valeur),
      })),
    );
  }

  private shouldEncrypt(type: string): boolean {
    const normalizedType = type.trim().toUpperCase();

    return normalizedType === 'CRYP' || normalizedType === 'CODE';
  }

  private extractEncryptedValue(response: any, fallback: string): string {
    if (typeof response === 'string' && response.trim()) {
      return response;
    }

    const candidate =
      response?.data?.valeur ??
      response?.data?.value ??
      response?.valeur ??
      response?.value ??
      response?.encryptedValue ??
      response?.data?.encryptedValue;

    return typeof candidate === 'string' && candidate.trim() ? candidate : fallback;
  }

  private syncCurrentPage(): void {
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }
}
