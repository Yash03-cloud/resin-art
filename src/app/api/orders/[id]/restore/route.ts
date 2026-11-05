import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { OrderModel } from '@/models/Order';

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const order = await OrderModel.findOne({ id: new RegExp(`^${id}$`, 'i') }).lean();
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    if (!order.isDeleted) {
      return NextResponse.json(
        { success: false, message: 'Order is not in the recovery bin' },
        { status: 400 }
      );
    }

    // Check if within 2 days
    const deletedTime = order.deletedAt ? new Date(order.deletedAt).getTime() : 0;
    const now = Date.now();
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

    if (now - deletedTime > twoDaysMs) {
      return NextResponse.json(
        {
          success: false,
          message:
            'The 2-day recovery period for this order has expired. It can no longer be restored.',
        },
        { status: 410 }
      );
    }

    const restoreDate = new Date();
    const updated = await OrderModel.findOneAndUpdate(
      { id: new RegExp(`^${id}$`, 'i') },
      {
        $set: { isDeleted: false },
        $unset: { deletedAt: 1 },
        $push: {
          timeline: {
            status: 'Restored',
            date: `${restoreDate.toISOString().split('T')[0]} ${restoreDate.toTimeString().slice(0, 5)}`,
            note: 'Order restored from Recovery Bin by administrator.',
          },
        },
      },
      { returnDocument: 'after' }
    ).lean();

    return NextResponse.json({
      success: true,
      message: `Order ${id} restored successfully! ✨`,
      order: updated,
    });
  } catch (error: any) {
    console.error('Order restore error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error restoring order' },
      { status: 500 }
    );
  }
}

