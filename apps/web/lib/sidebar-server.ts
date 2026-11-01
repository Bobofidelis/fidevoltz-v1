import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { DEFAULT_LISTING_SIDEBAR, LISTING_SIDEBAR_KEY, type SidebarBlockData } from '@/lib/sidebar-defaults';

/** The saved Tutorials sidebar, or the default when nothing has been saved yet */
export const getListingSidebar = cache(async (): Promise<SidebarBlockData[]> => {
  try {
    const setting = await prisma.siteSettings.findUnique({ where: { key: LISTING_SIDEBAR_KEY } });
    if (setting && Array.isArray(setting.value)) return setting.value as unknown as SidebarBlockData[];
  } catch {
    // fall through to the default
  }
  return DEFAULT_LISTING_SIDEBAR;
});
