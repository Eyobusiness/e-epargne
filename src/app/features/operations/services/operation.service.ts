import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { buildListParams } from '../../cotisations/utils/subscription-api.utils';
import { Operation } from '../models/operation.model';

@Injectable({
  providedIn: 'root',
})
export class OperationService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/operations`;

  getAll(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`, {
      params: buildListParams(params),
    });
  }

  getById(id: string): Observable<Operation> {
    return this.http.get<Operation>(`${this.apiUrl}/${id}`);
  }

  create(payload: Operation): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  update(id: string, payload: Partial<Operation>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  activate(
    id: string,
    payload: {
      moyen_operation: string;
      compte: string;
    },
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/activate`, payload);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
