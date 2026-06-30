export async function hmacSha256Hex(
  secret: string,
  message: string
): Promise<string> {
  const enc = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    enc.encode(message)
  );

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function resolveApiPath(url: string): string {
  try {
    return new URL(url, window.location.origin).pathname;
  } catch {
    return url.split('?')[0];
  }
}

export function buildHmacMessage(
  method: string,
  path: string,
  timestamp: string
): string {
  return `${method.toUpperCase()}\n${path}\n${timestamp}`;
}