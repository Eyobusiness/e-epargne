// components/groupe-stats/groupe-stats.component.ts

import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { Groupe } from '../../models/groupe.model';

@Component({
  selector: 'app-groupe-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './groupe-stats.component.html',
  styleUrls: ['./groupe-stats.component.css'],
})
export class GroupeStatsComponent {
  readonly groupes = input<Groupe[]>([]);

  readonly totalGroupes = computed(() => this.groupes().length);

  readonly totalMontantMin = computed(() => {
    return this.groupes().reduce((acc, item) => acc + (item.montant_min ?? 0), 0);
  });

  readonly totalMontantMax = computed(() => {
    return this.groupes().reduce((acc, item) => acc + item.montant_max, 0);
  });
}
