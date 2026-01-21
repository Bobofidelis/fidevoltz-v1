# React Query Hooks Usage Guide

## Overview

The application uses two custom hooks built on top of React Query:
- `useApiQuery` - For GET requests
- `useApiMutation` - For POST/PATCH/DELETE requests

## useApiQuery

### Basic Usage

```typescript
import { useApiQuery } from '@/lib/hooks/use-api-query';
import type { User } from '@fidevoltz/types';

function ProfilePage() {
  const { data, isLoading, error, refetch } = useApiQuery<User>({
    endpoint: '/api/auth/profile',
    queryKey: ['profile'],
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Welcome, {data?.name}</div>;
}
```

### With Parameters

```typescript
const { data: products } = useApiQuery<PaginatedResponse<Product>>({
  endpoint: `/api/products?page=${page}&limit=20&search=${search}`,
  queryKey: ['products', page, search],
});
```

### Conditional Fetching

```typescript
const { data: order } = useApiQuery<Order>({
  endpoint: `/api/orders/${orderId}`,
  queryKey: ['order', orderId],
  enabled: !!orderId, // Only fetch if orderId exists
});
```

### Custom Options

```typescript
const { data } = useApiQuery<Product[]>({
  endpoint: '/api/products',
  queryKey: ['products'],
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchInterval: 30000, // Refetch every 30 seconds
  retry: 3,
});
```

## useApiMutation

### Basic Usage

```typescript
import { useApiMutation } from '@/lib/hooks/use-api-mutation';
import type { User, UpdateUserDto } from '@fidevoltz/types';
import { toast } from 'sonner';

function UpdateProfileForm() {
  const updateProfile = useApiMutation<User, UpdateUserDto>({
    endpoint: '/api/auth/profile',
    method: 'PATCH',
    invalidateQueries: [['profile']], // Refetch profile after update
    onSuccess: () => {
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (data: UpdateUserDto) => {
    updateProfile.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={updateProfile.isPending}>
        {updateProfile.isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### POST Request

```typescript
const createProduct = useApiMutation<Product, CreateProductDto>({
  endpoint: '/api/products',
  method: 'POST',
  invalidateQueries: [['products']], // Refetch products list
  onSuccess: (data) => {
    toast.success(`Product "${data.name}" created!`);
    router.push('/dashboard/products');
  },
});

// Usage
createProduct.mutate({
  name: 'Arduino Uno',
  description: 'Microcontroller board',
  price: 24.99,
  stock: 100,
  categoryId: 'cat-123',
});
```

### DELETE Request

```typescript
const deleteProduct = useApiMutation({
  endpoint: `/api/products/${productId}`,
  method: 'DELETE',
  invalidateQueries: [['products']],
  onSuccess: () => {
    toast.success('Product deleted');
  },
});

// Usage
deleteProduct.mutate(undefined); // DELETE doesn't need a body
```

### Multiple Query Invalidation

```typescript
const addToCart = useApiMutation<Cart, AddToCartDto>({
  endpoint: '/api/cart',
  method: 'POST',
  invalidateQueries: [
    ['cart'], // Refetch cart
    ['products'], // Refetch products (to update stock display)
  ],
});
```

## Common Patterns

### List with Pagination

```typescript
function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useApiQuery<PaginatedResponse<Product>>({
    endpoint: `/api/products?page=${page}&limit=20&search=${search}`,
    queryKey: ['products', page, search],
  });

  return (
    <div>
      <input 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
        placeholder="Search..."
      />
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {data?.data.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
          
          <Pagination
            page={page}
            totalPages={data?.pagination.totalPages || 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
```

### Create with Form

```typescript
function AddProductForm() {
  const router = useRouter();
  const form = useForm<CreateProductDto>();

  const createProduct = useApiMutation<Product, CreateProductDto>({
    endpoint: '/api/products',
    method: 'POST',
    invalidateQueries: [['products']],
    onSuccess: () => {
      toast.success('Product created!');
      router.push('/dashboard/products');
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    createProduct.mutate(data);
  });

  return (
    <form onSubmit={onSubmit}>
      <Input {...form.register('name')} />
      <Input {...form.register('price', { valueAsNumber: true })} />
      <Button type="submit" disabled={createProduct.isPending}>
        {createProduct.isPending ? 'Creating...' : 'Create Product'}
      </Button>
    </form>
  );
}
```

### Optimistic Updates

```typescript
const updateCartItem = useApiMutation<void, UpdateCartItemDto>({
  endpoint: `/api/cart/${itemId}`,
  method: 'PATCH',
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['cart'] });

    // Snapshot previous value
    const previousCart = queryClient.getQueryData(['cart']);

    // Optimistically update
    queryClient.setQueryData(['cart'], (old: Cart) => ({
      ...old,
      items: old.items.map(item =>
        item.id === itemId ? { ...item, quantity: newData.quantity } : item
      ),
    }));

    return { previousCart };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['cart'], context?.previousCart);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  },
});
```

### Dependent Queries

```typescript
function OrderDetails({ orderId }: { orderId: string }) {
  const { data: order } = useApiQuery<Order>({
    endpoint: `/api/orders/${orderId}`,
    queryKey: ['order', orderId],
  });

  const { data: user } = useApiQuery<User>({
    endpoint: `/api/users/${order?.userId}`,
    queryKey: ['user', order?.userId],
    enabled: !!order?.userId, // Only fetch when we have userId
  });

  return <div>{user?.name} ordered {order?.items.length} items</div>;
}
```

## Best Practices

### 1. Query Keys
Use descriptive, hierarchical query keys:
```typescript
['products'] // All products
['products', productId] // Single product
['products', { category: 'electronics' }] // Filtered products
['users', userId, 'orders'] // User's orders
```

### 2. Error Handling
Always handle errors gracefully:
```typescript
const { data, error, isError } = useApiQuery({...});

if (isError) {
  return <ErrorState message={error.message} />;
}
```

### 3. Loading States
Show loading indicators:
```typescript
if (isLoading) return <Skeleton />;
if (isPending) return <Spinner />;
```

### 4. Invalidation
Invalidate related queries after mutations:
```typescript
invalidateQueries: [
  ['products'], // List
  ['products', productId], // Detail
  ['dashboard', 'stats'], // Dashboard
]
```

### 5. Type Safety
Always specify types:
```typescript
useApiQuery<Product>({...}) // ✅ Good
useApiQuery({...}) // ❌ Bad (loses type safety)
```

## React Query DevTools

The DevTools are automatically included in development:

```typescript
// Already configured in Providers component
<ReactQueryDevtools initialIsOpen={false} />
```

Access via browser DevTools panel to:
- View all queries and their states
- Inspect cached data
- Manually trigger refetches
- Debug stale/fresh states

## Configuration

Default configuration in `components/providers.tsx`:

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
```

Override per query:
```typescript
useApiQuery({
  endpoint: '/api/products',
  queryKey: ['products'],
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: 3,
})
```
