import { Depense, DepenseDocument } from '../models/depense.model';

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

export function unwrapApiItem<T>(response: { data?: unknown } | null | undefined): T | null {
  const data = response?.data;

  if (!data) {
    return null;
  }

  if (typeof data === 'object' && data !== null && 'id' in data) {
    return data as T;
  }

  if (typeof data === 'object' && data !== null && 'items' in data) {
    const items = (data as { items?: T[] }).items;

    return items?.[0] ?? null;
  }

  if (Array.isArray(data)) {
    return (data[0] as T | undefined) ?? null;
  }

  return null;
}

export function toIsoDateDepense(dateValue: string): string {
  if (!dateValue) {
    return '';
  }

  if (dateValue.includes('T')) {
    return dateValue;
  }

  return new Date(`${dateValue}T12:00:00`).toISOString();
}

export function toDateInputValue(dateValue?: string): string {
  if (!dateValue) {
    return '';
  }

  return dateValue.split('T')[0];
}

export function getDocumentPreviewUrl(document?: DepenseDocument | null): string {
  if (!document?.lien) {
    return '';
  }

  const lien = document.lien;

  if (lien.startsWith('data:') || lien.startsWith('http')) {
    return lien;
  }

  const ext = (document.extension || 'jpeg').toLowerCase();
  const mime = ext === 'pdf' ? 'application/pdf' : `image/${ext}`;

  return `data:${mime};base64,${lien}`;
}

export function getCategorieLabel(depense: Depense): string {
  return depense.categorie?.name ?? '--';
}

export function isDepenseActive(status?: string): boolean {
  return status === '200' || status === '100';
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
