// services/utilisateur.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { User, CreateUserDto, UpdateUserDto } from '../models/utilisateur.model';

export interface GetAllUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UtilisateurService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/users`;

  getAll(params?: GetAllUsersParams): Observable<any> {
    let httpParams = new HttpParams();

    // Status est requis par l'API
    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }

    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }

    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params?.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    if (params?.order) {
      httpParams = httpParams.set('order', params.order);
    }

    return this.http.get<any>(`${this.apiUrl}/all`, { params: httpParams });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateUserDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateUserDto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  activate(id: string, user: User): Observable<any> {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      code: user.code,
      status: '200',
    };
    return this.http.put<any>(`${this.apiUrl}/${id}/activate`, payload);
  }

  deactivate(id: string, user: User): Observable<any> {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      code: user.code,
      status: '300',
    };
    return this.http.put<any>(`${this.apiUrl}/${id}/deactivate`, payload);
  }
}
