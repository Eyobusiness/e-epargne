import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
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

  ngOnInit(): void {
    const adherentId = this.route.snapshot.paramMap.get('id');

    if (!adherentId) {
      return;
    }

    this.loadPortefeuille(adherentId);

    this.loadOperations(adherentId);
  }

  loadPortefeuille(adherentId: string): void {
    this.isLoading.set(true);

    this.portefeuilleService
      .getByAdherent(adherentId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
        console.log('WALLET', response);

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
        page: 1,
        limit: 100,
      })
      .subscribe({
        next: (response) => {
          this.operations.set(response?.data?.items ?? []);
        },

        error: () => {
          this.operations.set([]);
        },
      });
  }
}