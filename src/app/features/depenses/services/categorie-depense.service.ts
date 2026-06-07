import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  CategorieDepense,
  CategorieDepenseItemResponse,
  CategorieDepenseListResponse,
} from '../models/categorie-depense.model';

@Injectable({
  providedIn: 'root',
})
export class CategorieDepenseService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/expenses/categories`;

  getAll(page = 1, limit = 10, search = ''): Observable<CategorieDepenseListResponse> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit))
      .set('search', search);

    return this.http.get<CategorieDepenseListResponse>(`${this.apiUrl}/all`, { params });
  }

  getById(id: string): Observable<CategorieDepenseItemResponse> {
    return this.http.get<CategorieDepenseItemResponse>(`${this.apiUrl}/${id}`);
  }

  create(payload: CategorieDepense): Observable<CategorieDepenseItemResponse> {
    return this.http.post<CategorieDepenseItemResponse>(this.apiUrl, payload);
  }

  update(id: string, payload: CategorieDepense): Observable<CategorieDepenseItemResponse> {
    return this.http.put<CategorieDepenseItemResponse>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<{ statusCode: number; statusMessage: string; data: null }> {
    return this.http.delete<{ statusCode: number; statusMessage: string; data: null }>(
      `${this.apiUrl}/${id}`,
    );
  }
}
