import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'access_token';

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  setToken(token: string): void {
    if (!this.isBrowser()) {
      return;
    }

    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    if (!this.isBrowser()) {
      return;
    }

    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }
}
