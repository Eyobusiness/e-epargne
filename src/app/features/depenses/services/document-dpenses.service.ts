import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

export interface GenericDocument {
  id?: string;
  extension?: string;
  numero?: string | null;
  type?: string;
  validite?: string | null;
  lien?: string;
  parent_id?: string;
  readUrl?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/documents`;

  /**
   * Récupère tous les documents liés à un parent.
   * parent_id = id de la dépense
   */
  getByParentId(parentId: string): Observable<GenericDocument[]> {
    const params = new HttpParams().set('parentId', parentId);

    return this.http.get<GenericDocument[]>(`${this.apiUrl}/all`, { params });
  }

  /**
   * Génère l'url complète de lecture.
   */
  resolveReadUrl(document: GenericDocument): string {
    if (!document.readUrl) {
      return '';
    }

    if (document.readUrl.startsWith('http')) {
      return document.readUrl;
    }

    const origin = environment.apiUrl.replace(/\/api\/v1\/?$/, '');

    return `${origin}${document.readUrl}`;
  }

  /**
   * Vérifie si c'est une image.
   */
  isImage(extension?: string): boolean {
    return ['jpg', 'jpeg', 'png', 'webp'].includes((extension || '').toLowerCase());
  }

  /**
   * Vérifie si c'est un PDF.
   */
  isPdf(extension?: string): boolean {
    return extension?.toLowerCase() === 'pdf';
  }
}
