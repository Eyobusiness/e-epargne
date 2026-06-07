import { Injectable } from '@angular/core';

import { getDocumentReadUrl } from '../utils/member-api.utils';
import { DocumentIdentite } from '../models/document.model';

/** Utilitaires d'affichage des documents membres (fichiers via readUrl API). */
@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  resolveReadUrl(document: DocumentIdentite): string {
    if (document.readUrl) {
      return getDocumentReadUrl(document.readUrl);
    }

    return getDocumentReadUrl(document.lien);
  }
}
