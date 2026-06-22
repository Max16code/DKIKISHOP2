// src/app/api/admin/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session'; // adjust path if needed

// ── Simple in-memory rate limiter (no external deps) ─────────────────────────────
const loginAttempts = new Map(); // key: IP, value: { count, resetTime }

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const maxAttempts = 5;

  let attempt = loginAttempts.get(ip);

  if (!attempt || now > attempt.resetTime) {
    // Reset or first attempt
    attempt = { count: 0, resetTime: now + windowMs };
    loginAttempts.set(ip, attempt);
  }

  attempt.count += 1;

  if (attempt.count > maxAttempts) {
    return {
      success: false,
      message: 'Too many failed login attempts. Please try again in 5 minutes.',
      remaining: 0,
    };
  }

  return {
    success: true,
    remaining: maxAttempts - attempt.count,
  };
}

// ── Cleanup old entries (prevents memory leak) ────────────────────────────────
setInterval(() => {
  const now = Date.now();
  for (const [ip, attempt] of loginAttempts.entries()) {
    if (now > attempt.resetTime) {
      loginAttempts.delete(ip);
    }
  }
}, 60 * 1000); // run every minute

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rate = checkRateLimit(ip);

    if (!rate.success) {
      return NextResponse.json(
        { error: rate.message, remaining: rate.remaining },
        { status: 429 }
      );
    }

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
      // Count failed attempt (already counted in checkRateLimit)
      return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
    }

    // Successful login — reset attempts for this IP
    loginAttempts.delete(ip);

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