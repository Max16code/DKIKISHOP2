// middleware.js
import { NextResponse } from 'next/server'

// List of admin routes to protect
const protectedPaths = ['/admin', '/admin/dashboard']

export function middleware(req) {
  const url = req.nextUrl.clone()
  const { pathname } = req.nextUrl

  // Only protect admin routes
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    // Check cookie for admin login
    const isLoggedIn = req.cookies.get('admin_logged_in')?.value === 'true'

    if (!isLoggedIn) {
      // Redirect to admin login if not logged in
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  // Allow access if logged in or route not protected
  return NextResponse.next()
}

// Apply middleware to all admin routes
export const config = {
  matcher: ['/admin/:path*'],
}

