import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly sessionService = inject(SessionService);

  private readonly apiUrl = `${environment.apiUrl}/users`;

  login(payload: { username: string; password: string }): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/login`, payload).pipe(
      tap((response: unknown) => {
        const res = response as Record<string, unknown>;
        const token =
          (res?.['token'] as string | undefined) ??
          ((res?.['data'] as Record<string, unknown> | undefined)?.['token'] as
            | string
            | undefined);

        if (token) {
          this.tokenService.setToken(token);
        }

        const refreshToken =
          (res?.['refreshToken'] as string | undefined) ??
          ((res?.['data'] as Record<string, unknown> | undefined)?.['refreshToken'] as
            | string
            | undefined);

        if (refreshToken && typeof window !== 'undefined') {
          localStorage.setItem('refreshToken', refreshToken);
        }

        this.sessionService.setSessionFromLogin(response);
      }),
    );
  }

  refresh(refreshToken: string): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/refresh`, { refreshToken });
  }

  forgotPassword(payload: { email: string }): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/forgot/password`, payload);
  }

  changePassword(payload: {
    email: string;
    oldpassword: string;
    password: string;
  }): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/change/password`, payload);
  }

  logout(): void {
    this.sessionService.logout();
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasToken();
  }
}
