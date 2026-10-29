import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { parseResetToken, verifyResetToken } from '@/lib/password-reset';

// POST - Set a new password using a token from the reset email
export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || typeof token !== 'string' || !newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({ success: false, message: 'Token and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const parsed = parseResetToken(token);
    const user = parsed
      ? await prisma.user.findUnique({ where: { id: parsed.userId }, select: { id: true, passwordHash: true } })
      : null;

    if (!user || !verifyResetToken(token, user.passwordHash)) {
      return NextResponse.json(
        { success: false, message: 'This reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hash(newPassword, 12) },
    });

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('[RESET_PASSWORD]', error);
    return NextResponse.json({ success: false, message: 'Failed to reset password' }, { status: 500 });
  }
}
