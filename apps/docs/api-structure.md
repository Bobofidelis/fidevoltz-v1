# API Routes Structure

## Overview
All API routes are located in `apps/frontend/app/api/` and follow Next.js 14+ App Router conventions.

## Authentication Routes

### `/api/auth/[...nextauth]`
**NextAuth Handler** - Handles all authentication flows
- `GET` - Session check
- `POST` - Login/logout

### `/api/auth/register`
- `POST` - Register new user
  - Body: `{ email, password, name? }`
  - Returns: User object
  - Validation: Email format, password length (min 6)

### `/api/auth/profile`
- `GET` - Get current user profile (requires auth)
- `PATCH` - Update profile (requires auth)
  - Body: `{ name?, phoneNumber?, address?, bio?, avatar? }`

### `/api/auth/change-password`
- `POST` - Change password (requires auth)
  - Body: `{ currentPassword, newPassword }`

## Users Routes (Admin Only)

### `/api/users`
- `GET` - List all users (paginated)
  - Query: `page`, `limit`, `search`, `role`
  - Returns: Paginated user list

### `/api/users/[id]`
- `GET` - Get user by ID (own profile or admin)
- `PATCH` - Update user (own profile or admin)
- `DELETE` - Delete user (admin only, can't delete self)

### `/api/users/[id]/role`
- `PATCH` - Update user role (admin only)
  - Body: `{ role: 'USER' | 'EDITOR' | 'ADMIN' }`

## Products Routes

### `/api/products`
- `GET` - List products (paginated, searchable)
  - Query: `page`, `limit`, `search`, `categoryId`
- `POST` - Create product (admin only)
  - Body: `{ name, description, price, stock, minStock?, sku?, image?, categoryId }`

### `/api/products/[id]`
- `GET` - Get product by ID
- `PATCH` - Update product (admin only)
- `DELETE` - Delete product (admin only)

### `/api/products/categories`
- `GET` - List all categories
- `POST` - Create category (admin only)
  - Body: `{ name }`

## Cart Routes

### `/api/cart`
- `GET` - Get user's cart (requires auth)
- `POST` - Add item to cart (requires auth)
  - Body: `{ productId, quantity }`
- `DELETE` - Clear cart (requires auth)

### `/api/cart/[itemId]`
- `PATCH` - Update item quantity (requires auth)
  - Body: `{ quantity }`
- `DELETE` - Remove item from cart (requires auth)

## Projects Routes

### `/api/projects`
- `GET` - List projects (paginated)
  - Query: `page`, `limit`, `category`, `published`
- `POST` - Create project (editor/admin only)
  - Body: `{ title, slug, content, category, published? }`

### `/api/projects/slug/[slug]`
- `GET` - Get project by slug (includes comments)

## Comments Routes

### `/api/comments`
- `POST` - Create comment (requires auth)
  - Body: `{ content, postId, parentId? }`

### `/api/comments/[id]`
- `DELETE` - Delete comment (owner or admin)

## Orders Routes

### `/api/orders`
- `GET` - Get user's orders (requires auth)
- `POST` - Create order (requires auth, clears cart)
  - Body: `{ items: [{ productId, quantity, price }], totalAmount, paymentGateway, shippingAddress? }`

### `/api/orders/[id]`
- `GET` - Get order details (own order or admin)
  - Includes: items, user, notes, history

## Dashboard Routes (Admin Only)

### `/api/dashboard/stats`
- `GET` - Get dashboard statistics
  - Returns: `{ totalUsers, totalOrders, totalRevenue, totalProducts, recentOrders, lowStockProducts }`

## Notifications Routes

### `/api/notifications`
- `GET` - Get user notifications (requires auth)
- `POST` - Create notification (admin only)
  - Body: `{ type, message, userId? }`

### `/api/notifications/[id]`
- `PATCH` - Mark notification as read (requires auth)

## Support Routes

### `/api/support/tickets`
- `GET` - List tickets (own tickets or all if admin)
- `POST` - Create support ticket (no auth required)
  - Body: `{ subject, message, userEmail }`

## Response Format

All API routes return a consistent response format:

```typescript
{
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### Paginated Responses
```typescript
{
  success: true;
  data: {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
```

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

## Authentication

All protected routes use NextAuth session:

```typescript
const session = await getServerSession(authOptions);

if (!session || !session.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Role-Based Access Control

```typescript
if (session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

Roles: `USER`, `EDITOR`, `ADMIN`

## Shared Types

All types are imported from `@fidevoltz/types`:

```typescript
import type { 
  User, 
  Product, 
  Order, 
  ApiResponse,
  PaginatedResponse 
} from '@fidevoltz/types';
```
