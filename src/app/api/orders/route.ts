import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { OrderModel } from '@/models/Order';
import { ProductModel } from '@/models/Product';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const trash = searchParams.get('trash') === 'true';

    await connectDB();

    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const query: any = email ? { email: new RegExp(`^${email}$`, 'i') } : {};

    if (trash) {
      // Only fetch orders deleted within the 2-day window
      query.isDeleted = true;
      query.deletedAt = { $gte: twoDaysAgo };
    } else {
      query.isDeleted = { $ne: true };
    }

    const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer, email, phone, address, items, amount } = body;

    if (!items || !items.length || !address) {
      return NextResponse.json(
        { success: false, message: 'Items and delivery address are required' },
        { status: 400 }
      );
    }

    const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '7218700468';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `ORD${randomSuffix}`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const firstCustomPhotoItem = (items || []).find((i: any) => i.customImage);
    const customImage = firstCustomPhotoItem?.customImage || body.customImage || '';
    const customNote = firstCustomPhotoItem?.customNote || body.customNote || '';

    const newOrder = {
      id: newOrderId,
      customer: customer || 'Customer',
      email: email || 'customer@resinart.studio',
      phone: phone || `+91 ${WHATSAPP_NUMBER}`,
      address,
      product: items[0]?.title + (items.length > 1 ? ` (+${items.length - 1} more items)` : ''),
      items,
      customImage,
      customNote,
      amount:
        Number(amount) ||
        items.reduce((s: number, i: any) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0),
      status: 'Confirmed',
      payment: 'Cash on Delivery (Pending)',
      date: dateStr,
      estimatedDelivery: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      trackingNumber: `BD${Math.floor(100000 + Math.random() * 900000)}IN`,
      timeline: [
        {
          status: 'Pending',
          date: `${dateStr} ${timeStr}`,
          note: 'Order placed by customer (Cash on Delivery)',
        },
        {
          status: 'Confirmed',
          date: `${dateStr} ${timeStr}`,
          note: 'Order confirmed and queued for handcrafting',
        },
      ],
    };

    await connectDB();
    await OrderModel.create(newOrder);

    // Decrement stock in MongoDB products
    for (const item of items) {
      if (item.id) {
        await ProductModel.findOneAndUpdate(
          { id: item.id },
          {
            $inc: {
              stock: -Math.max(1, Number(item.quantity) || 1),
              sold: Math.max(1, Number(item.quantity) || 1),
            },
          }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully! 🎉',
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error creating order' },
      { status: 500 }
    );
  }
}

