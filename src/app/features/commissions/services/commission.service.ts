import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response.models';
import { environment } from '../../../../environments/environment';
import { CommissionConfig } from '../models/commission.model';

type CollectionResponse<T> = ApiResponse<{ items?: T[]; item?: T }> | T[] | T;

@Injectable({
  providedIn: 'root',
})
export class CommissionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/commission-configs`;

  getAll(limit = 1000): Observable<CommissionConfig[]> {
    return this.http
      .get<CollectionResponse<CommissionConfig>>(`${this.apiUrl}/all`, {
        params: { limit: String(limit) },
      })
      .pipe(map((response) => this.unwrapList(response)));
  }

  getByType(type: string): Observable<CommissionConfig[]> {
    return this.http
      .get<CollectionResponse<CommissionConfig>>(`${this.apiUrl}/by-type/${type}`)
      .pipe(map((response) => this.unwrapList(response)));
  }

  getById(id: string): Observable<CommissionConfig> {
    return this.http
      .get<CollectionResponse<CommissionConfig>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => this.unwrapItem(response)));
  }

  create(payload: any): Observable<CommissionConfig> {
    return this.http
      .post<CollectionResponse<CommissionConfig>>(this.apiUrl, payload)
      .pipe(map((response) => this.unwrapItem(response)));
  }

  update(id: string, payload: any): Observable<CommissionConfig> {
    return this.http
      .put<CollectionResponse<CommissionConfig>>(`${this.apiUrl}/${id}`, payload)
      .pipe(map((response) => this.unwrapItem(response)));
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  activate(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivate(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  preview(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/preview`, payload);
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
