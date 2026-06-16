import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';

import { Portefeuille } from '../../models/portefeuille.model';
import { PortefeuilleService } from '../../services/portefeuille.service';

import { Operation } from '../../../operations/models/operation.model';
import { OperationService } from '../../../operations/services/operation.service';

import { PortefeuilleStatsComponent } from '../../components/portefeuille-stats/portefeuille-stats.component';
import { PortefeuilleResumeComponent } from '../../components/portefeuille-resume/portefeuille-resume.component';
import { PortefeuilleOperationsComponent } from '../../components/portefeuille-operations/portefeuille-operations.component';

import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';

@Component({
  selector: 'app-portefeuille-detail',
  standalone: true,
  imports: [
    CommonModule,
    AppPageHeaderComponent,
    PortefeuilleStatsComponent,
    PortefeuilleResumeComponent,
    PortefeuilleOperationsComponent,
  ],
  templateUrl: './portefeuille-detail.component.html',
  styleUrls: ['./portefeuille-detail.component.css'],
})
export class PortefeuilleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  private readonly portefeuilleService = inject(PortefeuilleService);

  private readonly operationService = inject(OperationService);

  readonly portefeuille = signal<Portefeuille | null>(null);

  readonly operations = signal<Operation[]>([]);

  readonly isLoading = signal(false);

  readonly limitpage = 10;

  readonly currentPage = signal(1);

  readonly totalItems = signal(0);

  readonly totalPages = computed(() =>
    Math.max(
      1,
      Math.ceil(this.totalItems() / this.limitpage),
    ),
  );

  readonly pendingWithdrawals = computed(() =>
    this.operations().filter(
      operation =>
        operation.type_operation === 'RETRAIT'
        && operation.status === '100',
    ),
  );

  readonly pendingWithdrawalsCount = computed(
    () => this.pendingWithdrawals().length,
  );

  readonly showWithdrawModal = signal(false);

  readonly showDirectWithdrawModal = signal(false);

  ngOnInit(): void {
    const adherentId = this.route.snapshot.paramMap.get('id');

    if (!adherentId) {
      return;
    }

    this.loadPortefeuille(adherentId);

    this.loadOperations(adherentId);
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

  loadPortefeuille(adherentId: string): void {
    this.isLoading.set(true);

    this.portefeuilleService
      .getByAdherent(adherentId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.portefeuille.set(response);
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
        next: response => {
          this.operations.set(
            response?.data?.items ?? [],
          );

          this.totalItems.set(
            response?.meta?.total ?? 0,
          );
        },

        error: () => {
          this.operations.set([]);
        },
      });
  }

  previousPage(): void {
    if (this.currentPage() <= 1) {
      return;
    }

    this.currentPage.update(
      page => page - 1,
    );

    const adherentId =
      this.route.snapshot.paramMap.get('id');

    if (adherentId) {
      this.loadOperations(adherentId);
    }
  }

  nextPage(): void {
    if (
      this.currentPage()
      >= this.totalPages()
    ) {
      return;
    }

    this.currentPage.update(
      page => page + 1,
    );

    const adherentId =
      this.route.snapshot.paramMap.get('id');

    if (adherentId) {
      this.loadOperations(adherentId);
    }
  }
}