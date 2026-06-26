// components/utilisateur-stats/utilisateur-stats.component.ts

import { CommonModule } from '@angular/common';

import { Component, computed, input } from '@angular/core';

import { User } from '../../models/utilisateur.model';

@Component({
  selector: 'app-utilisateur-stats',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './utilisateur-stats.component.html',

  styleUrls: ['./utilisateur-stats.component.css'],
})
export class UtilisateurStatsComponent {
  readonly utilisateurs = input<User[]>([]);
  readonly isLoading = input<boolean>(false);

  readonly totalUtilisateurs = computed(() => this.utilisateurs().length);

  readonly totalActifs = computed(() => {
    return this.utilisateurs().filter((item) => item.status === '200').length;
  });

  readonly totalInactifs = computed(() => {
    return this.utilisateurs().filter((item) => item.status !== '200').length;
  });
}
