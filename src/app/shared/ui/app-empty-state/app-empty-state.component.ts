import { Component, input } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-empty-state.component.html',
  styleUrls: ['./app-empty-state.component.css'],
})
export class AppEmptyStateComponent {
  readonly title = input<string>('Aucune donnée');

  readonly description = input<string>('Aucune information disponible');
}
