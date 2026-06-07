import { Component, input } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-toast.component.html',
  styleUrls: ['./app-toast.component.css'],
})
export class AppToastComponent {
  readonly message = input<string>('');

  readonly type = input<'success' | 'error' | 'warning'>('success');

  readonly isVisible = input<boolean>(false);
}
