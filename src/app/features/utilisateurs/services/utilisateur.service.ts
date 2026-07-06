import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { User, CreateUserDto, UpdateUserDto } from '../models/utilisateur.model';

export interface GetAllUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UtilisateurService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/users`;

  readonly usersCache = signal<User[]>([]);
  private isFetchingCache = false;

  loadAllUsersToCache(): void {
    if (this.isFetchingCache) {
      console.log('[UtilisateurService] Déjà en cours de chargement du cache.');
      return;
    }
    console.log('[UtilisateurService] Démarrage du chargement du cache des utilisateurs...');
    this.isFetchingCache = true;

    this.getAll({ page: 1, limit: 1000, status: '200' }).subscribe({
      next: (resActive) => {
        const activeItems = Array.isArray(resActive?.data)
          ? resActive.data
          : (resActive?.data?.items ?? []);
        console.log(`[UtilisateurService] ${activeItems.length} utilisateurs actifs chargés.`);

        this.getAll({ page: 1, limit: 1000, status: '300' }).subscribe({
          next: (resInactive) => {
            const inactiveItems = Array.isArray(resInactive?.data)
              ? resInactive.data
              : (resInactive?.data?.items ?? []);
            console.log(`[UtilisateurService] ${inactiveItems.length} utilisateurs inactifs chargés.`);

            const allUsers = [...activeItems, ...inactiveItems];
            console.log(`[UtilisateurService] Cache mis à jour avec ${allUsers.length} utilisateurs au total.`);
            this.usersCache.set(allUsers);
            this.isFetchingCache = false;
          },
          error: (err) => {
            console.error('[UtilisateurService] Erreur lors du chargement des inactifs:', err);
            this.usersCache.set(activeItems);
            this.isFetchingCache = false;
          }
        });
      },
      error: (err) => {
        console.error('[UtilisateurService] Erreur lors du chargement des actifs:', err);
        this.isFetchingCache = false;
      }
    });
  }

  getUserName(userId: string | null | undefined): string {
    if (!userId) return '--';

    const cache = this.usersCache();
    console.log(`[UtilisateurService] Résolution de ${userId}. Taille du cache actuel : ${cache.length}`);

    if (cache.length === 0) {
      this.loadAllUsersToCache();
      return `${userId} (Chargement...)`;
    }

    const user = cache.find((u) => u && String(u.id) === String(userId));
    if (user) {
      console.log(`[UtilisateurService] Résolu ${userId} -> ${user.name}`);
      return user.name;
    } else {
      console.warn(`[UtilisateurService] Impossible de trouver l'utilisateur avec l'ID ${userId} dans le cache.`);
      return `${userId} (Non trouvé, Cache: ${cache.length})`;
    }
  }

  getAll(params?: GetAllUsersParams): Observable<any> {
    let httpParams = new HttpParams();

    // Status est requis par l'API
    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }

    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }

    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params?.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    if (params?.order) {
      httpParams = httpParams.set('order', params.order);
    }

    return this.http.get<any>(`${this.apiUrl}/all`, { params: httpParams });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateUserDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateUserDto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  activate(id: string, user: User): Observable<any> {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      code: user.code,
      status: '200',
    };
    return this.http.put<any>(`${this.apiUrl}/${id}/activate`, payload);
  }

  deactivate(id: string, user: User): Observable<any> {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      code: user.code,
      status: '300',
    };
    return this.http.put<any>(`${this.apiUrl}/${id}/deactivate`, payload);
  }
}
