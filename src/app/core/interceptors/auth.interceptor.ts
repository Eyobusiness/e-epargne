// core/interceptors/auth.interceptor.ts

import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { of } from 'rxjs';

import { TokenService } from '../services/token.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

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

  const tokenService = inject(TokenService);
  const token = tokenService.getToken();

  if (!token) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(cloned);
};
