import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';

import {
  CreateGroupePayload,
  Groupe,
  GroupeListResponse,
  GroupeSource,
  UpdateGroupePayload,
  normalizeGroupe,
  toGroupePayload,
} from '../models/groupe.model';

@Injectable({
  providedIn: 'root',
})
export class GroupeService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/groups/subscriptions`;

  getAll(status?: string, page = 1, limit = 10): Observable<GroupeListResponse> {
    return this.http.get<GroupeListResponse>(`${this.apiUrl}/all`).pipe(
      map((response) => {
        const items = (response.data?.items ?? [])
          .map((item) => normalizeGroupe(item))
          .filter((item) => (!status ? true : item.status === status));

        return {
          ...response,
          data: {
            items,
          },
          meta: response.meta ?? {
            total: items.length,
            previous: page > 1 ? page - 1 : null,
            next: items.length > limit ? page + 1 : null,
            current: page,
            limit,
          },
        };
      }),
    );
  }

  getById(id: string): Observable<Groupe> {
    return this.http
      .get<Groupe>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => normalizeGroupe(response)));
  }

  create(payload: Partial<Groupe> | CreateGroupePayload): Observable<Groupe> {
    return this.http.post<Groupe>(this.apiUrl, toGroupePayload(payload as GroupeSource)).pipe(
      map((response) => normalizeGroupe(response)),
    );
  }

  update(id: string, payload: Partial<Groupe> | UpdateGroupePayload): Observable<Groupe> {
    return this.http
      .put<Groupe>(`${this.apiUrl}/${id}`, toGroupePayload(payload as GroupeSource))
      .pipe(map((response) => normalizeGroupe(response)));
  }

  delete(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
