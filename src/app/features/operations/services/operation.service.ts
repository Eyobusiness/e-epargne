import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { buildListParams } from '../../cotisations/utils/subscription-api.utils';
import { Operation } from '../models/operation.model';

export interface WithdrawalPreview {
  montant: number;
  montant_commission: number;
  montant_net: number;
  montant_net_a_percevoir: number;
  solde: number;
  montant_max_retrait: number;
  solde_suffisant: boolean;
}

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
    const { montant_commission, montant_net, ...cleanedPayload } = payload;
    return this.http.post(this.apiUrl, cleanedPayload);
  }

  update(id: string, payload: Partial<Operation>): Observable<any> {
    const { montant_commission, montant_net, ...cleanedPayload } = payload;
    return this.http.put(`${this.apiUrl}/${id}`, cleanedPayload);
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

  deactivate(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/deactivate`, {});
  }

  reject(
    id: string,
    payload: {
      motif: string;
      description: string;
    },
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/reject`, payload);
  }

  withdrawalPreview(montant: number, adherent_id: string): Observable<WithdrawalPreview> {
    return this.http
      .post<any>(`${this.apiUrl}/withdrawal-preview`, { montant, adherent_id })
      .pipe(
        map((response: any) => {
          // Réponse directe : { montant, montant_commission, ... }
          if (response && 'montant_commission' in response) {
            return response as WithdrawalPreview;
          }
          // Réponse encapsulée : { data: { montant, montant_commission, ... } }
          if (response?.data && 'montant_commission' in response.data) {
            return response.data as WithdrawalPreview;
          }
          return response as WithdrawalPreview;
        }),
      );
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
