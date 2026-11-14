# FideVoltz

Electronics tutorials and component store for makers in Nigeria. Live at https://fidevoltz.vercel.app

## Stack

- Next.js (App Router) in `apps/web`, deployed on Vercel
- PostgreSQL (Neon) with Prisma — schema in `prisma/schema.prisma`
- NextAuth for sign-in, Cloudinary for media, Resend for email
- Shared TypeScript types in `packages/types`

## Run locally

```bash
npm install          # also runs `prisma generate`
cd apps/web
npm run dev          # http://localhost:3000
```

Environment variables go in `apps/web/.env.local` (see `.env.production.example`).
**Note:** if your local `DATABASE_URL` points at the live database, everything you do locally changes real data.

## Where things live

| Path | What |
| --- | --- |
| `apps/web/app/(main)` | Public site: home, tutorials, store, CMS pages |
| `apps/web/app/(dashboard)` | Admin/editor dashboard |
| `apps/web/app/api` | API routes |
| `apps/web/components` | UI components |
| `apps/web/lib` | Data helpers, SEO, auth, media providers |

Site content (pages, sidebars, storefront stats, SEO verification) is managed from the dashboard, not in code.
