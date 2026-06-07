import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ProfilResponse, Profil } from '../models/profil.model';

@Injectable({
  providedIn: 'root',
})
export class ProfilService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/profiles`;

  getAll(): Observable<ProfilResponse> {
    return this.http.get<ProfilResponse>(`${this.apiUrl}/all`);
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  update(id: string, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getAdminProfil(payload: { code_store: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin`, payload);
  }
}
