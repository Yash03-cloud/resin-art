import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserModel } from '@/models/User';

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@artvibe.in').toLowerCase();

    if (
      cleanEmail === ADMIN_EMAIL ||
      cleanEmail === 'admin@artvibe.in' ||
      cleanEmail === 'charu@artvibe.in'
    ) {
      return NextResponse.json(
        { success: false, message: 'This email is reserved for Studio Administration' },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await UserModel.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? String(phone).trim() : '',
      password,
      role: 'user',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=6B46C1&color=fff`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    await UserModel.create(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    const token = `jwt_token_${newUser.id}_${Date.now()}`;

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! Welcome to Artvibe by Charu.',
        user: userWithoutPassword,
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error occurred during registration' },
      { status: 500 }
    );
  }
}

