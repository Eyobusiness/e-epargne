import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  statusCode: number;
  statusMessage: string;
  data: T;
  meta?: any;
}

export interface ApiMenuItem {
  id?: string | null;
  name?: string;
  libelle?: string;
  reference?: string;
  path?: string;
  icon?: string;
  code?: string;
  permission?: string;
  order?: number | null;
  status?: string;
  sousMenus?: ApiMenuItem[];
}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/menus`;

  getMenus(limit = 100): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all`, {
      params: { limit: String(limit) }
    });
  }
}
