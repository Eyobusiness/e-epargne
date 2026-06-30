import { CommonModule } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';

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

  trackById(_index: number, item: DocumentIdentite): string {
    return item.id ?? String(_index);
  }

  getFileUrl(item: DocumentIdentite): string {
    return this.documentService.resolveReadUrl(item);
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




