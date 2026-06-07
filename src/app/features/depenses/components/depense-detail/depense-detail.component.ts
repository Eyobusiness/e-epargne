import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

import { Depense } from '../../models/depense.model';
import {
  getCategorieLabel,
  getDocumentPreviewUrl,
  isDepenseActive,
} from '../../utils/depense-api.utils';

@Component({
  selector: 'app-depense-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './depense-detail.component.html',
  styleUrls: ['./depense-detail.component.css'],
})
export class DepenseDetailComponent {
  readonly depense = input.required<Depense>();

  readonly close = output<void>();

  readonly documentUrl = computed(() => getDocumentPreviewUrl(this.depense().document));

  readonly isImage = computed(() => {
    const ext = (this.depense().document?.extension || '').toLowerCase();

    return ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
  });

  readonly isPdf = computed(() => {
    return (this.depense().document?.extension || '').toLowerCase() === 'pdf';
  });

  formatAmount(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  getCategorie(): string {
    return getCategorieLabel(this.depense());
  }

  isActive(): boolean {
    return isDepenseActive(this.depense().status);
  }

  onClose(): void {
    this.close.emit();
  }
}
