import { prisma } from '@/lib/prisma';
import { CategoryForm } from '@/components/categories/category-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
        _count: {
            select: { products: true }
        }
    }
  });

  return (
    <div className="container mx-auto py-10">
        <div className="mb-8">
            <Link href="/dashboard/products">
                <Button variant="ghost" size="sm" className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Products
                </Button>
            </Link>
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Product Categories</h1>
                    <p className="text-muted-foreground mt-2">Create and manage categories for organizing your products.</p>
                </div>
                <Link href="/dashboard/products/add">
                    <Button>
                        <Package className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                </Link>
            </div>
        </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div>
            <CategoryForm />
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Existing Categories ({categories.length})</CardTitle>
                    <CardDescription>All product categories in your store.</CardDescription>
                </CardHeader>
                <CardContent>
                    {categories.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground">No categories yet.</p>
                            <p className="text-xs text-muted-foreground mt-1">Create your first category to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {categories.map((category) => (
                                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors group">
                                    <span className="font-medium">{category.name}</span>
                                    <Badge variant="secondary" className="group-hover:bg-primary/10">
                                        {category._count.products} {category._count.products === 1 ? 'product' : 'products'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
