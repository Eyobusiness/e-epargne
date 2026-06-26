import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response.models';
import { environment } from '../../../../environments/environment';
import { Plafond, CollectorLimit } from '../models/plafond.model';

type CollectionResponse<T> = ApiResponse<{ items?: T[]; item?: T }> | T[] | T;

@Injectable({
  providedIn: 'root',
})
export class PlafondService {
  private readonly http = inject(HttpClient);
  private readonly limitsUrl = `${environment.apiUrl}/limits`;
  private readonly collectorLimitsUrl = `${environment.apiUrl}/collectors/limits`;

  // --- Limits APIs ---
  getLimits(limit = 1000): Observable<Plafond[]> {
    return this.http
      .get<CollectionResponse<Plafond>>(`${this.limitsUrl}/all`, {
        params: { limit: String(limit) },
      })
      .pipe(map((response) => this.unwrapList(response)));
  }

  getLimit(id: string): Observable<Plafond> {
    return this.http
      .get<CollectionResponse<Plafond>>(`${this.limitsUrl}/${id}`)
      .pipe(map((response) => this.unwrapItem(response)));
  }

  createLimit(payload: Plafond): Observable<Plafond> {
    return this.http
      .post<CollectionResponse<Plafond>>(this.limitsUrl, payload)
      .pipe(map((response) => this.unwrapItem(response)));
  }

  updateLimit(id: string, payload: Partial<Plafond>): Observable<Plafond> {
    return this.http
      .put<CollectionResponse<Plafond>>(`${this.limitsUrl}/${id}`, payload)
      .pipe(map((response) => this.unwrapItem(response)));
  }

  deleteLimit(id: string): Observable<any> {
    return this.http.delete<any>(`${this.limitsUrl}/${id}`);
  }

  activateLimit(id: string): Observable<any> {
    return this.http.put<any>(`${this.limitsUrl}/${id}/activate`, {});
  }

  deactivateLimit(id: string): Observable<any> {
    return this.http.put<any>(`${this.limitsUrl}/${id}/deactivate`, {});
  }

  // --- Collector Limits APIs ---
  getCollectorLimits(limit = 1000): Observable<CollectorLimit[]> {
    return this.http
      .get<CollectionResponse<CollectorLimit>>(`${this.collectorLimitsUrl}/all`, {
        params: { limit: String(limit) },
      })
      .pipe(map((response) => this.unwrapList(response)));
  }

  getCollectorLimit(id: string): Observable<CollectorLimit> {
    return this.http
      .get<CollectionResponse<CollectorLimit>>(`${this.collectorLimitsUrl}/${id}`)
      .pipe(map((response) => this.unwrapItem(response)));
  }

  createCollectorLimit(payload: Partial<CollectorLimit>): Observable<CollectorLimit> {
    return this.http
      .post<CollectionResponse<CollectorLimit>>(this.collectorLimitsUrl, payload)
      .pipe(map((response) => this.unwrapItem(response)));
  }

  updateCollectorLimit(id: string, payload: Partial<CollectorLimit>): Observable<CollectorLimit> {
    return this.http
      .put<CollectionResponse<CollectorLimit>>(`${this.collectorLimitsUrl}/${id}`, payload)
      .pipe(map((response) => this.unwrapItem(response)));
  }

  deleteCollectorLimit(id: string): Observable<any> {
    return this.http.delete<any>(`${this.collectorLimitsUrl}/${id}`);
  }

  private unwrapList<T>(response: CollectionResponse<T>): T[] {
    if (Array.isArray(response)) {
      return response;
    }
    if (response && typeof response === 'object') {
      const data = 'data' in response ? response.data : response;
      if (data && typeof data === 'object' && Array.isArray((data as { items?: T[] }).items)) {
        return (data as { items: T[] }).items;
      }
      if (Array.isArray(data)) {
        return data;
      }
    }
    return [];
  }

  private unwrapItem<T>(response: CollectionResponse<T>): T {
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      const data = 'data' in response ? response.data : response;
      return ((data as { item?: T }).item ?? data) as T;
    }
    return response as T;
  }
}
