import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Trash2, AlertTriangle, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils'; // Ensure this utility exists or use formatter
import { ProductStatus } from '@prisma/client';

export const revalidate = 0; // Dynamic data

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog and inventory</p>
        </div>
        <Link href="/dashboard/products/add">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No products found. Add your first product to get started.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center overflow-hidden border">
                         {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                         ) : product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                         ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                         )}
                      </div>
                      <div className="flex flex-col">
                         <span className="font-medium">{product.name}</span>
                         <span className="text-xs text-muted-foreground">{product.sku || 'No SKU'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category.name}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(product.price))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.stock}
                      {product.stock <= product.minStock && (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      product.status === ProductStatus.ACTIVE ? 'default' : 
                      product.status === ProductStatus.DRAFT ? 'secondary' : 
                      'destructive'
                    }>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Link href={`/dashboard/products/${product.id}/edit`}>
                         <Button variant="ghost" size="icon">
                           <Edit className="w-4 h-4" />
                         </Button>
                       </Link>
                       {/* Delete implementation would usually be a client component or form action */}
                       {/* For now we just show the button, logic in Edit page or separate component */}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
