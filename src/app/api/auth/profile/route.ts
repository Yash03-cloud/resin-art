import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserModel } from '@/models/User';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'No authorization token provided' },
        { status: 401 }
      );
    }

    await connectDB();

    const token = authHeader.replace(/^Bearer\s+/, '');
    if (token.startsWith('jwt_admin_')) {
      return NextResponse.json({
        success: true,
        user: {
          id: 'admin-artvibe',
          name: 'Charu (Admin)',
          email: process.env.ADMIN_EMAIL || 'admin@artvibe.in',
          role: 'admin',
          avatar: '/charu.jpg',
        },
      });
    }

    const parts = token.split('_');
    const userId = parts[2]; // jwt_token_ID_timestamp
    let user = null;
    if (userId) {
      user = await UserModel.findOne({
        $or: [{ id: userId }, { _id: userId.match(/^[0-9a-fA-F]{24}$/) ? userId : null }],
      }).lean();
    }

    if (!user) {
      user = await UserModel.findOne({ role: 'user' }).lean();
    }

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = user as any;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, phone, address } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    await connectDB();

    const updatedUser = await UserModel.findOneAndUpdate(
      { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      {
        $set: {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(address && { address }),
        },
      },
      { returnDocument: 'after' }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = updatedUser as any;
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

