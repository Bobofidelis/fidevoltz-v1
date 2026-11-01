import type { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';

// What the public may read about a project. Content blocks stay out of list responses (they are
// large), and private "campaign_data" blocks (YouTube scripts, social drafts) never leave the server.
export const PUBLIC_PROJECT_LIST_SELECT = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  featuredImage: true,
  category: true,
  difficulty: true,
  status: true,
  featured: true,
  tags: true,
  publishedAt: true,
  allowComments: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProjectPostSelect;

export async function isStaffRequest() {
  const session = await auth();
  const role = session?.user?.role;
  return role === 'ADMIN' || role === 'EDITOR';
}

export function stripPrivateBlocks<T>(content: T): T {
  if (!Array.isArray(content)) return content;
  return content.filter((block: any) => block?.type !== 'campaign_data') as unknown as T;
}

type CommentLike = { user?: { email?: string | null } | null; replies?: CommentLike[] };

function withoutEmails<T extends CommentLike>(comment: T): T {
  return {
    ...comment,
    user: comment.user ? { ...comment.user, email: undefined } : comment.user,
    replies: comment.replies?.map(withoutEmails),
  };
}

/** A single project as visitors may see it: no private blocks, no commenter email addresses */
export function toPublicProject<T extends { content?: unknown; comments?: CommentLike[] }>(project: T): T {
  return {
    ...project,
    content: stripPrivateBlocks(project.content),
    comments: project.comments?.map(withoutEmails),
  };
}
