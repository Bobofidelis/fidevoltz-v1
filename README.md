# FideVoltz - Electronics Tutorial & Store Platform

## 🚀 Quick Start

### Automated Setup
```powershell
# Windows
.\setup.ps1

# Linux/Mac
chmod +x setup.sh && ./setup.sh
```

### Manual Setup
```bash
cd apps/frontend
npm install next-auth@beta @tanstack/react-query @tanstack/react-query-devtools bcryptjs @types/bcryptjs
npx prisma generate
npm run dev
```

## 📁 Structure

### Active
- `apps/frontend` - Next.js application (migrated to API routes)
- `packages/types` - Shared TypeScript types
- `docs/` - Migration documentation

### Legacy (To be removed)
- `apps/backend` - NestJS application (replaced by Next.js API routes)

## 🎯 Migration Status

✅ **Complete** - 29 API routes, 42 endpoints
✅ **Complete** - Shared types package  
✅ **Complete** - React Query hooks
✅ **Complete** - NextAuth configuration
✅ **Complete** - Comprehensive documentation

## 📚 Documentation

- [Migration Guide](docs/migration-guide.md) - Step-by-step instructions
- [API Structure](docs/api-structure.md) - All 42 endpoints
- [Hooks Usage](docs/hooks-usage.md) - React Query examples
- [Deployment](docs/deployment.md) - Production guide

## 🛠️ Tech Stack

- Next.js 14+ (App Router)
- NextAuth.js v5
- React Query (TanStack)
- PostgreSQL + Prisma
- TypeScript
- Shadcn/ui

## 📖 Learn More

See `docs/` for complete migration documentation.
