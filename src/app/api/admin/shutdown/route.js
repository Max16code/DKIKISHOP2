import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';          // adjust if your dbConnect path differs
import Settings from '@/models/settings';
import { getSession } from '@/lib/session';     // ✅ use your custom iron-session helper

export async function POST(req) {
  // 1. Retrieve session using the same method as your admin page
  const session = await getSession();

  // 2. Check if user is authenticated and is admin
  if (!session || !session.isAdmin) {
    // Optional: log the session to debug
    console.log('Session in shutdown API:', session);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  // 3. Toggle the shutdown flag
  let settings = await Settings.findOne({ key: 'shutdown' });
  const current = settings ? settings.value : false;
  const newValue = !current;

  await Settings.findOneAndUpdate(
    { key: 'shutdown' },
    { value: newValue },
    { upsert: true, new: true }
  );

  return NextResponse.json({ shutdown: newValue });
}