import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ContactModel } from '@/models/Contact';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { read = true } = await req.json();

    await connectDB();

    await ContactModel.findOneAndUpdate(
      { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: { read: Boolean(read) } }
    );

    return NextResponse.json({
      success: true,
      message: `Message marked as ${read ? 'read' : 'unread'}`,
    });
  } catch (error: any) {
    console.error('Contact read update error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating message status' },
      { status: 500 }
    );
  }
}

