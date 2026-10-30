import { NextResponse } from 'next/server';
import { getStorefrontData } from '@/lib/storefront-server';

export const revalidate = 60;

// GET - Public storefront stats/badge with live numbers filled in
export async function GET() {
  try {
    return NextResponse.json({ success: true, data: await getStorefrontData() });
  } catch (error) {
    console.error('[STOREFRONT_GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load storefront stats' }, { status: 500 });
  }
}
