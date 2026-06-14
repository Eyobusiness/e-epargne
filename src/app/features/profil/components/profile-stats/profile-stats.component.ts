import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { Profile } from '../../models/profil.model';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-stats.component.html',
  styleUrls: ['./profile-stats.component.css'],
})
export class ProfileStatsComponent {
  readonly profiles = input<Profile[]>([]);

  readonly totalProfiles = computed(() => this.profiles().length);

  readonly totalMenusAssigned = computed(() => {
    return this.profiles().reduce(
      (total, profile) => total + (profile.profilMenus?.length ?? 0),
      0,
    );
  });

  readonly totalWithMenus = computed(() => {
    return this.profiles().filter((profile) => (profile.profilMenus?.length ?? 0) > 0).length;
  });

  readonly totalWithoutMenus = computed(() => {
    return this.profiles().filter((profile) => (profile.profilMenus?.length ?? 0) === 0).length;
  });
}
