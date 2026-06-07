import { JwtPayload, Env } from '../types';

export function base64UrlEncode(data: Uint8Array | ArrayBuffer): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): ArrayBuffer {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer as ArrayBuffer;
}

async function getSecret(env: Env): Promise<CryptoKey> {
  const secret = env.JWT_SECRET || 'dev-secret-change-in-production';
  const enc = new TextEncoder().encode(secret);
  return crypto.subtle.importKey('raw', enc, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function sign(payload: Omit<JwtPayload, 'exp'>, env: Env): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const token = { ...payload, exp: now + 86400 * 7 };
  const headerEnc = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadEnc = base64UrlEncode(new TextEncoder().encode(JSON.stringify(token)));
  const key = await getSecret(env);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${headerEnc}.${payloadEnc}`));
  return `${headerEnc}.${payloadEnc}.${base64UrlEncode(sig)}`;
}

export async function verify(token: string, env: Env): Promise<JwtPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerEnc, payloadEnc, sigEnc] = parts;
  try {
    const key = await getSecret(env);
    const valid = await crypto.subtle.verify('HMAC', key, base64UrlDecode(sigEnc), new TextEncoder().encode(`${headerEnc}.${payloadEnc}`));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadEnc))) as JwtPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
