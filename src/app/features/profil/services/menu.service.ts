// services/menu.service.ts

import { HttpClient } from '@angular/common/http';

import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/menus`;

  getAll() {
    return this.http.get(`${this.apiUrl}/all`);
  }

  getById(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(payload: any) {
    return this.http.post(this.apiUrl, payload);
  }

  update(id: string, payload: any) {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
