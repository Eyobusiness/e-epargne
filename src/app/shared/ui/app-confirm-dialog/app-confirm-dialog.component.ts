import { Component, EventEmitter, Output, input } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-confirm-dialog.component.html',
  styleUrls: ['./app-confirm-dialog.component.css'],
})
export class AppConfirmDialogComponent {
  readonly title = input<string>('Confirmer la suppression');

  readonly message = input<string>('Voulez-vous vraiment continuer ?');

  readonly isOpen = input<boolean>(false);

  readonly isLoading = input<boolean>(false);

  readonly confirmLabel = input<string>('Supprimer');

  readonly cancelLabel = input<string>('Annuler');

  @Output()
  readonly confirm = new EventEmitter<void>();

  @Output()
  readonly cancel = new EventEmitter<void>();

  onConfirm(): void {
    if (this.isLoading()) {
      return;
    }

    this.confirm.emit();
  }

  onCancel(): void {
    if (this.isLoading()) {
      return;
    }

    this.cancel.emit();
  }
}
