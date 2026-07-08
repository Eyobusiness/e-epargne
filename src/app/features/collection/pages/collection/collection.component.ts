import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { CollectionService } from '../../services/collection.service';
import { Collection } from '../../models/collection.model';
import { ToastService } from '../../../../core/services/toast.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/app-empty-state/app-empty-state.component';
import { ResolveUserPipe } from '../../../../shared/pipes/resolve-user.pipe';

import { AppPaginationComponent } from '../../../../shared/ui/app-pagination/app-pagination.component';

@Component({
  selector: 'app-collection-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppPageHeaderComponent,
    AppEmptyStateComponent,
    ResolveUserPipe,
    AppPaginationComponent,
  ],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css'],
})
export class CollectionComponent implements OnInit {
  private readonly collectionService = inject(CollectionService);
  private readonly toastService      = inject(ToastService);
  private readonly notifService      = inject(NotificationService);

  // ─── État principal ──────────────────────────────────────────────────────
  // L'agent est embarqué dans chaque item → plus besoin de charger les adhérents
  readonly collections   = signal<Collection[]>([]);
  readonly isPageLoading = signal(false);
  readonly actionLoading = signal<string | null>(null);

  // ─── Pagination serveur ──────────────────────────────────────────────────
  readonly currentPage = signal(1);
  readonly pageSize    = 10;
  readonly totalItems  = signal(0);
  readonly totalPages  = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize)));

  // ─── Compteurs par statut (sur la page courante) ─────────────────────────
  readonly pendingCount   = computed(() => this.collections().filter(c => c.status === '100' || c.status === '110').length);
  readonly validatedCount = computed(() => this.collections().filter(c => c.status === '200').length);
  readonly rejectedCount  = computed(() => this.collections().filter(c => c.status === '300').length);

  // ─── Filtres ─────────────────────────────────────────────────────────────
  readonly search       = signal('');
  readonly filterStatus = signal('');
  readonly startDate    = signal('');
  readonly endDate      = signal('');

  // ─── Modale de confirmation ──────────────────────────────────────────────
  readonly confirmItem   = signal<Collection | null>(null);
  readonly confirmAction = signal<'validate' | 'reject' | null>(null);

  // ─── Init ────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadCollections();
  }

  // ─── Chargement ──────────────────────────────────────────────────────────
  loadCollections(): void {
    this.isPageLoading.set(true);

    this.collectionService
      .getCollections({
        page:      this.currentPage(),
        limit:     this.pageSize,
        search:    this.search()       || undefined,
        status:    this.filterStatus() || undefined,
        startDate: this.startDate()    || undefined,
        endDate:   this.endDate()      || undefined,
      })
      .pipe(finalize(() => this.isPageLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.collections.set(res?.data?.items ?? []);
          this.totalItems.set(res?.meta?.total ?? 0);
        },
        error: (err) => {
          this.collections.set([]);
          this.toastService.show(
            this.extractErrorMessage(err) || 'Erreur lors du chargement des collectes',
            'error'
          );
        },
      });
  }

  // ─── Helpers agent (embarqué dans la réponse) ────────────────────────────
  agentName(item: Collection): string {
    return item.agent?.name ?? item.agent_id.substring(0, 8) + '…';
  }

  agentPhone(item: Collection): string {
    return item.agent?.phone ?? '';
  }

  agentEmail(item: Collection): string {
    return item.agent?.email ?? '';
  }

  agentInitial(item: Collection): string {
    const name = item.agent?.name ?? 'A';
    return name.charAt(0).toUpperCase();
  }

  // ─── Pagination ──────────────────────────────────────────────────────────
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadCollections();
  }

  // ─── Filtres ─────────────────────────────────────────────────────────────
  onSearch(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
    this.loadCollections();
  }

  onFilterStatus(value: string): void {
    this.filterStatus.set(value);
    this.currentPage.set(1);
    this.loadCollections();
  }

  onDateChange(): void {
    this.currentPage.set(1);
    this.loadCollections();
  }

  resetFilters(): void {
    this.search.set('');
    this.filterStatus.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.currentPage.set(1);
    this.loadCollections();
  }

  // ─── Modale de confirmation ──────────────────────────────────────────────
  askConfirm(item: Collection, action: 'validate' | 'reject'): void {
    this.confirmItem.set(item);
    this.confirmAction.set(action);
  }

  cancelConfirm(): void {
    this.confirmItem.set(null);
    this.confirmAction.set(null);
  }

  doConfirm(): void {
    const item   = this.confirmItem();
    const action = this.confirmAction();
    if (!item || !action) return;
    this.cancelConfirm();
    if (action === 'validate') this.validateCollection(item);
    if (action === 'reject')   this.rejectCollection(item);
  }

  // ─── Valider → status 200 ────────────────────────────────────────────────
  validateCollection(item: Collection): void {
    this.actionLoading.set(item.id);
    this.collectionService
      .activateCollection(item.id)
      .pipe(finalize(() => this.actionLoading.set(null)))
      .subscribe({
        next: (updated) => {
          const agentName = this.agentName(item);
          const amount = item.amount ? ` — ${item.amount} FCFA` : '';
          this.notifService.add({
            type: 'collection',
            action: 'validate',
            title: 'Collecte validée',
            message: `Collecte de ${agentName}${amount} validée avec succès.`,
          });
          this.patchCollection(updated);
          this.toastService.show('✅ Collecte validée avec succès', 'success');
        },
        error: (err) =>
          this.toastService.show(this.extractErrorMessage(err) || 'Erreur lors de la validation', 'error'),
      });
  }

  // ─── Rejeter → status 300 ────────────────────────────────────────────────
  rejectCollection(item: Collection): void {
    this.actionLoading.set(item.id);
    this.collectionService
      .rejectCollection(item.id)
      .pipe(finalize(() => this.actionLoading.set(null)))
      .subscribe({
        next: (updated) => {
          const agentName = this.agentName(item);
          const amount = item.amount ? ` — ${item.amount} FCFA` : '';
          this.notifService.add({
            type: 'collection',
            action: 'reject',
            title: 'Collecte rejetée',
            message: `Collecte de ${agentName}${amount} a été rejetée.`,
          });
          this.patchCollection(updated);
          this.toastService.show('❌ Collecte rejetée', 'warning');
        },
        error: (err) =>
          this.toastService.show(this.extractErrorMessage(err) || 'Erreur lors du rejet', 'error'),
      });
  }

  // ─── Helpers statut ──────────────────────────────────────────────────────
  statusLabel(status: string): string {
    switch (status) {
      case '100': return 'En attente de paiement';
      case '110': return 'En attente de validation';
      case '200': return 'Validé';
      case '300': return 'Rejeté';
      case '400': return 'Supprimé';
      default:    return status;
    }
  }

  statusClass(status: string): string {
    switch (status) {
      case '100': return 'pending';
      case '110': return 'pending-validation';
      case '200': return 'validated';
      case '300': return 'rejected';
      case '400': return 'deleted';
      default:    return '';
    }
  }

  statusIcon(status: string): string {
    switch (status) {
      case '100': return 'bi-cash';
      case '110': return 'bi-hourglass-split';
      case '200': return 'bi-check-circle-fill';
      case '300': return 'bi-x-circle-fill';
      case '400': return 'bi-trash-fill';
      default:    return 'bi-circle';
    }
  }

  isPending(item: Collection): boolean   { return item.status === '100' || item.status === '110'; }
  isValidated(item: Collection): boolean { return item.status === '200'; }
  isRejected(item: Collection): boolean  { return item.status === '300'; }

  canValidate(item: Collection): boolean {
    return item.status === '110';
  }

  canReject(item: Collection): boolean {
    return item.status === '100' || item.status === '110';
  }

  // ─── Mise à jour locale optimiste ────────────────────────────────────────
  private patchCollection(updated: Collection): void {
    this.collections.update(list =>
      list.map(c => (c.id === updated.id ? { ...c, ...updated } : c))
    );
  }

  private extractErrorMessage(error: any): string {
    if (error?.error?.message && Array.isArray(error.error.message)) {
      return error.error.message
        .map((m: any) => (typeof m === 'string' ? m : m?.message ?? JSON.stringify(m)))
        .join(', ');
    }
    return error?.error?.message ?? error?.message ?? '';
  }
}
