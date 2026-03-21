// src/app/api/admin/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session'; // adjust path if needed

export async function POST(req) {
  try {
    const body = await req.json();
    const password = body.password?.trim();

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid password' }, { status: 400 });
    }

    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
    if (!ADMIN_PASSWORD_HASH) {
      console.error('ADMIN_PASSWORD_HASH is missing in .env');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!isMatch) {
      return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
    }

    // Create secure session
    const session = await getSession();
    session.isAdmin = true;
    await session.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}