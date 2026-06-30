import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MenuService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/profiles/menus`;

  getAll(limit = 100): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/all`, {
        params: { limit: String(limit) }
      }
    );
  }
}