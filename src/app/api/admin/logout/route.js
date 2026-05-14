// app/api/admin/logout/route.ts
import { NextResponse } from 'next/server';
import { getSession, sessionOptions } from '@/lib/session';

export async function POST() {
  const session = await getSession();
  session.destroy(); // clears the cookie

  return NextResponse.json({ success: true });
}