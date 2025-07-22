// src/middleware.js
import { NextResponse } from 'next/server'

export function middleware(req) {
  const isAdmin = req.cookies.get('admin_auth')?.value === 'true'
  const isLoginPage = req.nextUrl.pathname === '/admin/login'

  if (!isAdmin && req.nextUrl.pathname.startsWith('/admin') && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
