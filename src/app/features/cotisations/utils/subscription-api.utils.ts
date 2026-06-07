import { HttpParams } from '@angular/common/http';

export function extractApiErrorMessage(error: unknown): string {
  const err = error as {
    error?: { message?: string | Array<string | { message?: string }> };
    message?: string;
  };

  if (err?.error?.message && Array.isArray(err.error.message)) {
    return err.error.message
      .map((msg) => (typeof msg === 'string' ? msg : msg?.message || JSON.stringify(msg)))
      .join(', ');
  }

  if (typeof err?.error?.message === 'string') {
    return err.error.message;
  }

  if (typeof err?.message === 'string') {
    return err.message;
  }

  return '';
}

export function buildListParams(params: object): HttpParams {
  let httpParams = new HttpParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      httpParams = httpParams.set(key, String(value));
    }
  }

  return httpParams;
}

export function isSubscriptionActive(status?: string): boolean {
  return status === '200';
}

export function getSubscriptionStatusLabel(status?: string): string {
  if (status === '200') {
    return 'Actif';
  }

  if (status === '0') {
    return 'Inactif';
  }

  return status ?? '--';
}
