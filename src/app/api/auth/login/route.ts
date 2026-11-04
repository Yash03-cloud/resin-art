import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserModel } from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@artvibe.in').toLowerCase();
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Artvibe@2026';

    await connectDB();

    // 1. Studio Admin check
    if (
      (cleanEmail === ADMIN_EMAIL ||
        cleanEmail === 'admin@artvibe.in' ||
        cleanEmail === 'charu@artvibe.in') &&
      password === ADMIN_PASSWORD
    ) {
      // Ensure admin exists in MongoDB
      const adminInMongo = await UserModel.findOne({ email: cleanEmail }).lean();
      if (!adminInMongo) {
        await UserModel.create({
          id: 'admin-artvibe',
          name: 'Charu (Admin)',
          email: cleanEmail,
          password: ADMIN_PASSWORD,
          role: 'admin',
          avatar: '/charu.jpg',
          createdAt: new Date().toISOString().split('T')[0],
        });
      }

      const adminUser = {
        id: 'admin-artvibe',
        name: 'Charu (Admin)',
        email: cleanEmail,
        role: 'admin',
        avatar: '/charu.jpg',
      };
      const token = `jwt_admin_${Date.now()}`;

      return NextResponse.json({
        success: true,
        message: 'Welcome back to Artvibe Studio, Charu! ⚡',
        user: adminUser,
        token,
      });
    }

    // 2. Check MongoDB for registered user
    const mongoUser = await UserModel.findOne({ email: cleanEmail }).lean();
    if (mongoUser && mongoUser.password === password) {
      const { password: _, ...userWithoutPassword } = mongoUser as any;
      const token = `jwt_token_${(mongoUser as any).id || (mongoUser as any)._id}_${Date.now()}`;

      return NextResponse.json({
        success: true,
        message: `Welcome back, ${mongoUser.name}!`,
        user: userWithoutPassword,
        token,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid email or password' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error occurred during login' },
      { status: 500 }
    );
  }
}

