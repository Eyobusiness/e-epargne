import { ApplicationConfig, InjectionToken, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { withInterceptors } from '@angular/common/http';
import { authInterceptor } from '../app/core/interceptors/auth.interceptor';
import { hmacInterceptor } from '../app/core/interceptors/hmac.interceptor';
import { provideServiceWorker } from '@angular/service-worker';


import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { environment } from '@environments/environment';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, hmacInterceptor])
    ),

    provideClientHydration(withEventReplay()),

    {
      provide: API_BASE_URL,
      useValue: environment.apiUrl,
    },

    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
