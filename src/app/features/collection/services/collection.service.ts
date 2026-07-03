import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Collection,
  CollectionListResponse,
  CollectionParams,
  CreateCollectionDto,
} from '../models/collection.model';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/collections`;

  // ─── GET /collections/all ── liste paginée avec filtres ───────────────────
  getCollections(params: CollectionParams = {}): Observable<CollectionListResponse> {
    let p = new HttpParams()
      .set('page',  (params.page  ?? 1).toString())
      .set('limit', (params.limit ?? 10).toString());

    if (params.search)     p = p.set('search',     params.search);
    if (params.sort)       p = p.set('sort',        params.sort);
    if (params.startDate)  p = p.set('startDate',   params.startDate);
    if (params.endDate)    p = p.set('endDate',     params.endDate);
    if (params.adherentId) p = p.set('adherentId',  params.adherentId);
    if (params.status)     p = p.set('status',      params.status);
    if (params.agentId)    p = p.set('agentId',     params.agentId);

    return this.http.get<CollectionListResponse>(`${this.apiUrl}/all`, { params: p });
  }

  // ─── GET /collections/:id ─────────────────────────────────────────────────
  getCollectionById(id: string): Observable<Collection> {
    return this.http.get<Collection>(`${this.apiUrl}/${id}`);
  }

  /**
   * POST /collections
   * Soumis par l'agent collecteur → statut 100 (En attente)
   * L'administrateur devra ensuite valider ou rejeter.
   */
  createCollection(dto: CreateCollectionDto): Observable<Collection> {
    return this.http.post<Collection>(this.apiUrl, dto);
  }

  // ─── DELETE /collections/:id ──────────────────────────────────────────────
  deleteCollection(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * PUT /collections/:id/activate
   * Valide la collecte → statut passe à 200 (Validé)
   */
  activateCollection(id: string): Observable<Collection> {
    return this.http.put<Collection>(`${this.apiUrl}/${id}/activate`, {});
  }

  /**
   * PUT /collections/:id/deactivate
   * Rejette la collecte → statut passe à 300 (Rejeté)
   */
  rejectCollection(id: string): Observable<Collection> {
    return this.http.put<Collection>(`${this.apiUrl}/${id}/deactivate`, {});
  }
}
