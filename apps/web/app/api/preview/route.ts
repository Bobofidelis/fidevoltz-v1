import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// GET /api/preview?path=/projects/my-draft  — lets staff see unpublished tutorials and products.
// Public pages are cached; draft mode makes this browser (only) bypass the cache and see drafts.
// GET /api/preview?exit=1&path=/...         — leave preview mode.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('path') || '/';
  // Only same-site paths, never an open redirect
  const path = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';

  if (searchParams.get('exit')) {
    (await draftMode()).disable();
    return NextResponse.redirect(new URL(path, request.url));
  }

  const session = await auth();
  const role = session?.user?.role;
  if (role !== 'ADMIN' && role !== 'EDITOR') {
    return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(`/api/preview?path=${path}`)}`, request.url));
  }

  (await draftMode()).enable();
  return NextResponse.redirect(new URL(path, request.url));
}
