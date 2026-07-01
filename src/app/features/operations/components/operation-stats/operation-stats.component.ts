import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { Operation } from '../../models/operation.model';
import { FormatMontantPipe } from '../../../../shared/pipes/pipe.component';

@Component({
  selector: 'app-operation-stats',
  standalone: true,
  imports: [CommonModule, FormatMontantPipe],
  templateUrl: './operation-stats.component.html',
  styleUrls: ['./operation-stats.component.css'],
})
export class OperationStatsComponent {
  readonly operations = input<Operation[]>([]);
  readonly isLoading = input<boolean>(false);

  readonly totalMontantAPayer = computed(() =>
    this.operations()
      .filter((item) => item.type_operation === 'DEPOT' && item.status !== '300')
      .reduce((acc, item) => acc + (item.montant || 0), 0),
  );

  readonly montantAttente = computed(() =>
    this.operations()
      .filter((item) => item.type_operation === 'DEPOT' && item.status === '100')
      .reduce((acc, item) => acc + (item.montant || 0), 0),
  );

  readonly montantDepotPaye = computed(() =>
    this.operations()
      .filter((item) => item.type_operation === 'DEPOT' && item.status === '200')
      .reduce((acc, item) => acc + (item.montant || 0), 0),
  );

  readonly montantRetraitPaye = computed(() =>
    this.operations()
      .filter((item) => item.type_operation === 'RETRAIT' && item.status === '200')
      .reduce((acc, item) => acc + (item.montant || 0), 0),
  );

  readonly montantAnnule = computed(() =>
    this.operations()
      .filter((item) => item.type_operation === 'DEPOT' && item.status === '300')
      .reduce((acc, item) => acc + (item.montant || 0), 0),
  );
}
