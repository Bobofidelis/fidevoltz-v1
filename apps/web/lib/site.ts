// Single source of truth for the public site address.
// When a custom domain is connected, set NEXT_PUBLIC_SITE_URL on Vercel and every
// canonical URL, sitemap entry and structured-data URL follows it.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://fidevoltz.vercel.app'
).replace(/\/$/, '');

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
