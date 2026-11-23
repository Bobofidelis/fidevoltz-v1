import { getIndexNowKey } from '@/lib/indexnow';

// Search engines fetch this file to confirm IndexNow submissions really come from this site
export async function GET() {
  const key = await getIndexNowKey();
  return new Response(key, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
