import { NextResponse } from 'next/server';
import { connectDB, getDbStatus } from '@/lib/db';
import { OrderModel } from '@/models/Order';
import { ProductModel } from '@/models/Product';
import { CustomOrderModel } from '@/models/CustomOrder';
import { UserModel } from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    const [orders, prods, custom, users] = await Promise.all([
      OrderModel.find({}).sort({ createdAt: -1 }).lean(),
      ProductModel.find({}).lean(),
      CustomOrderModel.find({}).lean(),
      UserModel.find({ role: 'user' }).lean(),
    ]);

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);
    const totalProducts = prods.length;
    const pendingOrders = orders.filter((o: any) =>
      ['Pending', 'Confirmed', 'Processing', 'Creating Artwork'].includes(o.status)
    ).length;
    const deliveredOrders = orders.filter((o: any) => o.status === 'Delivered').length;
    const totalCustom = custom.length;
    const totalCustomers = users.length;

    return NextResponse.json({
      success: true,
      database: getDbStatus(),
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalProducts,
        totalCustomers,
        customOrdersCount: totalCustom,
        recentOrders: orders.slice(0, 6),
      },
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching stats' },
      { status: 500 }
    );
  }
}

