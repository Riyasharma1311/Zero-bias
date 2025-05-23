import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/health',
  // Add other public paths
  '/login',
  '/_next',
  '/favicon.ico',
];

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

function decodeJwt(token: string): TokenPayload {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

// Create a secret key once
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // read cookie access_token
  const accessToken = request.cookies.get('access_token');
  if (!accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Decode JWT token without verification
    const payload = decodeJwt(accessToken.value);

    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub?.toString() || '');
    requestHeaders.set('x-user-email', payload.email?.toString() || '');
    requestHeaders.set('x-user-role', payload.role?.toString() || '');

    // Continue with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    // Redirect to login on invalid token format
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 