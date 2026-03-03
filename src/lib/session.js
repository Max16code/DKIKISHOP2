// src/lib/session.js
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export const sessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD || '', // fallback to empty (will be checked later)
  cookieName: 'kikishop_admin_sid',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  },
};

export async function getSession() {
  const password = process.env.IRON_SESSION_PASSWORD;

  if (!password || password.length < 32) {
    console.error('IRON_SESSION_PASSWORD is missing or too short in .env');
    throw new Error('Server configuration error: session secret missing');
  }

  const cookieStore = cookies();
  return getIronSession(cookieStore, sessionOptions);
}