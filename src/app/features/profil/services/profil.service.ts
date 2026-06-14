import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/profiles`;

  getAll(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/all`
    );
  }

  getById(id: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${id}`
    );
  }

  create(payload: any): Observable<any> {
    return this.http.post(
      this.apiUrl,
      payload
    );
  }

  update(
    id: string,
    payload: any,
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      payload
    );
  }

  createAdmin(
    code_store: string,
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/admin`,
      { code_store }
    );
  }
}