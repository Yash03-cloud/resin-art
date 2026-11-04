import { NextResponse } from 'next/server';
import { connectDB, getDbStatus } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
  } catch (err) {
    console.warn('DB status check notice:', err);
  }

  const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '7218700468';

  return NextResponse.json({
    success: true,
    status: getDbStatus(),
    whatsappNumber: WHATSAPP_NUMBER,
  });
}

