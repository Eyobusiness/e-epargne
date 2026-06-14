import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { Operation } from '../../models/operation.model';

@Component({
  selector: 'app-operation-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './operation-stats.component.html',
  styleUrls: ['./operation-stats.component.css'],
})
export class OperationStatsComponent {
  readonly operations = input<Operation[]>([]);

  readonly totalMontant = computed(() =>
    this.operations().reduce((acc, item) => acc + (item.montant || 0), 0),
  );

  readonly montantAttente = computed(() =>
    this.operations()
      .filter((item) => item.status === '100')
      .reduce((acc, item) => acc + (item.montant || 0), 0),
  );

  readonly montantPaye = computed(() =>
    this.operations()
      .filter((item) => item.status === '200')
      .reduce((acc, item) => acc + (item.montant || 0), 0),
  );

  readonly montantAnnule = computed(() =>
    this.operations()
      .filter((item) => item.status === '300')
      .reduce((acc, item) => acc + (item.montant || 0), 0),
  );
}
