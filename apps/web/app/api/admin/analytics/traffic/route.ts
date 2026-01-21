import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays, endOfDay, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    // Get all page views
    const pageViews = await prisma.pageView.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalPageViews = pageViews.length;
    const uniqueVisitors = new Set(pageViews.map(pv => pv.sessionId)).size;

    // Page views by day
    const viewsByDay = pageViews.reduce((acc, pv) => {
      const day = format(pv.createdAt, 'yyyy-MM-dd');
      if (!acc[day]) {
        acc[day] = { date: day, views: 0, visitors: new Set() };
      }
      acc[day].views += 1;
      acc[day].visitors.add(pv.sessionId);
      return acc;
    }, {} as Record<string, any>);

    const trafficChart = Object.values(viewsByDay).map((day: any) => ({
      date: day.date,
      views: day.views,
      visitors: day.visitors.size,
    }));

    // Top pages
    const pageStats = pageViews.reduce((acc, pv) => {
      if (!acc[pv.path]) {
        acc[pv.path] = { path: pv.path, views: 0, visitors: new Set() };
      }
      acc[pv.path].views += 1;
      acc[pv.path].visitors.add(pv.sessionId);
      return acc;
    }, {} as Record<string, any>);

    const topPages = Object.values(pageStats)
      .map((page: any) => ({
        path: page.path,
        views: page.views,
        uniqueVisitors: page.visitors.size,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Traffic sources (referrers)
    const sources = pageViews.reduce((acc, pv) => {
      const source = pv.referrer || 'Direct';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSources = Object.entries(sources)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Device breakdown
    const devices = pageViews.reduce((acc, pv) => {
      const device = pv.device || 'Unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Browser breakdown
    const browsers = pageViews.reduce((acc, pv) => {
      const browser = pv.browser || 'Unknown';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate bounce rate (sessions with only 1 page view)
    const sessionViews = pageViews.reduce((acc, pv) => {
      acc[pv.sessionId] = (acc[pv.sessionId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bouncedSessions = Object.values(sessionViews).filter(count => count === 1).length;
    const bounceRate = uniqueVisitors > 0 ? (bouncedSessions / uniqueVisitors) * 100 : 0;

    // Average session duration
    const sessionsWithDuration = pageViews.filter(pv => pv.duration);
    const avgDuration = sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum, pv) => sum + (pv.duration || 0), 0) / sessionsWithDuration.length
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalPageViews,
          uniqueVisitors,
          bounceRate: parseFloat(bounceRate.toFixed(2)),
          avgSessionDuration: Math.round(avgDuration),
        },
        charts: {
          traffic: trafficChart,
          devices: Object.entries(devices).map(([device, count]) => ({ device, count })),
          browsers: Object.entries(browsers).map(([browser, count]) => ({ browser, count })),
        },
        topPages,
        topSources,
      },
    });
  } catch (error) {
    console.error('Traffic analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch traffic analytics' },
      { status: 500 }
    );
  }
}
