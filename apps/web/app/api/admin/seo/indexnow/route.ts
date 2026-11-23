import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notifySearchEngines } from '@/lib/indexnow';
import sitemap from '@/app/sitemap';

// POST - Submit every page in the sitemap to IndexNow (Bing, Yandex, ...) right now
export async function POST() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Unauthorized - Admin access required' }, { status: 403 });
  }

  try {
    const entries = await sitemap();
    const result = await notifySearchEngines(entries.map((e) => e.url));
    if (result.skipped) {
      return NextResponse.json({ success: false, error: `Only works on the live site (${result.skipped}).` }, { status: 400 });
    }
    if (!result.ok) {
      return NextResponse.json({ success: false, error: `Search engines replied with status ${result.status}. Try again in a few minutes.` }, { status: 502 });
    }
    return NextResponse.json({ success: true, message: `Submitted ${result.count} pages to Bing and other IndexNow search engines.` });
  } catch (error) {
    console.error('[IndexNow submit]', error);
    return NextResponse.json({ success: false, error: 'Failed to notify search engines' }, { status: 500 });
  }
}
