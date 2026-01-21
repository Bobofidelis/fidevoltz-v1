import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, path, referrer, sessionId, userId, duration } = body;

    // Get user agent and IP
    const userAgent = request.headers.get('user-agent') || undefined;
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;

    // Determine device type from user agent
    const device = userAgent?.toLowerCase().includes('mobile') 
      ? 'mobile' 
      : userAgent?.toLowerCase().includes('tablet') 
      ? 'tablet' 
      : 'desktop';

    // Extract browser
    let browser = 'Unknown';
    if (userAgent) {
      if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Safari')) browser = 'Safari';
      else if (userAgent.includes('Edge')) browser = 'Edge';
    }

    // Create page view
    await prisma.pageView.create({
      data: {
        page,
        path,
        referrer,
        sessionId,
        userId,
        duration,
        userAgent,
        device,
        browser,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}
