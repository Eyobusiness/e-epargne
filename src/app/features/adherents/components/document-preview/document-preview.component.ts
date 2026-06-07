// components/document-preview/document-preview.component.ts

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-document-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-preview.component.html',
  styleUrls: ['./document-preview.component.css'],
})
export class DocumentPreviewComponent {
  @Input() url = '';

  @Input() extension = '';

  @Input() title = 'Document';

  get isImage(): boolean {
    const ext = (this.extension || '').toLowerCase();

    return ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
  }

  get isPdf(): boolean {
    return (this.extension || '').toLowerCase() === 'pdf';
  }
}
