import { SessionUser, SessionUserProfil } from '../models/session-user.model';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');

    if (parts.length < 2) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractProfil(raw: unknown): SessionUserProfil | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const obj = raw as Record<string, unknown>;
  const nested =
    (obj['data'] as Record<string, unknown> | undefined)?.['profil'] ??
    obj['profil'] ??
    obj;

  if (!nested || typeof nested !== 'object') {
    return null;
  }

  const profil = nested as Record<string, unknown>;

  return {
    id: profil['id'] != null ? String(profil['id']) : undefined,
    name:
      (profil['name'] as string | undefined) ??
      (profil['libelle'] as string | undefined),
    libelle: profil['libelle'] as string | undefined,
    code: profil['code'] as string | undefined,
  };
}

export function parseSessionUserFromToken(token: string): SessionUser | null {
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return null;
  }

  const userRoot = payload['user'] as Record<string, unknown> | undefined;

  if (!userRoot) {
    const flatId = payload['id'] ?? payload['sub'] ?? payload['userId'];

    if (flatId == null) {
      return null;
    }

    return {
      id: String(flatId),
      name:
        (payload['name'] as string | undefined) ??
        (payload['username'] as string | undefined) ??
        '',
      email: payload['email'] as string | undefined,
      username: payload['username'] as string | undefined,
      profil_id:
        payload['profil_id'] != null ? String(payload['profil_id']) : null,
    };
  }

  const dataBlock = userRoot['data'] as Record<string, unknown> | undefined;
  const userData = (dataBlock?.['user'] ?? userRoot) as Record<string, unknown>;
  const profil = extractProfil(dataBlock?.['profil']);

  const id =
    userData['id'] ?? userRoot['id'] ?? payload['id'] ?? payload['sub'];

  if (id == null) {
    return null;
  }

  return {
    id: String(id),
    name:
      (userData['name'] as string | undefined) ??
      (userData['username'] as string | undefined) ??
      (userData['email'] as string | undefined)?.split('@')[0] ??
      '',
    email: userData['email'] as string | undefined,
    username: userData['username'] as string | undefined,
    phone: userData['phone'] as string | undefined,
    profil_id:
      userData['profil_id'] != null
        ? String(userData['profil_id'])
        : userRoot['profil_id'] != null
          ? String(userRoot['profil_id'])
          : profil?.id ?? null,
    profil,
  };
}

export function getUserIdFromToken(token: string): string | null {
  const user = parseSessionUserFromToken(token);

  return user?.id ?? null;
}
