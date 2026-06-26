import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '@core/models/api-response.models';
import { API_BASE_URL } from '../../../app.config';

import { Parametre } from '../models/parametre.models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ParametreService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private readonly API_URL = `${environment.apiUrl}/settings`;

  getAll(limit = 1000): Observable<ApiResponse<{ items: Parametre[] }>> {
    return this.http.get<ApiResponse<{ items: Parametre[] }>>(`${this.API_URL}/all`, {
      params: { limit: String(limit) },
    });
  }

  getById(id: string): Observable<ApiResponse<Parametre>> {
    return this.http.get<ApiResponse<Parametre>>(`${this.API_URL}/${id}`);
  }

  create(payload: Parametre): Observable<ApiResponse<Parametre>> {
    return this.http.post<ApiResponse<Parametre>>(this.API_URL, payload);
  }

  update(id: string, payload: Parametre): Observable<ApiResponse<Parametre>> {
    return this.http.put<ApiResponse<Parametre>>(`${this.API_URL}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.API_URL}/${id}`);
  }

  encrypt(payload: {
    nom: string;
    type: string;
    valeur: string;
    libelle: string;
    parent: string;
  }): Observable<any> {
    return this.http.post(`${this.API_URL}/encrypt`, payload);
  }

  decrypt(payload: {
    nom: string;
    type: string;
    valeur: string;
    libelle: string;
    parent: string;
  }): Observable<any> {
    return this.http.post(`${this.API_URL}/decrypt`, payload);
  }
}
