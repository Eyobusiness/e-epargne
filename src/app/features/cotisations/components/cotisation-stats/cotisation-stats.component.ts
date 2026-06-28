import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { Cotisation } from '../../models/cotisation.model';
import { isSubscriptionActive } from '../../utils/subscription-api.utils';
import { FormatMontantPipe } from '../../../../shared/pipes/pipe.component';  

@Component({
  selector: 'app-cotisation-stats',
  standalone: true,
  imports: [CommonModule, FormatMontantPipe],
  templateUrl: './cotisation-stats.component.html',
  styleUrls: ['./cotisation-stats.component.css'],
})
export class CotisationStatsComponent {
  readonly cotisations = input<Cotisation[]>([]);
  readonly isLoading = input<boolean>(false);

  readonly totalCotisations = computed(() => this.cotisations().length);

  readonly totalMontant = computed(() => {
    return this.cotisations().reduce((acc, item) => acc + Number(item.montant), 0);
  });

  readonly totalActives = computed(() => {
    return this.cotisations().filter((item) => isSubscriptionActive(item.status)).length;
  });

  readonly totalInactives = computed(() => {
    return this.cotisations().filter((item) => !isSubscriptionActive(item.status)).length;
  });
}
