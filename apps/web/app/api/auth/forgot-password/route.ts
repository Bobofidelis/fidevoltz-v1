import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { createResetToken } from '@/lib/password-reset';

// POST - Email a password reset link. Always responds the same way so emails can't be enumerated.
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: 'insensitive' } },
      select: { id: true, name: true, email: true, passwordHash: true, isBanned: true },
    });

    if (user && !user.isBanned) {
      const token = createResetToken(user.id, user.passwordHash);
      const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || new URL(request.url).origin;
      const resetUrl = `${baseUrl.replace(/\/$/, '')}/auth/reset-password?token=${encodeURIComponent(token)}`;

      await sendEmail(
        user.email,
        'Reset your FideVoltz password',
        `<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
          <h2>Reset your password</h2>
          <p>Hi ${user.name || 'there'},</p>
          <p>We received a request to reset your password. This link expires in 1 hour.</p>
          <p><a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset password</a></p>
          <p style="color: #475569; font-size: 14px;">If you didn't request this, you can ignore this email — your password won't change.</p>
        </div>`
      );
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('[FORGOT_PASSWORD]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send reset link. Please try again.' },
      { status: 500 }
    );
  }
}
