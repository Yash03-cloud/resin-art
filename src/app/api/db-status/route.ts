import { NextResponse } from 'next/server';
import { connectDB, getDbStatus } from '@/lib/db';

export async function GET() {
  const whatsappNumber = process.env.WHATSAPP_NUMBER || '7218700468';

  try {
    await connectDB();
    return NextResponse.json({
      success: true,
      status: getDbStatus(),
      whatsappNumber,
    });
  } catch (error) {
    console.error('DB status check failed:', error);
    return NextResponse.json(
      {
        success: false,
        status: getDbStatus(),
        message: 'MongoDB is unavailable. Check the server MONGODB_URI configuration and database access.',
        whatsappNumber,
      },
      { status: 503 }
    );
  }
}
