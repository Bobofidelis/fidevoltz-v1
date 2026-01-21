import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/products/product-form';

export default async function AddProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">Create a new product with details, specifications and media.</p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
