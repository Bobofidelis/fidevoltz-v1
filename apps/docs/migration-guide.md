# Migration Guide: NestJS to Next.js API Routes

## Current Status

### ✅ Completed
1. **Shared Types Package** - Created user, auth, and API response types
2. **Prisma Client** - Singleton instance for Next.js
3. **NextAuth Configuration** - Credentials provider with JWT strategy
4. **Authentication API Routes**:
   - `/api/auth/[...nextauth]` - NextAuth handler
   - `/api/auth/register` - User registration
   - `/api/auth/profile` - Get/update profile
   - `/api/auth/change-password` - Change password
5. **Users API Routes**:
   - `/api/users` - List users (admin, paginated)
   - `/api/users/[id]` - Get/update/delete user
   - `/api/users/[id]/role` - Update user role (admin)
6. **React Query Hooks**:
   - `useApiQuery` - GET requests with caching
   - `useApiMutation` - POST/PATCH/DELETE requests
7. **Providers** - SessionProvider + QueryClientProvider
8. **Root Layout** - Updated with Providers

### ⏳ Next Steps

#### 1. Install Dependencies
Run this command in the `apps/frontend` directory:

```bash
npm install next-auth@beta @tanstack/react-query @tanstack/react-query-devtools bcryptjs @types/bcryptjs
```

#### 2. Setup Environment Variables
Create/update `apps/frontend/.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fidevoltz?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
```

#### 3. Reset Database (Fresh Start)
```bash
# From root directory
npx prisma migrate reset
npx prisma generate
```

#### 4. Test Authentication
1. Start the dev server: `npm run dev` from `apps/frontend`
2. Navigate to `/auth/register`
3. Create a test user
4. Login at `/auth/login`
5. Check session persistence

## API Routes Structure

```
apps/frontend/app/api/
├── auth/
│   ├── [...nextauth]/route.ts    # NextAuth handler
│   ├── register/route.ts          # POST - Register user
│   ├── profile/route.ts           # GET/PATCH - User profile
│   └── change-password/route.ts   # POST - Change password
└── users/
    ├── route.ts                   # GET - List users (admin)
    └── [id]/
        ├── route.ts               # GET/PATCH/DELETE - User detail
        └── role/route.ts          # PATCH - Update role (admin)
```

## Using the Hooks

### Example: Fetch User Profile
```typescript
import { useApiQuery } from '@/lib/hooks/use-api-query';
import type { User } from '@fidevoltz/types';

function ProfilePage() {
  const { data: user, isLoading, error } = useApiQuery<User>({
    endpoint: '/api/auth/profile',
    queryKey: ['profile'],
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Welcome, {user?.name}</div>;
}
```

### Example: Update Profile
```typescript
import { useApiMutation } from '@/lib/hooks/use-api-mutation';
import type { User, UpdateUserDto } from '@fidevoltz/types';

function UpdateProfileForm() {
  const updateProfile = useApiMutation<User, UpdateUserDto>({
    endpoint: '/api/auth/profile',
    method: 'PATCH',
    invalidateQueries: [['profile']],
    onSuccess: () => {
      toast.success('Profile updated!');
    },
  });

  const handleSubmit = (data: UpdateUserDto) => {
    updateProfile.mutate(data);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Shared Types Usage

All types are exported from `@fidevoltz/types`:

```typescript
import type { 
  User, 
  Role, 
  LoginDto, 
  RegisterDto, 
  ApiResponse,
  PaginatedResponse 
} from '@fidevoltz/types';
```

## Role-Based Access Control

### In API Routes
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Admin-only logic
}
```

### In Client Components
```typescript
'use client';
import { useSession } from 'next-auth/react';

function AdminPanel() {
  const { data: session } = useSession();
  
  if (!session || session.user.role !== 'ADMIN') {
    return <div>Access denied</div>;
  }
  
  return <div>Admin content</div>;
}
```

## Migration Rules

### ✅ DO
- Use shared types from `@fidevoltz/types`
- Use `useApiQuery` for GET requests
- Use `useApiMutation` for POST/PATCH/DELETE
- Invalidate queries after mutations
- Check session in API routes
- Use `getServerSession` on server
- Use `useSession` on client

### ❌ DON'T
- Create duplicate type definitions
- Use direct `fetch()` calls
- Manually manage loading states
- Store tokens in localStorage (NextAuth handles it)
- Mix server and client session methods

## Troubleshooting

### "Cannot find module 'next-auth'"
Install dependencies: `npm install next-auth@beta`

### "Unauthorized" errors
1. Check if user is logged in: `useSession()`
2. Verify NEXTAUTH_SECRET is set
3. Check session expiry

### Database connection errors
1. Verify DATABASE_URL in .env.local
2. Run `npx prisma generate`
3. Check PostgreSQL is running

## Next: Remaining API Routes

After authentication is working, we'll implement:
1. Products & Categories
2. Cart
3. Orders
4. Projects & Comments
5. Media Upload
6. Notifications
7. Support Tickets
8. Dashboard Analytics
9. Search
10. SEO Settings
