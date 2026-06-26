import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { FormatMontantPipe } from '../../../../shared/pipes/pipe.component';

import { RapportCotisationStats } from '../../models/rapport-cotisation-stats.model';

@Component({
  selector: 'app-rapport-cotisation-stats',
  standalone: true,
  imports: [CommonModule, FormatMontantPipe],
  templateUrl: './rapport-cotisation-stats.component.html',
  styleUrls: ['./rapport-cotisation-stats.component.css'],
})
export class RapportCotisationStatsComponent {
  readonly stats = input<RapportCotisationStats | null>(null);

  readonly isLoading = computed(() => !this.stats());
}
