import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE_NAME = 'fes_admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 hari

function getSessionSecretKey(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret || secret.length < 16) return null;
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(): Promise<string> {
  const key = getSessionSecretKey();
  if (!key) {
    throw new Error('SESSION_SECRET belum dikonfigurasi (minimal 32 karakter).');
  }

  return new SignJWT({ role: 'owner' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key);
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const key = getSessionSecretKey();
  if (!key) return false;

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload.role === 'owner';
  } catch {
    return false;
  }
}

export function getSessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}
