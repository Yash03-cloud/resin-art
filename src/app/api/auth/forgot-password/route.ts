import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserModel } from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email, phone, newPassword } = await req.json();
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';

    if (!cleanEmail && !cleanPhone) {
      return NextResponse.json(
        { success: false, message: 'Please provide either your registered email or phone number' },
        { status: 400 }
      );
    }

    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@artvibe.in').toLowerCase();
    if (
      cleanEmail === ADMIN_EMAIL ||
      cleanEmail === 'admin@artvibe.in' ||
      cleanEmail === 'charu@artvibe.in'
    ) {
      return NextResponse.json({
        success: true,
        isAdmin: true,
        name: 'Charu (Admin)',
        email: cleanEmail,
        message:
          'Official Studio Admin Account. For security, admin passwords cannot be reset publicly. Please contact studio hotline.',
      });
    }

    await connectDB();

    let foundUser: any = null;
    if (cleanEmail) {
      foundUser = await UserModel.findOne({ email: cleanEmail }).lean();
    } else if (cleanPhone) {
      foundUser = await UserModel.findOne({ phone: { $regex: cleanPhone } }).lean();
    }

    if (!foundUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'No account found with this email or phone number. Check details or contact WhatsApp support.',
        },
        { status: 404 }
      );
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: 'New password must be at least 6 characters' },
          { status: 400 }
        );
      }

      await UserModel.findOneAndUpdate(
        { email: foundUser.email },
        { $set: { password: newPassword } }
      );

      return NextResponse.json({
        success: true,
        message: `Password reset successfully for ${foundUser.name}! You can now sign in with your new password. ✨`,
        email: foundUser.email,
      });
    }

    const maskEmail = (str: string) => {
      const [name, domain] = str.split('@');
      if (!domain) return str;
      const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
      return `${maskedName}@${domain}`;
    };

    return NextResponse.json({
      success: true,
      exists: true,
      name: foundUser.name,
      email: foundUser.email,
      maskedEmail: maskEmail(foundUser.email),
      phone: foundUser.phone,
      message: `Account found for ${foundUser.name}! You can now choose a new password.`,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error occurred' },
      { status: 500 }
    );
  }
}

