import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { buildListParams } from '../../cotisations/utils/subscription-api.utils';

import {
  CotisationAdherent,
  CotisationAdherentListResponse,
  CreateCotisationAdherentPayload,
  GenerateCotisationAdherentPayload,
  SubscriptionMemberListParams,
  UpdateCotisationAdherentPayload,
} from '../models/cotisation-adherent.model';

@Injectable({
  providedIn: 'root',
})
export class CotisationAdherentService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/subscriptions/members`;

  getAll(params: SubscriptionMemberListParams): Observable<CotisationAdherentListResponse> {
    return this.http.get<CotisationAdherentListResponse>(`${this.apiUrl}/all`, {
      params: buildListParams(params),
    });
  }

  getById(id: string): Observable<CotisationAdherent> {
    return this.http.get<CotisationAdherent>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateCotisationAdherentPayload): Observable<CotisationAdherent> {
    return this.http.post<CotisationAdherent>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateCotisationAdherentPayload): Observable<CotisationAdherent> {
    return this.http.put<CotisationAdherent>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<{ statusCode: number; statusMessage: string }> {
    return this.http.delete<{
      statusCode: number;
      statusMessage: string;
    }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Génération manuelle des cotisations
   * Si adherentId est vide => tous les adhérents
   * Sinon => adhérent sélectionné
   */
  generate(payload: GenerateCotisationAdherentPayload): Observable<{
    statusCode: number;
    statusMessage: string;
  }> {
    return this.http.post<{
      statusCode: number;
      statusMessage: string;
    }>(`${this.apiUrl}/generate`, payload);
  }
}
