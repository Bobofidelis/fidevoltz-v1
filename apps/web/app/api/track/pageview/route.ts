import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UAParser } from 'ua-parser-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, path, referrer, sessionId, duration } = body;

    if (!page || !path || !sessionId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || 'Unknown';
    const device = parser.getDevice().type === 'mobile' ? 'Mobile' : parser.getDevice().type === 'tablet' ? 'Tablet' : 'Desktop';

    // IP and location would typically come from headers in production (e.g. x-forwarded-for, x-vercel-ip-country)
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Determine user if session is present in cookies/headers (simplified for public tracking)
    // We only log userId if passed, or null
    const userId = body.userId || null;

    // Save pageview
    await prisma.pageView.create({
      data: {
        page,
        path,
        referrer,
        userAgent,
        browser,
        device,
        sessionId,
        duration: duration || 0,
        userId,
        country: request.headers.get('x-vercel-ip-country') || 'Unknown',
        city: request.headers.get('x-vercel-ip-city') || 'Unknown',
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TRACKING API] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
