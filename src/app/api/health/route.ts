import { NextResponse } from 'next/server';
import { connectDB, getDbStatus } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
  } catch (err) {
    console.warn('Health check DB notice:', err);
  }

  const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '7218700468';

  return NextResponse.json({
    status: 'online',
    service: 'Resin Art Studio API (Next.js)',
    version: '3.0.0',
    whatsapp: WHATSAPP_NUMBER,
    database: getDbStatus(),
    timestamp: new Date().toISOString(),
  });
}

