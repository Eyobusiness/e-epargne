import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { Adherent } from '../../models/adherent.model';
import { isMemberActive } from '../../utils/member-api.utils';

@Component({
  selector: 'app-adherent-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adherent-stats.component.html',
  styleUrls: ['./adherent-stats.component.css'],
})
export class AdherentStatsComponent {
  readonly adherents = input<Adherent[]>([]);

  readonly totalAdherents = computed(() => this.adherents().length);

  readonly activeAdherents = computed(
    () => this.adherents().filter((item) => isMemberActive(item.status)).length,
  );

  readonly inactiveAdherents = computed(
    () => this.adherents().filter((item) => item.status === '0').length,
  );
}
