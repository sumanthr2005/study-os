import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'study_os_session';

// Public paths that do not require authentication
const PUBLIC_PAGE_PATHS = ['/login', '/register'];
const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/demo-login',
  '/api/auth/logout',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow static assets, images, public files, and Next.js internal pages
  if (
    pathname.startsWith('/_') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value || req.headers.get('authorization');
  const isAuthenticated = Boolean(token && token.trim().length > 0);

  // 2. Public auth endpoints
  if (PUBLIC_API_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 3. Handle Login/Register pages
  if (PUBLIC_PAGE_PATHS.includes(pathname)) {
    if (isAuthenticated) {
      // If already logged in, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // 4. In development mode with explicit dev bypass or during local test execution
  if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_FALLBACK === 'true') {
    return NextResponse.next();
  }

  // 5. Protected API routes
  if (pathname.startsWith('/api')) {
    // Allow local test calls if header has dev bypass, otherwise require token
    if (!isAuthenticated && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 6. Protected application pages
  if (!isAuthenticated && process.env.NODE_ENV === 'production') {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
