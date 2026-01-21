import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, ContactFormDto } from '@fidevoltz/types';

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

  console.log('Contact email:', { to, subject, html });
  return { success: true };
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormDto = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Determine submission type based on subject
    let type: 'GENERAL' | 'SERVICE' | 'PARTNERSHIP' = 'GENERAL';
    let projectType: string | undefined;
    let budget: string | undefined;
    let interestType: string | undefined;
    let organization: string | undefined;

    if (subject.includes('Build Service Request')) {
      type = 'SERVICE';
      // Extract project type and budget from message
      const projectTypeMatch = message.match(/Project Type: ([^\n]+)/);
      const budgetMatch = message.match(/Budget: ([^\n]+)/);
      projectType = projectTypeMatch ? projectTypeMatch[1] : undefined;
      budget = budgetMatch ? budgetMatch[1] : undefined;
    } else if (subject.includes('Partnership Inquiry')) {
      type = 'PARTNERSHIP';
      // Extract organization and interest type from message
      const orgMatch = message.match(/Organization: ([^\n]+)/);
      const interestMatch = message.match(/Interest Type: ([^\n]+)/);
      organization = orgMatch ? orgMatch[1] : undefined;
      interestType = interestMatch ? interestMatch[1] : undefined;
    }

    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        type,
        name,
        email,
        subject,
        message,
        organization,
        projectType,
        budget,
        interestType,
      },
    });

    // Create notification for all admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    if (adminUsers.length > 0) {
      await prisma.notification.createMany({
        data: adminUsers.map(admin => ({
          userId: admin.id,
          type: 'SYSTEM',
          title: `New ${type === 'GENERAL' ? 'Contact' : type === 'SERVICE' ? 'Service Request' : 'Partnership'} Submission`,
          message: `${name} submitted a ${type.toLowerCase()} inquiry: "${subject}"`,
          actionUrl: `/dashboard/contact-submissions/${submission.id}`,
          actionLabel: 'View Submission',
          priority: type === 'SERVICE' ? 'high' : 'normal',
          metadata: {
            submissionId: submission.id,
            submissionType: type,
            submitterEmail: email,
          },
        })),
      });
    }

    // Send email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@fidevoltz.com';
    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Submission ID:</strong> ${submission.id}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${organization ? `<p><strong>Organization:</strong> ${organization}</p>` : ''}
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <br>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/contact-submissions/${submission.id}">View in Dashboard</a></p>
    `;

    await sendEmail(adminEmail, `Contact Form: ${subject}`, html);

    // Send confirmation to user
    const confirmationHtml = `
      <h2>Thank you for contacting us!</h2>
      <p>Hi ${name},</p>
      <p>We have received your message and will get back to you soon.</p>
      <p><strong>Reference ID:</strong> ${submission.id}</p>
      <p><strong>Your message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <br>
      <p>Best regards,<br>FideVoltz Team</p>
    `;

    await sendEmail(email, 'We received your message', confirmationHtml);

    return NextResponse.json<ApiResponse>(
      { 
        success: true, 
        message: 'Message sent successfully',
        data: { submissionId: submission.id }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while sending message' },
      { status: 500 }
    );
  }
}
