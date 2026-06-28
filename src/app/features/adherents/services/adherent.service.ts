import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  Adherent,
  CreateMemberPayload,
  MemberDetailResponse,
  MemberListResponse,
  UpdateMemberPayload,
} from '../models/adherent.model';

@Injectable({
  providedIn: 'root',
})
export class AdherentService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/members`;

  getAll(page = 1, limit = 10, search = '', status?: string): Observable<MemberListResponse> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    if (search) {
      params = params.set('search', search);
    }

    // IMPORTANT: backend exige `status` (comma-separated, ex: 200,100)
    // On envoie un status par défaut si non fourni.
    params = params.set('status', status?.trim() ? status.trim() : '200');

    return this.http.get<MemberListResponse>(`${this.apiUrl}/all`, { params });
  }


  getById(id: string): Observable<MemberDetailResponse> {
    return this.http.get<MemberDetailResponse>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateMemberPayload): Observable<{ statusCode: number; data: Adherent }> {
    return this.http.post<{ statusCode: number; data: Adherent }>(this.apiUrl, payload);
  }

  update(
    id: string,
    payload: UpdateMemberPayload,
  ): Observable<{ statusCode: number; data: Adherent }> {
    return this.http.put<{ statusCode: number; data: Adherent }>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<{ statusCode: number; statusMessage: string; data: null }> {
    return this.http.delete<{ statusCode: number; statusMessage: string; data: null }>(
      `${this.apiUrl}/${id}`,
    );
  }

  activate(id: string, member: Adherent): Observable<any> {
    const payload = {
      id: member.id,
      matricule: member.matricule || '',
      name: member.name,
      email: member.email,
      phone: member.phone,
      address: member.address || '',
      status: '200',
    };
    return this.http.put<any>(`${this.apiUrl}/${id}/activate`, payload);
  }

  deactivate(id: string, member: Adherent): Observable<any> {
    const payload = {
      id: member.id,
      matricule: member.matricule || '',
      name: member.name,
      email: member.email,
      phone: member.phone,
      address: member.address || '',
      status: '300',
    };
    return this.http.put<any>(`${this.apiUrl}/${id}/deactivate`, payload);
  }
}
