import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';

import { DocumentIdentite } from '../../models/document.model';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-document-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-table.component.html',
  styleUrls: ['./document-table.component.css'],
})
export class DocumentTableComponent {
  private readonly documentService = inject(DocumentService);

  readonly documents = input<DocumentIdentite[]>([]);
  readonly imageLoadErrors = signal<Record<string, boolean>>({});
  readonly blobUrls = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const items = this.documents();
      items.forEach((item) => {
        const key = item.id || item.type;
        if (!key) return;

        const resolvedUrl = this.documentService.resolveReadUrl(item);
        if (resolvedUrl && (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://'))) {
          this.documentService.fetchBlobUrl(resolvedUrl, item.extension).subscribe((blobUrl) => {
            this.blobUrls.update((current) => ({
              ...current,
              [key]: blobUrl,
            }));
          });
        }
      });
    });
  }

  trackById(_index: number, item: DocumentIdentite): string {
    return item.id ?? String(_index);
  }

  getFileUrl(item: DocumentIdentite): string {
    const key = item.id || item.type;
    if (key && this.blobUrls()[key]) {
      return this.blobUrls()[key];
    }
    return this.documentService.resolveReadUrl(item);
  }

  openInNewTab(item: DocumentIdentite, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.documentService.openInNewTab(item);
  }

  isImage(extension?: string): boolean {
    if (!extension) {
      return false;
    }

    return ['png', 'jpg', 'jpeg', 'webp'].includes(extension.toLowerCase());
  }

  onImageError(item: DocumentIdentite): void {
    const key = item.id || item.type || 'unknown';
    this.imageLoadErrors.update(errors => ({
      ...errors,
      [key]: true
    }));
  }

  hasImageError(item: DocumentIdentite): boolean {
    const key = item.id || item.type || 'unknown';
    return !!this.imageLoadErrors()[key];
  }
}




