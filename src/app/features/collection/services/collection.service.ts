import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response.models';
import { environment } from '../../../../environments/environment';
import { Collection } from '../models/collection.model';

type CollectionResponse = ApiResponse<{ items?: Collection[] }> | Collection[] | { items: Collection[] } | any;

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/collections`;

  getCollections(limit = 1000): Observable<Collection[]> {
    return this.http
      .get<CollectionResponse>(`${this.apiUrl}/all`, {
        params: { limit: String(limit) },
      })
      .pipe(map((response) => this.unwrapList(response)));
  }

  private unwrapList(response: CollectionResponse): Collection[] {
    if (Array.isArray(response)) {
      return response;
    }
    if (response && typeof response === 'object') {
      const data = 'data' in response ? response.data : response;
      if (data && typeof data === 'object' && Array.isArray((data as { items?: Collection[] }).items)) {
        return (data as { items: Collection[] }).items;
      }
      if (Array.isArray(data)) {
        return data;
      }
      if ('items' in response && Array.isArray(response.items)) {
        return response.items;
      }
    }
    return [];
  }
}
