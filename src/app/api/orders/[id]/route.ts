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

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get('permanent') === 'true';

    await connectDB();

    if (permanent) {
      await OrderModel.deleteOne({ id: new RegExp(`^${id}$`, 'i') });
      return NextResponse.json({
        success: true,
        message: `Order ${id} permanently deleted.`,
      });
    }

    // Soft delete with 2-day recovery window
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const updated = await OrderModel.findOneAndUpdate(
      { id: new RegExp(`^${id}$`, 'i') },
      {
        $set: {
          isDeleted: true,
          deletedAt: now,
        },
        $push: {
          timeline: {
            status: 'Deleted (In Recovery Bin)',
            date: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
            note: 'Order moved to Trash. Recoverable within 2 days.',
          },
        },
      },
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
      message: `Order ${id} deleted. You can restore it from the Recovery Bin within 2 days.`,
      order: updated,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Order delete error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error deleting order' },
      { status: 500 }
    );
  }
}
