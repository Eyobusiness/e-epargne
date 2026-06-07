// pages/profils/profils.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Profil } from '../../models/profil.model';

import { ProfilService } from '../../services/profil.service';
import { MenuService } from '../../services/menu.service';

import { ProfilTableComponent } from '../../components/profil-table/profil-table.component';
import { ProfilFormComponent } from '../../components/profil-form/profil-form.component';

import { AppModalComponent } from '../../../../shared/ui/app-modal/app-modal.component';
import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/app-empty-state/app-empty-state.component';
import { AppConfirmDialogComponent } from '../../../../shared/ui/app-confirm-dialog/app-confirm-dialog.component';

import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-profils',
  standalone: true,
  imports: [
    CommonModule,
    AppModalComponent,
    AppPageHeaderComponent,
    AppEmptyStateComponent,
    AppConfirmDialogComponent,
    ProfilTableComponent,
    ProfilFormComponent,
  ],
  templateUrl: './profils.component.html',
  styleUrls: ['./profils.component.css'],
})
export class ProfilsComponent implements OnInit {
  private readonly profilService = inject(ProfilService);
  private readonly menuService = inject(MenuService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly profils = signal<Profil[]>([]);
  readonly menus = signal<any[]>([]);
  readonly selected = signal<Profil | null>(null);

  readonly isLoading = signal(false);
  readonly isPageLoading = signal(false);
  readonly isModalOpen = signal(false);
  readonly isDeleteOpen = signal(false);
  readonly isDeleteLoading = signal(false);
  readonly isAdminLoading = signal(false);

  readonly isEmpty = computed(() => !this.isPageLoading() && this.profils().length === 0);

  ngOnInit(): void {
    this.loadProfils();
    this.loadMenus();
  }

  loadProfils(): void {
    this.isPageLoading.set(true);

    this.profilService
      .getAll()
      .pipe(finalize(() => this.isPageLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.profils.set(response.data.items ?? []);
        },
        error: () => {
          this.toastService.show('Erreur chargement profils', 'error');
        },
      });
  }

  loadMenus(): void {
    this.menuService.getAll().subscribe({
      next: (response: any) => {
        this.menus.set(response.data.items ?? []);
      },
      error: () => {
        this.menus.set([]);
      },
    });
  }

  openCreateModal(): void {
    this.selected.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(item: Profil): void {
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
    const request$ = selected?.id
      ? this.profilService.update(selected.id, payload)
      : this.profilService.create(payload);

    this.isLoading.set(true);

    request$.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        this.closeModal(true);
        this.loadProfils();
        this.toastService.show(selected?.id ? 'Profil modifie' : 'Profil enregistre', 'success');
      },
      error: () => {
        this.toastService.show('Erreur enregistrement profil', 'error');
      },
    });
  }

  generateAdmin(): void {
    if (this.isAdminLoading()) {
      return;
    }

    this.isAdminLoading.set(true);

    this.profilService
      .getAdminProfil({
        code_store: 'TONTINE_APP',
      })
      .pipe(finalize(() => this.isAdminLoading.set(false)))
      .subscribe({
        next: () => {
          this.toastService.show('Profil admin genere', 'success');
          this.loadProfils();
        },
        error: () => {
          this.toastService.show('Erreur generation profil admin', 'error');
        },
      });
  }

  openDeleteDialog(item: Profil): void {
    this.selected.set(item);
    this.isDeleteOpen.set(true);
  }

  closeDeleteDialog(force = false): void {
    if (!force && this.isDeleteLoading()) {
      return;
    }

    this.isDeleteOpen.set(false);

    if (force || !this.isModalOpen()) {
      this.selected.set(null);
    }
  }

  delete(): void {
    const selected = this.selected();

    if (!selected?.id || this.isDeleteLoading()) {
      return;
    }

    this.isDeleteLoading.set(true);

    this.profilService
      .delete(selected.id)
      .pipe(finalize(() => this.isDeleteLoading.set(false)))
      .subscribe({
        next: () => {
          this.closeDeleteDialog(true);
          this.loadProfils();
          this.toastService.show('Profil supprime', 'success');
        },
        error: () => {
          this.toastService.show('Erreur suppression profil', 'error');
        },
      });
  }

  viewDetail(item: Profil): void {
    if (!item.id) {
      return;
    }

    this.router.navigate(['/profil', item.id]);
  }
}
