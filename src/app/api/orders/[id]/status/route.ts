import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { OrderModel } from '@/models/Order';

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { status, note } = await req.json();

    const now = new Date();
    const newTimelineEvent = {
      status,
      date: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      note: note || `Order updated to "${status}"`,
    };

    await connectDB();

    const updated = await OrderModel.findOneAndUpdate(
      { id: new RegExp(`^${id}$`, 'i') },
      { status, $push: { timeline: newTimelineEvent } },
      { returnDocument: 'after' }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to "${status}"`,
      order: updated,
    });
  } catch (error: any) {
    console.error('Order status update error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating order status' },
      { status: 500 }
    );
  }
}

