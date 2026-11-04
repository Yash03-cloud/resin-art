import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ReviewModel } from '@/models/Review';
import { ProductModel } from '@/models/Product';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    await connectDB();

    const query = productId ? { productId } : {};
    const reviews = await ReviewModel.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { productId, userName, rating, comment } = await req.json();

    if (!productId || !userName || !comment) {
      return NextResponse.json(
        { success: false, message: 'Product ID, name, and comment are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const newReview = {
      id: `rev-${Date.now()}`,
      productId,
      userName,
      avatar: `https://i.pravatar.cc/60?u=${encodeURIComponent(userName)}`,
      rating: Number(rating) || 5,
      date: new Date().toISOString().split('T')[0],
      comment,
    };

    await ReviewModel.create(newReview);

    const productReviews = await ReviewModel.find({ productId });
    const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    const updatedRating = Number(avg.toFixed(1));

    await ProductModel.findOneAndUpdate(
      { id: productId },
      { rating: updatedRating, reviews: productReviews.length }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Review posted successfully! ⭐',
        review: newReview,
        updatedRating,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Review create error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error posting review' },
      { status: 500 }
    );
  }
}

