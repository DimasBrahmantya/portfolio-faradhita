import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isLoginPage = pathname === '/admin/login';
  const isLoginApi = pathname === '/api/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin');
  const isAdminPage = pathname.startsWith('/admin');

  if (isLoginApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthed = await verifySessionToken(token);

  if (isAdminApi) {
    if (!isAuthed) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized. Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  if (isAdminPage) {
    if (isLoginPage) {
      if (isAuthed) {
        const target = new URL('/admin/profil', request.url);
        return NextResponse.redirect(target);
      }
      const res = NextResponse.next();
      res.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return res;
    }

    if (!isAuthed) {
      const loginUrl = new URL('/admin/login', request.url);
      if (pathname !== '/admin') {
        loginUrl.searchParams.set('next', `${pathname}${search}`);
      }
      return NextResponse.redirect(loginUrl);
    }

    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
