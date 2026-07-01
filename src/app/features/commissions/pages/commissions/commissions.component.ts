import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { CommissionConfig } from '../../models/commission.model';
import { CommissionService } from '../../services/commission.service';
import { Groupe } from '../../../groupes/models/groupe.model';
import { GroupeService } from '../../../groupes/services/groupe.service';
import { ToastService } from '../../../../core/services/toast.service';

import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { AppModalComponent } from '../../../../shared/ui/app-modal/app-modal.component';
import { AppConfirmDialogComponent } from '../../../../shared/ui/app-confirm-dialog/app-confirm-dialog.component';
import { CommissionTableComponent } from '../../components/commission-table/commission-table.component';
import { CommissionFormComponent } from '../../components/commission-form/commission-form.component';
import { CommissionFilterComponent, CommissionFilter } from '../../components/commission-filter/commission-filter.component';

@Component({
  selector: 'app-commissions-page',
  standalone: true,
  imports: [
    CommonModule,
    AppPageHeaderComponent,
    AppModalComponent,
    AppConfirmDialogComponent,
    CommissionTableComponent,
    CommissionFormComponent,
    CommissionFilterComponent,
  ],
  templateUrl: './commissions.component.html',
  styleUrls: ['./commissions.component.css'],
})
export class CommissionsComponent implements OnInit {
  private readonly commissionService = inject(CommissionService);
  private readonly groupeService = inject(GroupeService);
  private readonly toastService = inject(ToastService);

  readonly commissions = signal<CommissionConfig[]>([]);
  readonly groupes = signal<Groupe[]>([]);

  readonly isLoading = signal(false);
  readonly isPageLoading = signal(false);
  readonly isDeleteLoading = signal(false);

  // Modals state
  readonly isModalOpen = signal(false);
  readonly isDeleteOpen = signal(false);
  readonly selectedCommission = signal<CommissionConfig | null>(null);

  // Filters state
  readonly filters = signal<CommissionFilter>({
    search: '',
    type_operation: '',
    groupe_cotisation_id: '',
    status: '200', // Active by default
  });

  readonly filteredCommissions = computed(() => {
    const f = this.filters();
    return this.commissions().filter((item) => {
      const matchesSearch =
        !f.search ||
        (item.libelle ?? '').toLowerCase().includes(f.search.toLowerCase());

      const matchesType =
        !f.type_operation || item.type_operation === f.type_operation;

      const matchesGroup =
        !f.groupe_cotisation_id ||
        item.groupe_cotisation_id === f.groupe_cotisation_id;

      const matchesStatus = !f.status || item.status === f.status;

      return matchesSearch && matchesType && matchesGroup && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.loadCommissions();
    this.loadGroupes();
  }

  loadCommissions(): void {
    this.isPageLoading.set(true);
    this.commissionService
      .getAll()
      .pipe(finalize(() => this.isPageLoading.set(false)))
      .subscribe({
        next: (data) => this.commissions.set(data),
        error: (err) => {
          this.commissions.set([]);
          this.toastService.show(
            this.extractErrorMessage(err) || 'Erreur lors du chargement des commissions',
            'error'
          );
        },
      });
  }

  loadGroupes(): void {
    this.groupeService.getAll('200').subscribe({
      next: (response) => {
        this.groupes.set(response.data?.items ?? []);
      },
      error: () => this.groupes.set([]),
    });
  }

  onFilterChange(newFilters: CommissionFilter): void {
    this.filters.set(newFilters);
  }

  openCreateModal(): void {
    this.selectedCommission.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(commission: CommissionConfig): void {
    this.selectedCommission.set(commission);
    this.isModalOpen.set(true);
  }

  closeModal(force = false): void {
    if (!force && this.isLoading()) {
      return;
    }
    this.isModalOpen.set(false);
    this.selectedCommission.set(null);
  }

  openDeleteDialog(commission: CommissionConfig): void {
    this.selectedCommission.set(commission);
    this.isDeleteOpen.set(true);
  }

  closeDeleteDialog(): void {
    if (this.isDeleteLoading()) {
      return;
    }
    this.isDeleteOpen.set(false);
    this.selectedCommission.set(null);
  }

  saveCommission(payload: any): void {
    if (this.isLoading()) {
      return;
    }
    this.isLoading.set(true);

    const selected = this.selectedCommission();
    const request$ = selected?.id
      ? this.commissionService.update(selected.id, payload)
      : this.commissionService.create(payload);

    request$.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        this.loadCommissions();
        this.closeModal(true);
        this.toastService.show(
          selected?.id
            ? 'Commission modifiée avec succès'
            : 'Commission créée avec succès',
          'success'
        );
      },
      error: (err) => {
        this.toastService.show(
          this.extractErrorMessage(err) || "Erreur lors de l'enregistrement",
          'error'
        );
      },
    });
  }

  deleteCommission(): void {
    const selected = this.selectedCommission();
    if (!selected?.id || this.isDeleteLoading()) {
      return;
    }
    this.isDeleteLoading.set(true);

    this.commissionService
      .delete(selected.id)
      .pipe(finalize(() => this.isDeleteLoading.set(false)))
      .subscribe({
        next: () => {
          this.loadCommissions();
          this.closeDeleteDialog();
          this.toastService.show('Commission supprimée avec succès', 'success');
        },
        error: (err) => {
          this.toastService.show(
            this.extractErrorMessage(err) || 'Erreur lors de la suppression',
            'error'
          );
        },
      });
  }

  toggleCommissionStatus(commission: CommissionConfig): void {
    if (!commission.id) {
      return;
    }
    const isActivating = commission.status !== '200';
    const request$ = isActivating
      ? this.commissionService.activate(commission.id)
      : this.commissionService.deactivate(commission.id);

    request$.subscribe({
      next: () => {
        this.loadCommissions();
        this.toastService.show(
          isActivating
            ? 'Commission activée avec succès'
            : 'Commission désactivée avec succès',
          'success'
        );
      },
      error: (err) => {
        this.toastService.show(
          this.extractErrorMessage(err) || 'Erreur lors du changement de statut',
          'error'
        );
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
}
