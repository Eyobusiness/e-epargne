import { HttpBackend, HttpClient, HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { of, catchError, throwError, switchMap } from 'rxjs';

import { TokenService } from '../services/token.service';
import { SessionService } from '../services/session.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const tokenService = inject(TokenService);
  const sessionService = inject(SessionService);
  const httpBackend = inject(HttpBackend);

  // If running on Server-Side Rendering (SSR) and calling the API,
  // return an empty mock response to prevent 401 Unauthorized errors and Node console exceptions.
  if (!isPlatformBrowser(platformId) && req.url.startsWith(environment.apiUrl)) {
    const isList = req.url.includes('/all') || req.url.includes('page=') || req.url.includes('limit=');
    return of(
      new HttpResponse({
        status: 200,
        body: {
          data: isList ? [] : {},
          statusCode: 200,
          statusMessage: 'SSR Mock Response',
        },
      })
    );
  }

  const token = tokenService.getToken();

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Skip refreshing if the request was already a refresh request to avoid infinite loops
        if (req.url.includes('/users/refresh')) {
          sessionService.logout();
          return throwError(() => error);
        }

        const refreshToken = isPlatformBrowser(platformId) ? localStorage.getItem('refreshToken') : null;
        if (refreshToken) {
          const refreshClient = new HttpClient(httpBackend);
          return refreshClient.post<any>(`${environment.apiUrl}/users/refresh`, { refreshToken }).pipe(
            switchMap((res) => {
              const newToken = res?.token ?? res?.data?.token;
              const newRefreshToken = res?.refreshToken ?? res?.data?.refreshToken;

              if (newToken) {
                tokenService.setToken(newToken);
                if (newRefreshToken && isPlatformBrowser(platformId)) {
                  localStorage.setItem('refreshToken', newRefreshToken);
                }

                // Retry the request with the new access token
                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`,
                  },
                });
                return next(retryReq);
              }

              sessionService.logout();
              return throwError(() => error);
            }),
            catchError((refreshErr) => {
              sessionService.logout();
              return throwError(() => refreshErr);
            })
          );
        } else {
          sessionService.logout();
        }
      }
      return throwError(() => error);
    })
  );
};
