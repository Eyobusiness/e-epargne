import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { FormatMontantPipe } from '../../../../shared/pipes/pipe.component';
import { RapportFinancier } from '../../models/rapport-financier.model';

@Component({
  selector: 'app-rapport-financier-stats',
  standalone: true,
  imports: [CommonModule, FormatMontantPipe],
  templateUrl: './rapport-financier-stats.component.html',
  styleUrls: ['./rapport-financier-stats.component.css'],
})
export class RapportFinancierStatsComponent {
  readonly rapport = input<RapportFinancier | null>();

  readonly isLoading = computed(() => !this.rapport());
}
