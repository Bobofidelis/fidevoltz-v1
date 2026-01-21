"use client";

import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { 
  ShoppingCart, Star, Heart, Share2, ArrowLeft, Check, Plus, Minus, 
  Truck, ShieldCheck, Box, RefreshCw, FileText, Download, Cpu, 
  Zap, Settings, Layers, ExternalLink, Loader2, AlertCircle
} from "lucide-react";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import type { Product } from "@fidevoltz/types";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { useState } from "react";
import { formatCurrency as formatNaira } from "@/lib/utils";
import { ProductStatus } from "@fidevoltz/types";
import { ProductReviews } from "@/components/products/product-reviews";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  
  const { addItem, isInCart, getItemQuantity } = useCartStore();

  // Use React Query to fetch product
  const { data: product, isLoading } = useApiQuery<Product>({
    endpoint: `/api/products/${id}`,
    queryKey: ['product', id],
    enabled: !!id,
  });


  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) {
    notFound();
    return null; // TS satisfaction
  }

  // Flatten images logic: 'images' array has priority, fall back to 'image' string
  const images = (product.images && product.images.length > 0) 
    ? product.images 
    : (product.image ? [product.image] : []);

  const specifications = product.specifications as Record<string, string> || {};
  const inCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);
  const isLowStock = product.stock <= (product.minStock || 5);

  const handleAddToCart = () => {
    addItem(product as any, quantity);
    toast.success(`Added ${quantity} ${product.name} to cart!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="container px-4 md:px-6 py-4 flex items-center gap-2 text-sm text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link href="/store" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/store" className="hover:text-blue-600 transition-colors">
            {product.category?.name || 'Components'}
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-medium">{product.name}</span>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-8">
          
          {/* Left Column: Images Gallery */}
          <div className="lg:col-span-7">
            <div className="sticky top-24 space-y-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm group">
                <div 
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${images[activeImage] || '/placeholder.png'}')` }}
                />
                
                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.stock === 0 && (
                        <Badge variant="destructive" className="px-3 py-1 text-sm shadow-sm">Out of Stock</Badge>
                    )}
                    {product.stock > 0 && isLowStock && (
                        <Badge className="bg-amber-500 hover:bg-amber-600 px-3 py-1 text-sm shadow-sm">Low Stock</Badge>
                    )}
                    {product.datasheet && (
                         <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 px-3 py-1 text-sm shadow-sm flex gap-1 items-center">
                             <FileText className="w-3 h-3" /> Datasheet Available
                         </Badge>
                    )}
                </div>
              </div>
              
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all bg-white ${
                        activeImage === index ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${img}')` }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-2">
                 {/* SKU Chip */}
                 <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                   SKU: {product.sku || 'N/A'}
                 </span>
                 {/* Category Link */}
                 <Link href={`/store?category=${product.categoryId}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {product.category?.name}
                 </Link>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                      {product.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs text-slate-600 font-normal">
                              #{tag}
                          </Badge>
                      ))}
                  </div>
              )}

              {/* Price Block */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
                <div className="flex items-end gap-3 mb-6">
                  <span className="text-4xl font-bold text-slate-900 tracking-tight">
                    {formatNaira(Number(product.price))}
                  </span>
                  <span className="text-sm text-slate-400 mb-2">per unit</span>
                </div>
                
                {/* Stock Status Message */}
                {product.stock > 0 ? (
                  <div className={`flex items-center gap-3 font-medium mb-6 p-3 rounded-xl border ${isLowStock ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                    <div className={`h-2.5 w-2.5 rounded-full ${isLowStock ? 'bg-amber-500' : 'bg-green-500'} animate-pulse`} />
                    {isLowStock 
                        ? `Low Stock: Only ${product.stock} left!` 
                        : `In Stock (${product.stock} available)`}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 font-medium mb-6 p-3 rounded-xl bg-red-50 text-red-700 border border-red-100">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-600" />
                    Currently Out of Stock
                  </div>
                )}

                <div className="space-y-6">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Quantity</span>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 h-12">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1 || product.stock === 0}
                        className="h-full px-3 hover:bg-white rounded-l-xl"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-lg text-slate-900">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock || product.stock === 0}
                        className="h-full px-3 hover:bg-white rounded-r-xl"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button 
                      size="lg" 
                      className="flex-1 h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </Button>
                  </div>

                  {product.datasheet && (
                      <Button variant="outline" className="w-full justify-between group" asChild>
                          <a href={product.datasheet} target="_blank" rel="noopener noreferrer">
                              <span className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                  Download Datasheet
                              </span>
                              <Download className="w-4 h-4 text-slate-400" />
                          </a>
                      </Button>
                  )}
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <Truck className="w-5 h-5 text-blue-500" />
                    <div>
                        <p className="font-semibold text-slate-900">Fast Delivery</p>
                        <p className="text-xs text-slate-500">Nationwide shipping</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    <div>
                        <p className="font-semibold text-slate-900">Quality Verified</p>
                        <p className="text-xs text-slate-500">tested components</p>
                    </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="mt-12">
            <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-8">
                    <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 pb-3 px-0 font-medium text-base">
                        Description
                    </TabsTrigger>
                    <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 pb-3 px-0 font-medium text-base">
                        Specifications
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 pb-3 px-0 font-medium text-base">
                        Reviews
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="mt-8 animate-in fade-in-50">
                    <div className="prose prose-slate max-w-none">
                         <div className="whitespace-pre-line text-slate-600 leading-relaxed text-lg">
                             {product.description}
                         </div>
                    </div>
                </TabsContent>

                <TabsContent value="specs" className="mt-8 animate-in fade-in-50">
                     <div className="max-w-3xl">
                        {Object.keys(specifications).length > 0 ? (
                            <Table>
                                <TableBody>
                                    {Object.entries(specifications).map(([key, value]) => (
                                        <TableRow key={key} className="hover:bg-slate-50">
                                            <TableCell className="font-medium text-slate-900 w-1/3 py-4">{key}</TableCell>
                                            <TableCell className="text-slate-600 py-4">{value as string}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                                <Settings className="w-12 h-12 mb-4 opacity-20" />
                                <p>No technical specifications listed for this product.</p>
                            </div>
                        )}
                     </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-8 animate-in fade-in-50">
                     <ProductReviews productId={id} />
                </TabsContent>
            </Tabs>
        </div>

      </div>
       
      {/* Mobile Sticky Add to Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 md:hidden pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Price</span>
            <span className="text-xl font-bold text-slate-900">{formatNaira(Number(product.price))}</span>
          </div>
          <Button 
            size="lg" 
            className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </div>
  );
}
