import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ProductModel } from '@/models/Product';

export async function DELETE() {
  try {
    await connectDB();
    const result = await ProductModel.deleteMany({});
    return NextResponse.json({
      success: true,
      message: `All demo products cleared successfully (${result.deletedCount} products removed). Ready for your own products! ✨`,
    });
  } catch (error: any) {
    console.error('Clear demo products error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error clearing demo products' },
      { status: 500 }
    );
  }
}

