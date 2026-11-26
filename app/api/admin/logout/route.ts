import { NextResponse } from 'next/server';
import { getSessionCookieOptions } from '@/lib/session';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const cookieOpts = getSessionCookieOptions(0);
  response.cookies.set(cookieOpts.name, '', {
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    path: cookieOpts.path,
    maxAge: 0,
  });
  return response;
}
