// components/cotisation-adherent-stats/cotisation-adherent-stats.component.ts

import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { CotisationAdherent } from '../../models/cotisation-adherent.model';
import { FormatMontantPipe } from '../../../../shared/pipes/pipe.component';

@Component({
  selector: 'app-cotisation-adherent-stats',
  standalone: true,
  imports: [CommonModule, FormatMontantPipe],
  templateUrl: './cotisation-adherent-stats.component.html',
  styleUrls: ['./cotisation-adherent-stats.component.css'],
})
export class CotisationAdherentStatsComponent {
  readonly cotisations = input<CotisationAdherent[]>([]);
  readonly isLoading = input<boolean>(false);

  readonly totalCotisations = computed(() => this.cotisations().length);

  readonly totalMontant = computed(() => {
    return this.cotisations().reduce((acc, item) => acc + item.montant, 0);
  });
}
