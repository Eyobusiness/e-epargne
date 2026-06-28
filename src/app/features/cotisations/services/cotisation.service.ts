import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  Cotisation,
  CotisationListResponse,
  CreateCotisationPayload,
  SubscriptionListParams,
  UpdateCotisationPayload,
} from '../models/cotisation.model';
import { buildListParams } from '../utils/subscription-api.utils';

@Injectable({
  providedIn: 'root',
})
export class CotisationService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/subscriptions`;

  getAll(params: SubscriptionListParams): Observable<CotisationListResponse> {
    return this.http.get<CotisationListResponse>(`${this.apiUrl}/all`, {
      params: buildListParams(params),
    });
  }

  getById(id: string): Observable<Cotisation> {
    return this.http.get<Cotisation>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateCotisationPayload): Observable<Cotisation> {
    return this.http.post<Cotisation>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateCotisationPayload): Observable<Cotisation> {
    return this.http.put<Cotisation>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<{ statusCode: number; statusMessage: string }> {
    return this.http.delete<{ statusCode: number; statusMessage: string }>(
      `${this.apiUrl}/${id}`,
    );
  }

  activate(id: string, cotisation: Cotisation): Observable<any> {
    const payload = {
      id: cotisation.id,
      label: (cotisation as any).label || 'Monthly contribution',
      montant: cotisation.montant,
      adherent_id: cotisation.adherent_id,
      status: '200',
      date_debut: cotisation.date_debut?.split('T')[0] ?? cotisation.date_debut,
      date_fin: cotisation.date_fin?.split('T')[0] ?? cotisation.date_fin,
    };
    return this.http.put<any>(`${this.apiUrl}/${id}/activate`, payload);
  }

  deactivate(id: string, cotisation: Cotisation): Observable<any> {
    const payload = {
      id: cotisation.id,
      label: (cotisation as any).label || 'Monthly contribution',
      montant: cotisation.montant,
      adherent_id: cotisation.adherent_id,
      status: '300',
      date_debut: cotisation.date_debut?.split('T')[0] ?? cotisation.date_debut,
      date_fin: cotisation.date_fin?.split('T')[0] ?? cotisation.date_fin,
    };
    return this.http.put<any>(`${this.apiUrl}/${id}/deactivate`, payload);
  }
}
