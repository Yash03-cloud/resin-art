import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ContactModel } from '@/models/Contact';

export async function GET() {
  try {
    await connectDB();
    const messages = await ContactModel.find({}).sort({ createdAt: -1, _id: -1 }).lean();
    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error('Contact messages fetch error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching contact messages' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '7218700468';
    const now = new Date();
    const readableDate =
      now.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }) +
      ', ' +
      now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newMessage = {
      id: `msg-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : `+91 ${WHATSAPP_NUMBER}`,
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message.trim(),
      createdAt: readableDate,
      read: false,
    };

    await connectDB();
    await ContactModel.create(newMessage);

    return NextResponse.json(
      {
        success: true,
        message: "Message sent! We'll respond within 24 hours. 🎨",
        contactMessage: newMessage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Contact message create error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error sending contact message' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await connectDB();
    await ContactModel.deleteMany({});
    return NextResponse.json({ success: true, message: 'All contact messages deleted successfully' });
  } catch (error: any) {
    console.error('Clear contact messages error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error clearing contact messages' },
      { status: 500 }
    );
  }
}

