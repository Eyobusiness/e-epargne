import { Component, input } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-status-badge.component.html',
  styleUrls: ['./app-status-badge.component.css'],
})
export class AppStatusBadgeComponent {
  readonly status = input<string>('actif');
}
