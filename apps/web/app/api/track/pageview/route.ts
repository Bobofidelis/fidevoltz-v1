import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function parseUserAgent(ua: string) {
  const lower = ua.toLowerCase();

  // Device type
  let device = 'Desktop';
  if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile/.test(lower)) device = 'Mobile';
  else if (/tablet|ipad|android(?!.*mobile)/.test(lower)) device = 'Tablet';

  // Browser
  let browser = 'Unknown';
  if (/edg\//.test(lower)) browser = 'Edge';
  else if (/opr\/|opera/.test(lower)) browser = 'Opera';
  else if (/chrome/.test(lower)) browser = 'Chrome';
  else if (/safari/.test(lower)) browser = 'Safari';
  else if (/firefox/.test(lower)) browser = 'Firefox';
  else if (/msie|trident/.test(lower)) browser = 'IE';

  return { device, browser };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, path, referrer, sessionId, duration, userId } = body;

    if (!page || !path || !sessionId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const { device, browser } = parseUserAgent(userAgent);

    await prisma.pageView.create({
      data: {
        page,
        path,
        referrer: referrer || null,
        userAgent,
        browser,
        device,
        sessionId,
        duration: duration ? parseInt(String(duration)) : 0,
        userId: userId || null,
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
