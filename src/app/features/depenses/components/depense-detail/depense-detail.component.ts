import { CommonModule } from '@angular/common';
import { Component, computed, input, OnInit, output } from '@angular/core';

import { Depense } from '../../models/depense.model';
import { DocumentService } from '../../services/document-dpenses.service';
import { inject, signal } from '@angular/core';
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
export class DepenseDetailComponent implements OnInit {
  readonly depense = input.required<Depense>();
  private readonly documentService = inject(DocumentService);

  readonly documents = signal<any[]>([]);

  readonly close = output<void>();

  readonly documentUrl = computed(() => getDocumentPreviewUrl(this.depense().document));

  readonly isImage = computed(() => {
    const ext = (this.depense().document?.extension || '').toLowerCase();

    return ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
  });

  readonly isPdf = computed(() => {
    return (this.depense().document?.extension || '').toLowerCase() === 'pdf';
  });

  ngOnInit(): void {
    const depense = this.depense();

    if (!depense.id) {
      return;
    }

    this.documentService.getByParentId(depense.id).subscribe({
      next: (documents) => {
        this.documents.set(documents);
      },

      error: () => {
        this.documents.set([]);
      },
    });
  }

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
  getFileUrl(doc: any): string {
    return this.documentService.resolveReadUrl(doc);
  }
 
}
