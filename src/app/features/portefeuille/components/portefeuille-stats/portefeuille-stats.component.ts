import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { Portefeuille } from '../../models/portefeuille.model';
import { Operation } from '../../../operations/models/operation.model';
import { FormatMontantPipe } from '../../../../shared/pipes/pipe.component';  

@Component({
  selector: 'app-portefeuille-stats',
  standalone: true,
  imports: [CommonModule, FormatMontantPipe],
  templateUrl: './portefeuille-stats.component.html',
  styleUrls: ['./portefeuille-stats.component.css'],
})
export class PortefeuilleStatsComponent {
  readonly portefeuille = input<Portefeuille | null>(null);

  readonly operations = input<Operation[]>([]);
  readonly isLoading = input<boolean>(false);

  readonly solde = computed(() => this.portefeuille()?.montant ?? 0);

  readonly totalEntrees = computed(() => {
    return this.operations()
      .filter((item) => item.type_operation === 'DEPOT' && item.status === '200')
      .reduce((total, item) => total + item.montant, 0);
  });

  readonly totalSorties = computed(() => {
    return this.operations()
      .filter((item) => item.type_operation === 'RETRAIT' && item.status === '200')
      .reduce((total, item) => total + item.montant, 0);
  });

  readonly totalCotisations = computed(() => {
    return this.operations()
      .filter((item) => item.moyen_operation === 'COTISATION' && item.status === '100')
      .reduce((total, item) => total + item.montant, 0);
  });
}
