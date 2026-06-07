import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';

import {
  AffectationAdherent,
  AffectationAdherentListResponse,
  CreateAffectationAdherentPayload,
  UpdateAffectationAdherentPayload,
  normalizeAffectationAdherent,
} from '../models/affectation-adherent.model';

@Injectable({
  providedIn: 'root',
})
export class AffectationAdherentService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/groups/members`;

  getAll(groupeId?: string, status?: string): Observable<AffectationAdherentListResponse> {
    return this.http.get<AffectationAdherentListResponse>(`${this.apiUrl}/all`).pipe(
      map((response) => ({
        ...response,
        data: {
          items: (response.data?.items ?? [])
            .map((item) => normalizeAffectationAdherent(item))
            .filter((item) => (!groupeId ? true : item.groupe_id === groupeId))
            .filter((item) => (!status ? true : item.status === status)),
        },
      })),
    );
  }

  getById(id: string): Observable<AffectationAdherent> {
    return this.http
      .get<AffectationAdherent>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => normalizeAffectationAdherent(response)));
  }

  create(
    payload: Partial<AffectationAdherent> | CreateAffectationAdherentPayload,
  ): Observable<AffectationAdherent> {
    return this.http.post<AffectationAdherent>(this.apiUrl, this.toPayload(payload)).pipe(
      map((response) => normalizeAffectationAdherent(response)),
    );
  }

  update(
    id: string,
    payload: Partial<AffectationAdherent> | UpdateAffectationAdherentPayload,
  ): Observable<AffectationAdherent> {
    return this.http.put<AffectationAdherent>(`${this.apiUrl}/${id}`, this.toPayload(payload)).pipe(
      map((response) => normalizeAffectationAdherent(response)),
    );
  }

  delete(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  private toPayload(
    payload: Partial<AffectationAdherent> | UpdateAffectationAdherentPayload,
  ): UpdateAffectationAdherentPayload {
    const adhMultiPayload = payload as Partial<AffectationAdherent>;
    const adherentId = payload.adherent_id ?? adhMultiPayload.adherent_ids?.[0];

    const normalizedPayload: UpdateAffectationAdherentPayload = {
      ...(payload.id != null ? { id: payload.id } : {}),
      ...(payload.groupe_id ? { groupe_id: payload.groupe_id } : {}),
      ...(adherentId ? { adherent_id: adherentId } : {}),
      ...(payload.status ? { status: payload.status } : {}),
    };

    return normalizedPayload;
  }
}
