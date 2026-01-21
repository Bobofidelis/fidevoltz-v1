import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import type { ApiResponse, SendEmailDto } from '@fidevoltz/types';

// Email sending utility (using Resend or Nodemailer)
async function sendEmail(to: string, subject: string, html: string) {
  // If using Resend
  if (process.env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'noreply@fidevoltz.com',
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return await response.json();
  }

  // Fallback: log to console in development
  console.log('Email would be sent:', { to, subject, html });
  return { success: true };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body: SendEmailDto = await request.json();
    const { to, subject, html } = body;

    if (!to || !subject || !html) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await sendEmail(to, subject, html);

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Send email error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while sending email' },
      { status: 500 }
    );
  }
}
