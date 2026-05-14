// middleware.js
import { NextResponse } from 'next/server';

// CORS headers (for API routes)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace with your domain(s)
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export function middleware(req) {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;

  // ---------- API Routes (CORS) ----------
  if (pathname.startsWith('/api')) {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // For normal requests, add CORS headers and continue
    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // ---------- Admin Routes (Protected) ----------
  const protectedPaths = ['/admin', '/admin/dashboard'];
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    const isLoggedIn = req.cookies.get('admin_logged_in')?.value === 'true';
    if (!isLoggedIn) {
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  // All other routes – pass through
  return NextResponse.next();
}

// Apply middleware to both API and admin routes
export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
};