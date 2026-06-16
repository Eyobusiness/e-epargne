import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { FormatMontantPipe } from '../../../../shared/pipes/pipe.component';

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule, FormatMontantPipe],
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.css'],
})
export class DashboardStatsComponent {
  readonly stats = input<any>();

  readonly isLoading = computed(() => this.stats() == null);

  readonly totalDepot = computed(() => this.stats()?.totalDepot ?? 0);
  readonly totalRetrait = computed(() => this.stats()?.totalRetrait ?? 0);
  readonly adherentActif = computed(() => this.stats()?.adherentActif ?? 0);
  readonly adherentInactif = computed(() => this.stats()?.adherentInactif ?? 0);
  readonly totalCommissionRetrait = computed(() => this.stats()?.totalCommissionRetrait ?? 0);
  readonly soldeCommission = computed(() => this.stats()?.soldeCommission ?? 0);
  readonly tauxCommissionRetrait = computed(() => this.stats()?.tauxCommissionRetrait ?? 0);
}
