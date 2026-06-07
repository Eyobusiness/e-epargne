import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  Depense,
  DepenseItemResponse,
  DepenseListResponse,
  DepensePayload,
} from '../models/depense.model';

@Injectable({
  providedIn: 'root',
})
export class DepenseService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/expenses`;

  getAll(page = 1, limit = 10, search = ''): Observable<DepenseListResponse> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit))
      .set('search', search);

    return this.http.get<DepenseListResponse>(`${this.apiUrl}/all`, { params });
  }

  getById(id: string): Observable<DepenseItemResponse> {
    return this.http.get<DepenseItemResponse>(`${this.apiUrl}/${id}`);
  }

  create(payload: DepensePayload): Observable<DepenseItemResponse> {
    return this.http.post<DepenseItemResponse>(this.apiUrl, payload);
  }

  update(id: string, payload: DepensePayload): Observable<DepenseItemResponse> {
    return this.http.put<DepenseItemResponse>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<{ statusCode: number; statusMessage: string; data: null }> {
    return this.http.delete<{ statusCode: number; statusMessage: string; data: null }>(
      `${this.apiUrl}/${id}`,
    );
  }

  getStatsByMonth(startDate: string): Observable<{ statusCode: number; data: unknown }> {
    const params = new HttpParams().set('startDate', startDate);

    return this.http.get<{ statusCode: number; data: unknown }>(`${this.apiUrl}/stats/month`, {
      params,
    });
  }
}
