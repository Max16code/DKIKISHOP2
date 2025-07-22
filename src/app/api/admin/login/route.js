import { NextResponse } from 'next/server'

export async function POST(req) {
  const { password } = await req.json()
  const adminPassword = process.env.ADMIN_PASSWORD

  if (password === adminPassword) {
    const res = NextResponse.json({ success: true })
    res.cookies.set('admin_auth', 'true', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })
    return res
  }

  return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 })
}
