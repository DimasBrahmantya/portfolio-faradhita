import { NextResponse } from 'next/server';
import { getClientIp, safeComparePassword } from '@/lib/admin-auth';
import {
  clearLoginFailures,
  getRateLimitStatus,
  recordLoginFailure,
} from '@/lib/rate-limit';
import { getSessionCookieOptions, signSessionToken } from '@/lib/session';
import { formatZodError, loginSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const status = getRateLimitStatus(ip);

  if (status.blocked) {
    const mins = Math.ceil(status.retryAfterSeconds / 60);
    return NextResponse.json(
      {
        ok: false,
        error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${mins} menit.`,
        remaining: 0,
        retryAfterSeconds: status.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(status.retryAfterSeconds) },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Format request tidak valid.' },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) {
    return NextResponse.json(
      { ok: false, error: 'ADMIN_PASSWORD belum dikonfigurasi di server.' },
      { status: 500 }
    );
  }

  if (!safeComparePassword(parsed.data.password, expectedPassword)) {
    const after = recordLoginFailure(ip);
    const msg = after.blocked
      ? 'Password salah. Terlalu banyak percobaan gagal, coba lagi dalam 10 menit.'
      : `Password salah. Sisa ${after.remaining} percobaan dalam 10 menit.`;

    return NextResponse.json(
      {
        ok: false,
        error: msg,
        remaining: after.remaining,
        retryAfterSeconds: after.blocked ? after.retryAfterSeconds : undefined,
      },
      { status: after.blocked ? 429 : 401 }
    );
  }

  try {
    const token = await signSessionToken();
    clearLoginFailures(ip);

    const response = NextResponse.json({ ok: true });
    const cookieOpts = getSessionCookieOptions();
    response.cookies.set(cookieOpts.name, token, {
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: cookieOpts.maxAge,
    });

    return response;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Gagal membuat sesi login.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
