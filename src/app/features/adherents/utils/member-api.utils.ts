import { environment } from '../../../../environments/environment';

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

export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;

      resolve(base64);
    };

    reader.onerror = () => reject(reader.error);

    reader.readAsDataURL(file);
  });
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');

  return parts.length > 1 ? parts.pop()!.toLowerCase() : 'jpeg';
}

export function getDocumentReadUrl(readUrl?: string): string {
  if (!readUrl) {
    return '';
  }

  if (readUrl.startsWith('http')) {
    return readUrl;
  }

  const origin = environment.apiUrl.replace(/\/api\/v1\/?$/, '');

  return `${origin}${readUrl.startsWith('/') ? readUrl : `/${readUrl}`}`;
}

export function isMemberActive(status?: string): boolean {
  return status === '200';
}

export function getMemberStatusLabel(status?: string): string {
  if (status === '200') {
    return 'Actif';
  }

  if (status === '0') {
    return 'Inactif';
  }

  return status ?? '--';
}
