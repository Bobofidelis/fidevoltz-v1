import { randomBytes } from 'crypto';
import { after } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SITE_URL, absoluteUrl } from '@/lib/site';

// IndexNow tells Bing, Yandex, Seznam, Naver and others (and through Bing: ChatGPT search, Copilot)
// that a page is new or changed, so it gets crawled in minutes instead of weeks.
// The key is generated once and served at /indexnow.txt to prove the site is ours.

const KEY_SETTING = 'seo.indexNowKey';
export const INDEXNOW_KEY_PATH = '/indexnow.txt';

export async function getIndexNowKey(): Promise<string> {
  const existing = await prisma.siteSettings.findUnique({ where: { key: KEY_SETTING } });
  if (existing && typeof existing.value === 'string' && /^[a-f0-9]{32}$/.test(existing.value)) {
    return existing.value;
  }
  const key = randomBytes(16).toString('hex');
  await prisma.siteSettings.upsert({
    where: { key: KEY_SETTING },
    update: { value: key },
    create: { key: KEY_SETTING, value: key, category: 'seo', description: 'IndexNow key (auto-generated)', isPublic: false },
  });
  return key;
}

/** Submit URLs (paths or absolute) to IndexNow. Only runs on the live site, never from a laptop. */
export async function notifySearchEngines(paths: string[]): Promise<{ ok: boolean; status?: number; count: number; skipped?: string }> {
  if (process.env.VERCEL_ENV !== 'production') return { ok: false, count: 0, skipped: 'not the live site' };

  const urlList = [...new Set(paths.map((p) => absoluteUrl(p)))].filter((u) => u.startsWith(SITE_URL)).slice(0, 10000);
  if (urlList.length === 0) return { ok: false, count: 0, skipped: 'no URLs' };

  const key = await getIndexNowKey();
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(SITE_URL).host,
      key,
      keyLocation: `${SITE_URL}${INDEXNOW_KEY_PATH}`,
      urlList,
    }),
  });
  // 200 = accepted, 202 = accepted, key validation pending
  return { ok: res.status === 200 || res.status === 202, status: res.status, count: urlList.length };
}

/** Fire-and-forget after the response is sent, so saving content is never slowed down or broken by it */
export function notifySearchEnginesLater(paths: string[]) {
  after(async () => {
    try {
      const result = await notifySearchEngines(paths);
      if (!result.ok && !result.skipped) console.warn('[IndexNow] not accepted', result);
    } catch (error) {
      console.error('[IndexNow] failed', error);
    }
  });
}
