// Safe to import from client components (no database access here).
// The Tutorials page sidebar is edited in Dashboard → Settings → Sidebars and stored in SiteSettings.
// Until someone saves their own, this default is shown.
export const LISTING_SIDEBAR_KEY = 'sidebar.projects';

export interface SidebarBlockData {
  id: string;
  type: string;
  content: any;
}

export const DEFAULT_LISTING_SIDEBAR: SidebarBlockData[] = [
  { id: 'default-featured', type: 'featured_posts', content: { title: 'Featured Tutorials', slugs: '' } },
  { id: 'default-latest', type: 'latest_posts', content: { title: 'Recent Posts', count: 4 } },
  { id: 'default-levels', type: 'levels', content: { title: 'Browse by Level' } },
  { id: 'default-categories', type: 'categories', content: { title: 'Topics' } },
  { id: 'default-ad', type: 'ad', content: { zone: 'SIDEBAR_RIGHT' } },
  {
    id: 'default-cta',
    type: 'cta',
    content: {
      title: 'Want us to build it for you?',
      text: 'No time or tools? Our engineers can build any of these projects to your exact specs.',
      buttonText: 'Request a Build',
      href: '/contact?type=service',
    },
  },
];
