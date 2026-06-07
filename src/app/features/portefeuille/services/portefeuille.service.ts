import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PortefeuilleService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/wallets`;

  getByAdherent(adherentId: string): Observable<any> {
    const params = new HttpParams().set('adherentId', adherentId);

    return this.http.get<any>(this.apiUrl, { params });
  }
}
