import { revalidatePath } from 'next/cache';
import { notifySearchEnginesLater } from '@/lib/indexnow';

// Public pages are cached at the edge (close to visitors) and refreshed from here the moment
// something changes in the dashboard, so visitors never wait for the database and never see stale content.

/** A tutorial, product or page was saved: refresh those pages, and tell search engines if it is public */
export function publishContentChange(paths: string[], { notify }: { notify: boolean }) {
  for (const path of new Set(paths)) revalidatePath(path);
  revalidatePath('/sitemap.xml');
  revalidatePath('/llms.txt');
  // Category and topic landing pages list these items
  if (paths.some((p) => p.startsWith('/store'))) revalidatePath('/store/category/[slug]', 'page');
  if (paths.some((p) => p.startsWith('/projects'))) revalidatePath('/projects/topic/[topic]', 'page');
  if (notify) notifySearchEnginesLater(paths);
}

/** Something shown across the whole site changed (settings, categories, a deletion): refresh every page */
export function refreshWholeSite() {
  revalidatePath('/', 'layout');
}
