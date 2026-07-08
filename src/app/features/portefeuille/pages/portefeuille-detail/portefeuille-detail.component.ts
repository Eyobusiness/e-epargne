import { FormatMontantPipe } from './../../../../shared/pipes/pipe.component';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

import { Portefeuille } from '../../models/portefeuille.model';
import { PortefeuilleService } from '../../services/portefeuille.service';

import { Operation } from '../../../operations/models/operation.model';
import { OperationService } from '../../../operations/services/operation.service';

import { PortefeuilleStatsComponent } from '../../components/portefeuille-stats/portefeuille-stats.component';

import { PortefeuilleOperationsComponent } from '../../components/portefeuille-operations/portefeuille-operations.component';

import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { AdherentService } from '@features/adherents/services/adherent.service';
import { Adherent } from '@features/adherents/models/adherent.model';
import {RetraitDirectFormComponent } from'../../components/retrait-direct-form/retrait-direct-form.component';
import { ToastService } from '../../../../core/services/toast.service';
import { NotificationService } from '../../../../core/services/notification.service';



@Component({
  selector: 'app-portefeuille-detail',
  standalone: true,
  imports: [
    CommonModule,
    AppPageHeaderComponent,
    PortefeuilleStatsComponent,
    PortefeuilleOperationsComponent,
    RetraitDirectFormComponent,
    FormatMontantPipe,
  ],
  templateUrl: './portefeuille-detail.component.html',
  styleUrls: ['./portefeuille-detail.component.css'],
})
export class PortefeuilleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly portefeuilleService = inject(PortefeuilleService);
  private readonly operationService = inject(OperationService);
  private readonly adherentService = inject(AdherentService);
  private readonly toastService = inject(ToastService);
  private readonly notifService = inject(NotificationService);

  readonly adherentName = computed(() => this.adherent()?.name ?? '--');

  readonly portefeuille = signal<Portefeuille | null>(null);

  readonly operations = signal<Operation[]>([]);
  readonly statsOperations = signal<Operation[]>([]);

  readonly isLoading = signal(false);

  readonly limitpage = 10;

  readonly currentPage = signal(1);

  readonly totalItems = signal(0);
  readonly isActivating = signal(false);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.limitpage)));

  readonly pendingWithdrawals = computed(() =>
    this.operations().filter(
      (operation) => operation.type_operation === 'RETRAIT' && operation.status === '100',
    ),
  );

  readonly pendingWithdrawalsCount = computed(() => this.pendingWithdrawals().length);

  readonly showWithdrawModal = signal(false);

  readonly showDirectWithdrawModal = signal(false);

  readonly adherent = signal<Adherent | null>(null);

  ngOnInit(): void {
    const adherentId = this.route.snapshot.paramMap.get('id');

    if (!adherentId) {
      return;
    }

    this.loadPortefeuille(adherentId);

    this.loadOperations(adherentId);
  }

  activateWithdrawal(operation: Operation): void {
    if (!operation.id) {
      return;
    }

    this.isActivating.set(true);

    this.operationService
      .activate(operation.id, {
        moyen_operation: operation.moyen_operation,

        compte: operation.compte ?? '',
      })
      .pipe(finalize(() => this.isActivating.set(false)))
      .subscribe({
        next: () => {
          const adherentName = this.adherentName();
          const amount = operation.montant ? ` — ${operation.montant} FCFA` : '';
          this.notifService.add({
            type: 'portefeuille',
            action: 'validate',
            title: 'Retrait validé',
            message: `Demande de retrait de ${adherentName}${amount} validée.`,
          });
          const adherentId = this.route.snapshot.paramMap.get('id');
          if (adherentId) {
            this.loadPortefeuille(adherentId);
            this.loadOperations(adherentId);
          }
        },

        error: (error) => {
          console.error(error);
        },
      });
  }

  rejectWithdrawal(operation: Operation): void {
    if (!operation.id) {
      return;
    }

    this.operationService
      .reject(operation.id, {
        motif: 'Retrait rejeté',

        description: "Retrait rejeté par l'administrateur",
      })
      .subscribe({
        next: () => {
          const adherentName = this.adherentName();
          this.notifService.add({
            type: 'portefeuille',
            action: 'reject',
            title: 'Retrait rejeté',
            message: `Demande de retrait de ${adherentName} a été rejetée.`,
          });
          const adherentId = this.route.snapshot.paramMap.get('id');
          if (adherentId) {
            this.loadPortefeuille(adherentId);
            this.loadOperations(adherentId);
          }
        },
      });
  }

  openPendingWithdrawals(): void {
    this.showWithdrawModal.set(true);
  }

  closePendingWithdrawals(): void {
    this.showWithdrawModal.set(false);
  }

  openDirectWithdrawModal(): void {
    this.showDirectWithdrawModal.set(true);
  }

  closeDirectWithdrawModal(): void {
    this.showDirectWithdrawModal.set(false);
  }

  loadAdherent(id: string): void {
    this.adherentService.getById(id).subscribe({
      next: (response) => {
        this.adherent.set(response.adherent);
      },
    });
  }

  loadPortefeuille(adherentId: string): void {
    this.isLoading.set(true);

    this.portefeuilleService
      .getByAdherent(adherentId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.portefeuille.set(response);

          if (response.adherent_id) {
            this.loadAdherent(response.adherent_id);
          }
        },

        error: () => {
          this.portefeuille.set(null);
        },
      });
  }

  loadOperations(adherentId: string): void {
    this.operationService
      .getAll({
        adherentId,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: '',
        type: '',
        page: this.currentPage(),
        limit: this.limitpage,
      })
      .subscribe({
        next: (response) => {
          this.operations.set(response?.data?.items ?? []);

          this.totalItems.set(response?.meta?.total ?? 0);
        },

        error: () => {
          this.operations.set([]);
        },
      });

    this.operationService
      .getAll({
        adherentId,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: '',
        type: '',
        page: 1,
        limit: 100000,
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

  createDirectWithdraw(operation: Operation): void {
    const adherentId = this.portefeuille()?.adherent_id;

    if (!adherentId) {
      return;
    }

    this.isLoading.set(true);

    const { montant_commission, montant_net, ...cleanedOperation } = operation;

    this.operationService
      .create({
        ...cleanedOperation,
        adherent_id: adherentId,
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          const operationId = response?.id;

          if (!operationId) {
            this.closeDirectWithdrawModal();

            this.loadPortefeuille(adherentId);

            this.loadOperations(adherentId);

            return;
          }

          this.operationService
            .activate(operationId, {
              moyen_operation: operation.moyen_operation,

              compte: operation.compte ?? '',
            })
            .subscribe({
              next: () => {
                const adherentName = this.adherentName();
                const amount = operation.montant ? ` — ${operation.montant} FCFA` : '';
                this.notifService.add({
                  type: 'portefeuille',
                  action: 'withdraw',
                  title: 'Retrait direct effectué',
                  message: `Retrait de ${adherentName}${amount} effectué avec succès.`,
                });
                this.closeDirectWithdrawModal();
                this.loadPortefeuille(adherentId);
                this.loadOperations(adherentId);
              },

              error: (error) => {
                console.error('Erreur activation', error);

                this.closeDirectWithdrawModal();

                this.loadOperations(adherentId);
              },
            });
        },

        error: (error) => {
          console.error('Erreur création retrait', error);
        },
      });
  }

  previousPage(): void {
    if (this.currentPage() <= 1) {
      return;
    }

    this.currentPage.update((page) => page - 1);

    const adherentId = this.route.snapshot.paramMap.get('id');

    if (adherentId) {
      this.loadOperations(adherentId);
    }
  }

  nextPage(): void {
    if (this.currentPage() >= this.totalPages()) {
      return;
    }

    this.currentPage.update((page) => page + 1);

    const adherentId = this.route.snapshot.paramMap.get('id');

    if (adherentId) {
      this.loadOperations(adherentId);
    }
  }

  goToAdherent(): void {
    const adherentId = this.portefeuille()?.adherent_id;

    if (!adherentId) {
      return;
    }

    this.router.navigate(['/adherents']);
  }
}
