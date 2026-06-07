import { Component, EventEmitter, Output, input } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './app-button.component.html',

  styleUrls: ['./app-button.component.css'],
})
export class AppButtonComponent {
  /* =====================================================
  INPUTS
  ===================================================== */

  readonly label = input<string>('');

  readonly type = input<'button' | 'submit' | 'reset'>('button');

  readonly variant = input<'primary' | 'secondary' | 'danger' | 'outline'>('primary');

  readonly disabled = input<boolean>(false);

  readonly loading = input<boolean>(false);

  /* =====================================================
  OUTPUT
  ===================================================== */

  @Output()
  readonly clicked = new EventEmitter<void>();

  /* =====================================================
  CLICK
  ===================================================== */

  onClick(): void {
    if (this.disabled() || this.loading()) {
      return;
    }

    this.clicked.emit();
  }
}
