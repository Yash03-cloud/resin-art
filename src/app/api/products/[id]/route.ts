import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ProductModel } from '@/models/Product';
import { ReviewModel } from '@/models/Review';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const product = await ProductModel.findOne({ id }).lean();
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const reviews = await ReviewModel.find({ productId: id }).lean();
    return NextResponse.json({ success: true, product, reviews });
  } catch (error: any) {
    console.error('Single product fetch error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    await connectDB();

    const updated = await ProductModel.findOneAndUpdate({ id }, body, { returnDocument: 'after' }).lean();
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product card updated successfully',
      product: updated,
    });
  } catch (error: any) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    await ProductModel.deleteOne({ id });
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Product delete error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error deleting product' },
      { status: 500 }
    );
  }
}

