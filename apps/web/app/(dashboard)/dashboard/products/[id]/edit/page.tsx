import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/products/product-form';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!product) {
    notFound();
  }

  // Serialize decimlas if needed, but react-hook-form handles numbers well if coerced.
  // Prisma decimals come as objects/strings sometimes, safe to convert to strings or numbers using JSON serialization trick or explicit conversion
  const serializedProduct = JSON.parse(JSON.stringify(product));

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">Update product details, stock levels and media.</p>
      </div>
      <ProductForm initialData={serializedProduct} categories={categories} />
    </div>
  );
}
