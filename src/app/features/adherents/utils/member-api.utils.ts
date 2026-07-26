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

export function getMimeTypeFromExtension(ext?: string): string {
  const cleanExt = (ext ?? '').toLowerCase().trim();
  switch (cleanExt) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

export function getDocumentReadUrl(readUrl?: string, extension?: string): string {
  if (!readUrl) {
    return '';
  }

  if (readUrl.startsWith('http://') || readUrl.startsWith('https://')) {
    return readUrl;
  }

  if (readUrl.startsWith('data:')) {
    return readUrl;
  }

  if (readUrl.startsWith('/') || readUrl.startsWith('uploads/') || readUrl.startsWith('storage/')) {
    const origin = environment.apiUrl.replace(/\/api\/v1\/?$/, '');
    return `${origin}${readUrl.startsWith('/') ? readUrl : `/${readUrl}`}`;
  }

  const isBase64Str = /^[A-Za-z0-9+/=]+$/.test(readUrl.replace(/\s/g, ''));
  if (isBase64Str && readUrl.length > 50) {
    const mime = getMimeTypeFromExtension(extension);
    return `data:${mime};base64,${readUrl.trim()}`;
  }

  const origin = environment.apiUrl.replace(/\/api\/v1\/?$/, '');
  return `${origin}${readUrl.startsWith('/') ? readUrl : `/${readUrl}`}`;
}

export function openDocumentInNewTab(readUrl?: string, extension?: string): void {
  const resolvedUrl = getDocumentReadUrl(readUrl, extension);
  if (!resolvedUrl) {
    return;
  }

  const cleanExt = (extension || getFileExtension(resolvedUrl)).toLowerCase();
  const mimeType = getMimeTypeFromExtension(cleanExt);

  if (resolvedUrl.startsWith('data:')) {
    try {
      const parts = resolvedUrl.split(';base64,');
      const contentType = mimeType !== 'application/octet-stream' ? mimeType : parts[0].replace('data:', '');
      const base64Data = parts[1] || parts[0];
      const byteCharacters = atob(base64Data.trim());
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open('about:blank', '_blank');
      if (win) {
        win.location.replace(blobUrl);
      } else {
        window.open(blobUrl, '_blank');
      }
    } catch (e) {
      console.error('Erreur conversion Blob:', e);
      const win = window.open('', '_blank');
      if (win) {
        if (cleanExt === 'pdf' || resolvedUrl.startsWith('data:application/pdf')) {
          win.document.write(`<!DOCTYPE html><html><head><title>Document PDF</title><style>html,body{margin:0;padding:0;height:100%;overflow:hidden;background:#525659;}embed{width:100%;height:100%;border:none;}</style></head><body><embed src="${resolvedUrl}" type="application/pdf" width="100%" height="100%" /></body></html>`);
        } else if (resolvedUrl.startsWith('data:image/')) {
          win.document.write(`<img src="${resolvedUrl}" style="max-width:100%;height:auto;" />`);
        } else {
          win.document.write(`<iframe src="${resolvedUrl}" style="width:100%;height:100vh;border:none;"></iframe>`);
        }
        win.document.close();
      }
    }
  } else {
    window.open(resolvedUrl, '_blank');
  }
}

export function isMemberActive(status?: string): boolean {
  return status === '200';
}

export function getMemberStatusLabel(status?: string): string {
  if (status === '200') {
    return 'Actif';
  }

  if (status === '0' || status === '300') {
    return 'Inactif';
  }

  return status ?? '--';
}
