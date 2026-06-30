import { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  buildHmacMessage,
  hmacSha256Hex,
  resolveApiPath,
} from '../utils/hmac-signer.util';

export const hmacInterceptor: HttpInterceptorFn = (req, next) => {

  if (!environment.hmacEnabled || !environment.apiKey) {
    return next(req);
  }

  if (!req.url.startsWith(environment.apiUrl)) {
  return next(req);
}

  const timestamp = Math.floor(Date.now() / 1000).toString();

  const path = resolveApiPath(req.url);

  const message = buildHmacMessage(
    req.method,
    path,
    timestamp
  );

  return from(
    hmacSha256Hex(environment.apiKey, message)
  ).pipe(
    switchMap(signature =>
      next(
        req.clone({
          setHeaders: {
            'X-Timestamp': timestamp,
            'X-Hmac-Signature': signature,
          },
        })
      )
    )
  );
};