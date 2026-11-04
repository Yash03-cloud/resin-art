import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { CouponModel } from '@/models/Coupon';

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Coupon code is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const cleanCode = code.trim().toUpperCase();
    let coupon = await CouponModel.findOne({ code: cleanCode }).lean();

    // Built-in studio promo fallback if not seeded in collection
    if (!coupon && cleanCode === 'RESIN10') {
      coupon = {
        code: 'RESIN10',
        discount: 10,
        type: 'percentage',
      } as any;
    }

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Invalid coupon code. Try RESIN10' },
        { status: 404 }
      );
    }

    const discountAmount =
      coupon.type === 'percentage'
        ? Math.round((Number(subtotal) || 1000) * (coupon.discount / 100))
        : coupon.discount;

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discount: discountAmount,
      message: `Coupon ${coupon.code} applied successfully!`,
    });
  } catch (error: any) {
    console.error('Coupon apply error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error applying coupon' },
      { status: 500 }
    );
  }
}

