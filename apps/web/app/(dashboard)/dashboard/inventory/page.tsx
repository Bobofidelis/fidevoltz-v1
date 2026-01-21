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
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Package, CheckCircle, Search, Filter } from 'lucide-react';
import { ProductStatus } from '@prisma/client';

export const revalidate = 0; // Dynamic data

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : '';
  const filter = typeof params.filter === 'string' ? params.filter : 'all';

  const where: any = {
      status: { not: ProductStatus.ARCHIVED }
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Get all products matching search to calculate metrics and filter in memory if complex
  const allProducts = await prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      minStock: true,
      price: true,
      costPrice: true,
      status: true,
      image: true,
      images: true,
    },
    orderBy: { stock: 'asc' },
  });

  const lowStockProducts = allProducts.filter(p => p.stock <= p.minStock);
  const outOfStockProducts = allProducts.filter(p => p.stock === 0);
  
  // CORRECT CALCULATIONS:
  // Total Cost = Sum of (Cost Price × Stock) for all products
  const totalCost = allProducts.reduce((acc, curr) => {
    const costPrice = Number(curr.costPrice || 0);
    const stock = curr.stock || 0;
    return acc + (costPrice * stock);
  }, 0);
  
  // Potential Revenue = Sum of (Selling Price × Stock) for all products
  const potentialRevenue = allProducts.reduce((acc, curr) => {
    const sellingPrice = Number(curr.price || 0);
    const stock = curr.stock || 0;
    return acc + (sellingPrice * stock);
  }, 0);
  
  // Profit = Revenue - Cost
  const potentialProfit = potentialRevenue - totalCost;
  
  // Profit Margin = (Profit / Cost) × 100
  const profitMargin = totalCost > 0 ? ((potentialProfit / totalCost) * 100) : 0;

  const displayedProducts = filter === 'low' ? lowStockProducts : 
                            filter === 'out' ? outOfStockProducts : 
                            allProducts;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels and inventory value</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost (Investment)</CardTitle>
            <span className="text-muted-foreground">₦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totalCost)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              What you paid for inventory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Selling Price</CardTitle>
            <span className="text-muted-foreground">₦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(potentialRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              If all inventory sells
            </p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Profit</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(potentialProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Margin: {profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Link href="/dashboard/inventory?filter=low" className="block">
            <Card className={`cursor-pointer transition-colors ${filter === 'low' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-amber-600">{lowStockProducts.length}</div>
            </CardContent>
            </Card>
        </Link>
        <Link href="/dashboard/inventory?filter=out" className="block">
            <Card className={`cursor-pointer transition-colors ${filter === 'out' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                <Package className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
            </CardContent>
            </Card>
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
         <form className="flex gap-2 w-full max-w-sm">
             <Input 
                name="search" 
                placeholder="Search by name or SKU..." 
                defaultValue={search}
                className="w-full"
             />
             <Button type="submit" variant="secondary"><Search className="w-4 h-4" /></Button>
         </form>
         <div className="flex gap-2 ml-auto">
             <Link href="/dashboard/inventory">
                 <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm">All</Button>
             </Link>
             <Link href="/dashboard/inventory?filter=low">
                 <Button variant={filter === 'low' ? 'default' : 'outline'} size="sm" className="text-amber-600">Low Stock</Button>
             </Link>
             <Link href="/dashboard/inventory?filter=out">
                 <Button variant={filter === 'out' ? 'default' : 'outline'} size="sm" className="text-red-600">Out of Stock</Button>
             </Link>
         </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No products found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              displayedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center overflow-hidden border">
                         {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                         ) : product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                         ) : (
                            <Package className="w-4 h-4 text-slate-400" />
                         )}
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{product.sku || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                          product.stock === 0 ? 'text-red-600' :
                          product.stock <= product.minStock ? 'text-amber-600' :
                          'text-green-600'
                      }`}>
                          {product.stock}
                      </span>
                      <span className="text-xs text-muted-foreground">/ Min: {product.minStock}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                     {product.stock === 0 ? (
                         <Badge variant="destructive">Out of Stock</Badge>
                     ) : product.stock <= product.minStock ? (
                         <Badge variant="outline" className="border-amber-500 text-amber-500">Low Stock</Badge>
                     ) : (
                         <Badge variant="outline" className="border-green-500 text-green-500">Good</Badge>
                     )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/products/${product.id}/edit`}>
                      <Button variant="ghost" size="sm">Update Stock</Button>
                    </Link>
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
