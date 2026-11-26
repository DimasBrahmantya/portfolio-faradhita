import 'server-only';

import { timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function requireAdminApiAuth(): Promise<NextResponse | null> {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json(
      { ok: false, error: 'Sesi tidak valid atau telah berakhir. Silakan login kembali.' },
      { status: 401 }
    );
  }
  return null;
}

export function safeComparePassword(input: string, expected: string): boolean {
  const inputBuf = Buffer.from(input, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');
  if (inputBuf.length !== expectedBuf.length) {
    // Compare against expectedBuf itself to keep timing roughly constant
    timingSafeEqual(expectedBuf, expectedBuf);
    return false;
  }
  return timingSafeEqual(inputBuf, expectedBuf);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'unknown';
}
