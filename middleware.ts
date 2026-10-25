import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'careerx_token';

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    // Check expiration
    if (parsed.exp && parsed.exp * 1000 < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? decodeJwtPayload(token) : null;

  // 1. Manager routes protection: strictly manager only
  if (pathname.startsWith('/manager')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (payload.role !== 'manager') {
      // Non-managers redirected to /resume
      return NextResponse.redirect(new URL('/resume', request.url));
    }
    return NextResponse.next();
  }

  // 2. User routes protection: /resume and /resume/*
  if (pathname === '/resume' || pathname.startsWith('/resume/')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (payload.role === 'manager') {
      return NextResponse.redirect(new URL('/manager', request.url));
    }
    return NextResponse.next();
  }

  // 3. Login page: redirect already authenticated users by role
  if (pathname === '/login') {
    if (payload) {
      if (payload.role === 'manager') {
        return NextResponse.redirect(new URL('/manager', request.url));
      }
      return NextResponse.redirect(new URL('/resume', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/resume/:path*', '/resume', '/manager/:path*', '/manager', '/login'],
};
