import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';

import {
  CreateSubscriptionGroupPayload,
  SubscriptionGroup,
  SubscriptionGroupListResponse,
  UpdateSubscriptionGroupPayload,
  normalizeSubscriptionGroup,
  toSubscriptionGroupPayload,
} from '../models/subscription-group.model';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionGroupService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/groups/subscriptions`;

  getAll(): Observable<SubscriptionGroupListResponse> {
    return this.http.get<SubscriptionGroupListResponse>(`${this.apiUrl}/all`).pipe(
      map((response) => ({
        ...response,
        data: {
          items: (response.data?.items ?? []).map((item) => normalizeSubscriptionGroup(item)),
        },
      })),
    );
  }

  getById(id: string): Observable<SubscriptionGroup> {
    return this.http
      .get<SubscriptionGroup>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => normalizeSubscriptionGroup(response)));
  }

  create(
    payload: Partial<SubscriptionGroup> | CreateSubscriptionGroupPayload,
  ): Observable<SubscriptionGroup> {
    return this.http
      .post<SubscriptionGroup>(this.apiUrl, toSubscriptionGroupPayload(payload))
      .pipe(map((response) => normalizeSubscriptionGroup(response)));
  }

  update(
    id: string,
    payload: Partial<SubscriptionGroup> | UpdateSubscriptionGroupPayload,
  ): Observable<SubscriptionGroup> {
    return this.http
      .put<SubscriptionGroup>(`${this.apiUrl}/${id}`, toSubscriptionGroupPayload(payload))
      .pipe(map((response) => normalizeSubscriptionGroup(response)));
  }

  delete(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
