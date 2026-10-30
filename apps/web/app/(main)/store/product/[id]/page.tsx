"use client";

import { absoluteUrl } from "@/lib/site";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Star, 
  Heart, 
  Share2, 
  ArrowLeft, 
  Check, 
  Plus, 
  Minus, 
  Truck, 
  ShieldCheck, 
  Headphones,
  RotateCcw,
  FileText, 
  Download, 
  Settings, 
  Loader2, 
  Package, 
  Copy,
  ExternalLink,
  Clock,
  Sparkles
} from "lucide-react";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import type { Product, PaginatedResponse } from "@fidevoltz/types";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";
import { ProductReviews } from "@/components/products/product-reviews";
import { ProductCard } from "@/components/store/product-card";

interface RecentlyViewedItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);

  const { addItem, isInCart, getItemQuantity } = useCartStore();

  // Fetch product detail
  const { data: product, isLoading } = useApiQuery<Product>({
    endpoint: `/api/products/${id}`,
    queryKey: ['product', id],
    enabled: !!id,
  });

  // Fetch related products from the same category
  const { data: relatedData } = useApiQuery<PaginatedResponse<Product>>({
    endpoint: product?.categoryId ? `/api/products?categoryId=${product.categoryId}&limit=5` : `/api/products?limit=5`,
    queryKey: ['products', 'related', product?.categoryId || 'all'],
    enabled: !!product,
  });

  // Update and load recently viewed in localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem("fidevoltz_recently_viewed");
      if (stored) {
        const parsed: RecentlyViewedItem[] = JSON.parse(stored);
        setRecentlyViewed(parsed.filter((item) => item.id !== id));
      }

      if (product) {
        const currentItem: RecentlyViewedItem = {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image || product.images?.[0] || "",
          category: product.category?.name || "Components",
        };

        const existing: RecentlyViewedItem[] = stored ? JSON.parse(stored) : [];
        const nextList = [
          currentItem,
          ...existing.filter((item) => item.id !== product.id),
        ].slice(0, 6);

        localStorage.setItem("fidevoltz_recently_viewed", JSON.stringify(nextList));
      }
    } catch {
      // Ignore storage errors
    }
  }, [product, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">Loading component details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-center px-4 bg-slate-50">
        <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
          <Package className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Component Not Found</h1>
        <p className="text-slate-500 max-w-md text-sm">
          This hardware component doesn't exist or may have been unlisted from our catalog.
        </p>
        <Link href="/store">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Back to Electronics Store</Button>
        </Link>
      </div>
    );
  }

  // Flatten images list
  const images = (product.images && product.images.length > 0)
    ? product.images
    : product.image
    ? [product.image]
    : ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80"];

  const specifications = (product.specifications as Record<string, string>) || {};
  const stock = product.stock ?? 0;
  const minStock = product.minStock || 5;
  const isOutOfStock = stock === 0;
  const isLowStock = !isOutOfStock && stock <= minStock;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product as any, quantity);
    toast.success(`Added ${quantity} × ${product.name} to cart!`);
  };

  const handleToggleWishlist = () => {
    const next = !isWishlisted;
    setIsWishlisted(next);
    if (next) {
      toast.success(`${product.name} saved to wishlist!`);
    } else {
      toast.info(`Removed from wishlist`);
    }
  };

  // Zoom handling on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  // Social Share
  const currentUrl = typeof window !== "undefined" ? window.location.href : absoluteUrl(`/store/product/${product.id}`);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    toast.success("Product link copied to clipboard!");
    setShareDropdownOpen(false);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out ${product.name} on FideVoltz Store: ${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    setShareDropdownOpen(false);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Check out ${product.name} on @fidevoltz:`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(currentUrl)}`, "_blank");
    setShareDropdownOpen(false);
  };

  // Related products (filter out current product)
  const relatedProducts = (relatedData?.data || [])
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16 md:pb-12">
      
      {/* ================= BREADCRUMBS ================= */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="container mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-2 text-xs sm:text-sm text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link href="/store" className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium text-slate-600">
            <ArrowLeft className="h-3.5 w-3.5" /> Electronics Store
          </Link>
          <span className="text-slate-300">/</span>
          {product.category && (
            <>
              <Link 
                href={`/store?category=${product.categoryId || product.category.name}`} 
                className="hover:text-blue-600 transition-colors"
              >
                {product.category.name}
              </Link>
              <span className="text-slate-300">/</span>
            </>
          )}
          <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* ================= MAIN PRODUCT CONTAINER ================= */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 mb-6">
          
          {/* LEFT: Image Gallery with Interactive Hover Zoom */}
          <div className="lg:col-span-7">
            <div className="sticky top-20 space-y-4">
              
              {/* Main Image Box */}
              <div 
                className="relative aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-xs cursor-crosshair group"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <div 
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-all duration-150 p-6"
                  style={{
                    backgroundImage: `url('${images[activeImage]}')`,
                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                    transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
                  }}
                />

                {/* Status Badges Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                  {isOutOfStock ? (
                    <Badge variant="destructive" className="px-3 py-1 text-xs shadow-xs">
                      Out of Stock
                    </Badge>
                  ) : isLowStock ? (
                    <Badge className="bg-amber-500 hover:bg-amber-600 px-3 py-1 text-xs text-white shadow-xs">
                      Low Stock: {stock} Left
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1 text-xs text-white shadow-xs">
                      In Stock
                    </Badge>
                  )}

                  {product.datasheet && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 px-2.5 py-0.5 text-xs shadow-xs flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Datasheet Included
                    </Badge>
                  )}
                </div>

                {/* Zoom Hint */}
                <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-slate-900/60 text-white text-[11px] backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Hover to zoom
                </div>
              </div>

              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth hide-scrollbar">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(idx)}
                      className={cn(
                        "relative w-20 h-20 rounded-xl overflow-hidden border-2 bg-white shrink-0 p-1.5 transition-all",
                        activeImage === idx
                          ? "border-blue-600 ring-2 ring-blue-100 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                      )}
                    >
                      <div 
                        className="w-full h-full bg-contain bg-center bg-no-repeat"
                        role="img"
                        aria-label={`${product.name} photo`}
                        style={{ backgroundImage: `url('${img}')` }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product Details & Purchase Actions */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold uppercase text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    SKU: {product.sku || 'N/A'}
                  </span>
                  <Link 
                    href={`/store?category=${product.categoryId || product.category?.name}`}
                    className="text-xs font-semibold text-blue-600 hover:underline bg-blue-50 px-2.5 py-1 rounded-md"
                  >
                    {product.category?.name || "Electronics"}
                  </Link>
                </div>

                {/* Rating display */}
                <div className="flex items-center gap-1">
                  <Star className={`h-4 w-4 ${product.reviewCount ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                  {product.reviewCount ? (
                    <>
                      <span className="text-sm font-bold text-slate-800">{product.rating}</span>
                      <span className="text-sm text-slate-500">({product.reviewCount} review{product.reviewCount === 1 ? "" : "s"})</span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-500">No reviews yet</span>
                  )}
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight mb-3">
                {product.name}
              </h1>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs font-normal text-slate-600 bg-white">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Price Card */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs mb-6 space-y-5">
                <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      {formatCurrency(Number(product.price))}
                    </span>
                    <span className="text-xs text-slate-400 ml-2 font-medium">per unit (inc. VAT)</span>
                  </div>

                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatCurrency(Number(product.originalPrice))}
                    </span>
                  )}
                </div>

                {/* Stock status indicator pill */}
                <div className={cn(
                  "flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium",
                  isOutOfStock
                    ? "bg-rose-50 text-rose-700 border-rose-100"
                    : isLowStock
                    ? "bg-amber-50 text-amber-700 border-amber-100"
                    : "bg-emerald-50 text-emerald-700 border-emerald-100"
                )}>
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    isOutOfStock
                      ? "bg-rose-500"
                      : isLowStock
                      ? "bg-amber-500 animate-pulse"
                      : "bg-emerald-500"
                  )} />
                  {isOutOfStock
                    ? "Currently backordered or out of stock"
                    : isLowStock
                    ? `Low Stock: Only ${stock} units remaining in warehouse`
                    : `In Stock: Ready for dispatch (${stock} units available)`}
                </div>

                {/* Quantity + Add to Cart */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Order Quantity</span>
                    {stock > 0 && (
                      <span className="text-slate-400 font-normal">Max available: {stock}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 h-12 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="h-full px-3 hover:bg-white rounded-l-xl text-slate-700"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-base text-slate-900">
                        {quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                        disabled={quantity >= stock || isOutOfStock}
                        className="h-full px-3 hover:bg-white rounded-r-xl text-slate-700"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      size="lg"
                      className="flex-1 min-w-0 h-12 px-3 sm:px-8 text-sm sm:text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                    >
                      <ShoppingCart className="h-5 w-5 mr-1.5 sm:mr-2" />
                      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-12 w-12 rounded-xl border-slate-200 hover:bg-slate-50 shrink-0",
                        isWishlisted && "text-rose-500 border-rose-200 bg-rose-50/50"
                      )}
                      onClick={handleToggleWishlist}
                      aria-label="Save to wishlist"
                    >
                      <Heart className={cn("h-5 w-5", isWishlisted && "fill-rose-500")} />
                    </Button>
                  </div>

                  {/* Datasheet Download */}
                  {product.datasheet && (
                    <Button variant="outline" className="w-full justify-between h-11 border-slate-200" asChild>
                      <a href={product.datasheet} target="_blank" rel="noopener noreferrer">
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Download Technical Datasheet (PDF)
                        </span>
                        <Download className="w-4 h-4 text-slate-400" />
                      </a>
                    </Button>
                  )}
                </div>

                {/* Social Share Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Share component:</span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleShareWhatsApp}
                      className="h-8 px-2 text-xs text-emerald-600 hover:bg-emerald-50"
                    >
                      WhatsApp
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleShareTwitter}
                      className="h-8 px-2 text-xs text-sky-600 hover:bg-sky-50"
                    >
                      Twitter / X
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyLink}
                      className="h-8 px-2 text-xs text-slate-600 hover:bg-slate-100"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copy Link
                    </Button>
                  </div>
                </div>

              </div>

              {/* Service Assurance Badges */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/80">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">Fast Nationwide</p>
                    <p className="text-xs text-slate-500 mt-0.5">Dispatched within 24hrs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/80">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">Genuine Tested</p>
                    <p className="text-xs text-slate-500 mt-0.5">100% verified hardware</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ================= TABS: SPECS, DESCRIPTION, REVIEWS ================= */}
        <div className="mt-6 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto hide-scrollbar border-b border-slate-200 rounded-none h-auto p-0 bg-transparent space-x-5">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 pb-3 px-1 font-semibold text-sm sm:text-base text-slate-600"
              >
                Overview & Description
              </TabsTrigger>
              <TabsTrigger
                value="specs"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 pb-3 px-1 font-semibold text-sm sm:text-base text-slate-600"
              >
                Technical Specifications
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 pb-3 px-1 font-semibold text-sm sm:text-base text-slate-600"
              >
                Customer Reviews
              </TabsTrigger>
            </TabsList>

            {/* Description Tab */}
            <TabsContent value="description" className="mt-6">
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base">
                <div className="whitespace-pre-line">
                  {product.description || "No full description provided for this component."}
                </div>
              </div>
            </TabsContent>

            {/* Specs Tab */}
            <TabsContent value="specs" className="mt-6">
              <div className="max-w-2xl">
                {Object.keys(specifications).length > 0 ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <Table>
                      <TableBody>
                        {Object.entries(specifications).map(([key, value]) => (
                          <TableRow key={key} className="hover:bg-slate-50 border-b border-slate-100 last:border-none">
                            <TableCell className="font-semibold text-slate-900 w-1/3 py-3.5 text-xs sm:text-sm">
                              {key}
                            </TableCell>
                            <TableCell className="text-slate-600 py-3.5 text-xs sm:text-sm">
                              {value as string}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Settings className="w-10 h-10 mb-2 opacity-30 text-slate-500" />
                    <p className="text-sm font-medium">No technical specifications listed for this product.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
              <ProductReviews productId={id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* ================= RELATED PRODUCTS ================= */}
        {relatedProducts.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Related Hardware Components
                </h3>
                <p className="text-xs text-slate-500">
                  Engineers who viewed this item also checked out
                </p>
              </div>
              <Link href={`/store?category=${product.categoryId || product.category?.name}`}>
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                  View More &rarr;
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* ================= RECENTLY VIEWED ================= */}
        {recentlyViewed.length > 0 && (
          <section className="mt-8 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  Recently Viewed Components
                </h3>
                <p className="text-xs text-slate-500">
                  Items you previously inspected
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {recentlyViewed.map((item) => (
                <Link
                  key={item.id}
                  href={`/store/product/${item.id}`}
                  className="group block p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <div
                    className="aspect-square rounded-xl bg-slate-50 bg-contain bg-center bg-no-repeat mb-2 group-hover:scale-105 transition-transform"
                    style={{ backgroundImage: `url('${item.image}')` }}
                  />
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {formatCurrency(item.price)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ================= MOBILE STICKY ADD TO CART BAR ================= */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3.5 z-40 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex flex-col shrink-0">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Unit Price</span>
            <span className="text-lg font-extrabold text-slate-900">
              {formatCurrency(Number(product.price))}
            </span>
          </div>

          <Button
            size="lg"
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>

    </div>
  );
}
