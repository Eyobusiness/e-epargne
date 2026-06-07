import { Component, EventEmitter, Output, input } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-modal.component.html',
  styleUrls: ['./app-modal.component.css'],
})
export class AppModalComponent {
  readonly isOpen = input<boolean>(false);

  readonly title = input<string>('');

  readonly description = input<string>('');

  readonly width = input<string>('700px');

  @Output()
  readonly close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
