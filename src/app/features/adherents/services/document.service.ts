import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { extractApiErrorMessage, getDocumentReadUrl, getFileExtension, getMimeTypeFromExtension, openDocumentInNewTab } from '../utils/member-api.utils';
import { DocumentIdentite } from '../models/document.model';
import { ToastService } from '../../../core/services/toast.service';

/** Utilitaires d'affichage des documents membres (fichiers via readUrl API). */
@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);

  resolveReadUrl(document: DocumentIdentite): string {
    const rawUrl = document.readUrl || document.lien;
    return getDocumentReadUrl(rawUrl, document.extension);
  }

  /**
   * Ouvre le document dans un nouvel onglet avec l'en-tête Authorization (Bearer token) et signature HMAC.
   */
  openInNewTab(document: DocumentIdentite): void {
    const resolvedUrl = this.resolveReadUrl(document);
    if (!resolvedUrl) {
      return;
    }

    if (resolvedUrl.startsWith('data:')) {
      openDocumentInNewTab(resolvedUrl, document.extension);
      return;
    }

    const cleanExt = (document.extension || getFileExtension(resolvedUrl)).toLowerCase();
    const targetMime = getMimeTypeFromExtension(cleanExt);

    if (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://')) {
      // Pré-ouverture synchrone de l'onglet (SANS document.write pour ne pas verrouiller le DOM)
      const win = window.open('about:blank', '_blank');

      this.http.get(resolvedUrl, { responseType: 'blob' }).subscribe({
        next: (blob) => {
          const mimeType = targetMime !== 'application/octet-stream' ? targetMime : blob.type;
          const typedBlob = new Blob([blob], { type: mimeType });
          const blobUrl = URL.createObjectURL(typedBlob);

          if (win && !win.closed) {
            win.location.replace(blobUrl);
          } else {
            window.open(blobUrl, '_blank');
          }
        },
        error: (err) => {
          console.error('Erreur ouverture document sécurisé:', err);
          if (win && !win.closed) {
            win.close();
          }
          if (err?.status === 404) {
            this.toastService.show('Ce fichier n\'existe plus ou est introuvable sur le serveur (404)', 'error');
          } else {
            this.toastService.show(extractApiErrorMessage(err) || 'Erreur lors de la récupération du document', 'error');
          }
        },
      });
    } else {
      openDocumentInNewTab(resolvedUrl, document.extension);
    }
  }

  /**
   * Récupère un Blob URL sécurisé pour l'affichage dans le composant.
   */
  fetchBlobUrl(url: string, extension?: string): Observable<string> {
    if (!url) {
      return of('');
    }
    if (url.startsWith('data:')) {
      return of(url);
    }

    const cleanExt = (extension || getFileExtension(url)).toLowerCase();
    const targetMime = getMimeTypeFromExtension(cleanExt);

    return this.http.get(url, { responseType: 'blob' }).pipe(
      map((blob) => {
        const mimeType = targetMime !== 'application/octet-stream' ? targetMime : blob.type;
        const typedBlob = new Blob([blob], { type: mimeType });
        return URL.createObjectURL(typedBlob);
      }),
      catchError(() => of(url)),
    );
  }
}
