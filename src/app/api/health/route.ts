import { NextResponse } from 'next/server';
import { connectDB, getDbStatus } from '@/lib/db';

export async function GET() {
  const whatsappNumber = process.env.WHATSAPP_NUMBER || '7218700468';

  try {
    await connectDB();
    return NextResponse.json({
      status: 'online',
      service: 'Resin Art Studio API (Next.js)',
      version: '3.0.0',
      whatsapp: whatsappNumber,
      database: getDbStatus(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check database connection failed:', error);
    return NextResponse.json(
      {
        status: 'degraded',
        service: 'Resin Art Studio API (Next.js)',
        version: '3.0.0',
        whatsapp: whatsappNumber,
        database: getDbStatus(),
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
