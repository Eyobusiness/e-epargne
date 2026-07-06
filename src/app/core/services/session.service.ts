import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { catchError, finalize, of, tap } from 'rxjs';

import { SessionUser, SessionUserProfil } from '../models/session-user.model';
import { TokenService } from './token.service';
import { UtilisateurService } from '../../features/utilisateurs/services/utilisateur.service';
import {
  getUserIdFromToken,
  parseSessionUserFromToken,
} from '../utils/jwt-session.utils';
import { environment } from '../../../environments/environment';

const USER_STORAGE_KEY = 'current_user';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly httpBackend = inject(HttpBackend);

  readonly currentUser = signal<SessionUser | null>(null);
  readonly isLoadingProfile = signal(false);

  readonly isAuthenticated = computed(() => !!this.tokenService.getToken());

  readonly displayName = computed(
    () =>
      this.currentUser()?.name?.trim() ||
      this.currentUser()?.username?.trim() ||
      this.currentUser()?.email?.trim() ||
      this.currentUser()?.phone?.trim() ||
      this.currentUser()?.created_at?.trim() ||
      this.currentUser()?.updated_at?.trim() ||
      this.currentUser()?.last_login?.trim() || 
      'Utilisateur',
  );

  readonly profilLabel = computed(() => {
    const profil = this.currentUser()?.profil;

    return profil?.libelle?.trim() || profil?.name?.trim() || 'Profil';
  });

  readonly initials = computed(() => {
    const name = this.displayName();
    const parts = name.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  });

  constructor() {
    this.initializeSession();
  }

  initializeSession(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const token = this.tokenService.getToken();

    if (!token) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const refreshClient = new HttpClient(this.httpBackend);
        this.isLoadingProfile.set(true);
        refreshClient.post<any>(`${environment.apiUrl}/users/refresh`, { refreshToken }).subscribe({
          next: (res) => {
            const newToken = res?.token ?? res?.data?.token;
            const newRefreshToken = res?.refreshToken ?? res?.data?.refreshToken;
            if (newToken) {
              this.tokenService.setToken(newToken);
              if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
              }
              const userId = getUserIdFromToken(newToken);
              if (userId) {
                this.loadUserProfile(userId);
              }
            } else {
              this.clearSessionState();
            }
          },
          error: () => {
            this.clearSessionState();
          }
        });
      } else {
        this.clearSessionState();
      }
      return;
    }

    const userFromToken = parseSessionUserFromToken(token);

    if (userFromToken?.name) {
      this.applyUser(userFromToken);
      return;
    }

    const stored = this.readStoredUser();

    if (stored?.name) {
      this.currentUser.set(stored);
      return;
    }

    const userId = userFromToken?.id || stored?.id || getUserIdFromToken(token);

    if (userId) {
      this.loadUserProfile(userId);
    }
  }

  setSessionFromLogin(_response: unknown): void {
    const token = this.tokenService.getToken();

    if (!token) {
      return;
    }

    const userFromToken = parseSessionUserFromToken(token);

    if (userFromToken?.name) {
      this.applyUser(userFromToken);
      return;
    }

    const userId = getUserIdFromToken(token);

    if (userId) {
      this.loadUserProfile(userId);
    }
  }

  loadUserProfile(userId: string): void {
    if (this.isLoadingProfile()) {
      return;
    }

    this.isLoadingProfile.set(true);

    this.utilisateurService
      .getById(userId)
      .pipe(
        tap((response) => {
          const raw =
            (response as { data?: Record<string, unknown> })?.data ?? response;

          if (raw && typeof raw === 'object') {
            this.applyUser(this.normalizeUser(raw as Record<string, unknown>));
          }
        }),
        catchError(() => of(null)),
        finalize(() => this.isLoadingProfile.set(false)),
      )
      .subscribe();
  }

  getUser(): SessionUser | null {
    return this.currentUser();
  }

  getUserId(): string | null {
    return this.currentUser()?.id ?? null;
  }

  getProfilId(): string | null {
    return this.currentUser()?.profil_id ?? null;
  }

  logout(): void {
    this.tokenService.removeToken();

    if (typeof window !== 'undefined') {
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem(USER_STORAGE_KEY);
    }

    this.clearSessionState();
    this.router.navigate(['/auth/login']);
  }

  private applyUser(user: SessionUser): void {
    this.currentUser.set(user);
    this.persistUser(user);
  }

  private clearSessionState(): void {
    this.currentUser.set(null);
  }

  private persistUser(user: SessionUser): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem('user', JSON.stringify(user));
  }

  private readStoredUser(): SessionUser | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const raw = localStorage.getItem(USER_STORAGE_KEY) || localStorage.getItem('user');

    if (!raw) {
      return null;
    }

    try {
      return this.normalizeUser(JSON.parse(raw) as Record<string, unknown>);
    } catch {
      return null;
    }
  }

  private normalizeUser(raw: Record<string, unknown>): SessionUser {
    const profilRaw = raw['profil'] as Record<string, unknown> | null | undefined;
    const profilNested =
      (profilRaw?.['data'] as Record<string, unknown> | undefined)?.['profil'] ??
      profilRaw?.['profil'] ??
      profilRaw;

    const profil: SessionUserProfil | null =
      profilNested && typeof profilNested === 'object'
        ? {
            id:
              (profilNested as Record<string, unknown>)['id'] != null
                ? String((profilNested as Record<string, unknown>)['id'])
                : undefined,
            name:
              ((profilNested as Record<string, unknown>)['name'] as string | undefined) ??
              ((profilNested as Record<string, unknown>)['libelle'] as string | undefined),
            libelle: (profilNested as Record<string, unknown>)['libelle'] as
              | string
              | undefined,
            code: (profilNested as Record<string, unknown>)['code'] as string | undefined,
          }
        : null;

    const id = raw['id'] ?? raw['sub'];

    return {
      id: id != null ? String(id) : '',
      name:
        (raw['name'] as string | undefined) ??
        (raw['username'] as string | undefined) ??
        (raw['email'] as string | undefined)?.split('@')[0] ??
        '',
      email: raw['email'] as string | undefined,
      username: raw['username'] as string | undefined,
      phone: raw['phone'] as string | undefined,
      profil_id:
        raw['profil_id'] != null
          ? String(raw['profil_id'])
          : profil?.id != null
            ? String(profil.id)
            : null,
      profil,
    };
  }
}
