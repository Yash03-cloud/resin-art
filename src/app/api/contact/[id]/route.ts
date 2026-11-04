import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ContactModel } from '@/models/Contact';

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    await ContactModel.findOneAndDelete({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    return NextResponse.json({ success: true, message: 'Message deleted successfully' });
  } catch (error: any) {
    console.error('Contact delete error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error deleting contact message' },
      { status: 500 }
    );
  }
}

