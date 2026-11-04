import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { OrderModel } from '@/models/Order';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const order = await OrderModel.findOne({ id: new RegExp(`^${id}$`, 'i') }).lean();
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found. Check order ID and try again.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Single order fetch error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching order' },
      { status: 500 }
    );
  }
}

