import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { CustomOrderModel } from '@/models/CustomOrder';

export async function GET() {
  try {
    await connectDB();
    const list = await CustomOrderModel.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, customOrders: list });
  } catch (error: any) {
    console.error('Custom orders fetch error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching custom orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      productType,
      colorTheme,
      colorPreferences,
      dimensions,
      elements,
      designInstructions,
      budget,
      deadline,
    } = body;

    if (!name || !email || !designInstructions) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and design instructions are required' },
        { status: 400 }
      );
    }

    const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '7218700468';
    const newCustomOrder = {
      id: `CUST-${Date.now().toString(36).toUpperCase()}`,
      name,
      email,
      phone: phone || `+91 ${WHATSAPP_NUMBER}`,
      productType: productType || 'Custom Resin Piece',
      colorTheme: colorPreferences || colorTheme || 'Custom Palette',
      dimensions: dimensions || 'Custom Size',
      elements: elements || 'Epoxy Resin',
      designInstructions,
      budget: budget || 'To be quoted',
      deadline: deadline || 'Flexible',
      status: 'In Review',
      createdAt: new Date().toISOString().split('T')[0],
    };

    await connectDB();
    await CustomOrderModel.create(newCustomOrder);

    return NextResponse.json(
      {
        success: true,
        message: 'Custom order request received! We will contact you within 12 hours. ✨',
        customOrder: newCustomOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Custom order create error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error creating custom order' },
      { status: 500 }
    );
  }
}

