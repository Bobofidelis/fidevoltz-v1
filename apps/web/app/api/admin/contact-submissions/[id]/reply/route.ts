import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

async function sendEmail(to: string, subject: string, html: string) {
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

  console.log('Reply email:', { to, subject, html });
  return { success: true };
}

// POST - Reply to contact submission (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { reply } = body;

    if (!reply) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Reply message is required' },
        { status: 400 }
      );
    }

    // Get submission
    const submission = await prisma.contactSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Send reply email
    const replyHtml = `
      <h2>Re: ${submission.subject}</h2>
      <p>Hi ${submission.name},</p>
      <p>${reply.replace(/\n/g, '<br>')}</p>
      <br>
      <hr>
      <p><strong>Your original message:</strong></p>
      <p>${submission.message.replace(/\n/g, '<br>')}</p>
      <br>
      <p>Best regards,<br>FideVoltz Team</p>
    `;

    await sendEmail(submission.email, `Re: ${submission.subject}`, replyHtml);

    // Find or create user account for the submitter
    let recipientUser = await prisma.user.findUnique({
      where: { email: submission.email },
    });

    // If user doesn't exist, we'll still save the reply but won't create a message
    // The reply will be visible in the contact submission details

    // Create DirectMessage if user has an account
    if (recipientUser) {
      await prisma.directMessage.create({
        data: {
          senderId: session.user.id,
          recipientId: recipientUser.id,
          subject: `Re: ${submission.subject}`,
          message: reply,
          metadata: {
            contactSubmissionId: submission.id,
            submissionType: submission.type,
          },
        },
      });
    }

    // Update submission (WITHOUT changing status)
    const updatedSubmission = await prisma.contactSubmission.update({
      where: { id },
      data: {
        adminReply: reply,
        repliedAt: new Date(),
        // Status is NOT changed - admin must manually update it
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedSubmission,
      message: recipientUser 
        ? 'Reply sent successfully. User will see it in their messages.'
        : 'Reply sent via email. User does not have an account yet.',
    });
  } catch (error: any) {
    console.error('[ADMIN CONTACT SUBMISSION REPLY API] Reply error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to send reply' },
      { status: 500 }
    );
  }
}
