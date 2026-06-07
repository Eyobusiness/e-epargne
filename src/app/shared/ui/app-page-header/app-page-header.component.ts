import { Component, EventEmitter, Output, input } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-page-header.component.html',
  styleUrls: ['./app-page-header.component.css'],
})
export class AppPageHeaderComponent {
  readonly title = input<string>('');

  readonly description = input<string>('');

  readonly buttonText = input<string>('');

  readonly icon = input<string>('bi bi-plus');

  @Output()
  readonly action = new EventEmitter<void>();

  onAction(): void {
    this.action.emit();
  }
}
