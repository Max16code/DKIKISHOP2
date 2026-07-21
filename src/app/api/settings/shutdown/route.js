// app/api/settings/shutdown/route.js
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/settings';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  const settings = await Settings.findOne({ key: 'shutdown' });
  const shutdown = settings ? settings.value : false;
  return NextResponse.json({ shutdown });
}