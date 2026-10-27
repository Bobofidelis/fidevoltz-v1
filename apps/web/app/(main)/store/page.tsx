"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Truck, 
  Cpu, 
  Layers, 
  Send, 
  ArrowRight,
  TrendingUp,
  Star,
  CheckCircle2
} from "lucide-react";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import type { Product, PaginatedResponse } from "@fidevoltz/types";
import { toast } from "sonner";
import { StoreSidebar } from "@/components/store/store-sidebar";
import { StoreProductGrid, ActiveFilter } from "@/components/store/product-grid";
import { SearchSuggestions } from "@/components/store/search-suggestions";
import { TrustBadges } from "@/components/store/trust-badges";
import { CategoryCards, CategoryItem } from "@/components/store/category-cards";
import { NewArrivals } from "@/components/store/new-arrivals";
import { formatCurrency } from "@/lib/utils";

const POPULAR_SEARCH_TERMS = [
  "ESP32",
  "Arduino",
  "OLED",
  "Sensors",
  "Soldering",
  "Raspberry Pi",
  "Relay",
];

const DEFAULT_BRANDS = [
  "Arduino",
  "Espressif",
  "Raspberry Pi",
  "Adafruit",
  "SparkFun",
  "Generic",
  "STMicroelectronics",
  "Texas Instruments",
];

function StoreContent() {
  // Fetch products from public endpoint - request limit 100 to populate store catalog
  const { data, isLoading } = useApiQuery<PaginatedResponse<Product>>({
    endpoint: "/api/products?limit=100",
    queryKey: ["products", "store", "catalog"],
    requireAuth: false,
  });

  // Fetch categories from public database
  const { data: categoriesData, isLoading: categoriesLoading } = useApiQuery<
    { id: string; name: string; slug?: string; _count?: { products: number } }[]
  >({
    endpoint: "/api/categories",
    queryKey: ["categories", "public"],
    requireAuth: false,
  });

  // Transform products with stock status and fallback fields
  const allProducts = useMemo(() => {
    return (
      data?.data?.map((p: Product) => {
        const stock = p.stock || 0;
        const minStock = p.minStock || 5;

        let badge: string | undefined = p.badge;
        if (!badge) {
          if (stock === 0) {
            badge = "Out of Stock";
          } else if (stock <= minStock) {
            badge = "Low Stock";
          } else if (
            p.createdAt &&
            new Date(p.createdAt) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
          ) {
            badge = "New";
          }
        }

        const priceNum = Number(p.price);
        const originalPrice = p.originalPrice
          ? Number(p.originalPrice)
          : priceNum > 15000
          ? Math.round(priceNum * 1.15)
          : undefined;

        return {
          id: p.id,
          name: p.name,
          description: p.description,
          price: priceNum,
          originalPrice,
          image:
            p.image ||
            p.images?.[0] ||
            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80",
          images: p.images || [],
          category: p.category || {
            id: p.categoryId || "c",
            name: "Components",
          },
          categoryId: p.categoryId || p.category?.id,
          brand: p.brand || (p.name.includes("Arduino") ? "Arduino" : p.name.includes("ESP") ? "Espressif" : p.name.includes("Raspberry") ? "Raspberry Pi" : "Generic"),
          badge,
          stock,
          minStock,
          inStock: stock > 0,
          rating: p.rating || 4.8,
          reviewCount: p.reviewCount || 14,
          sku: p.sku,
          datasheet: p.datasheet,
          specifications: p.specifications,
          tags: p.tags || [],
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          currency: p.currency || "NGN",
          status: p.status,
          allowReviews: p.allowReviews ?? true,
        } as Product;
      }) || []
    );
  }, [data]);

  // Extract category names and category items
  const categories = useMemo(() => {
    if (categoriesData && categoriesData.length > 0) {
      return categoriesData.map((c) => c.name);
    }
    // Fallback: derive from products
    const unique = Array.from(new Set(allProducts.map((p) => p.category?.name || (p as any).category))).filter(Boolean);
    return unique.length > 0 ? (unique as string[]) : ["Microcontrollers", "Sensors", "Development Boards", "Tools", "Power & Batteries"];
  }, [categoriesData, allProducts]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach((p) => {
      const catName = p.category?.name;
      if (catName) {
        counts[catName] = (counts[catName] || 0) + 1;
      }
    });
    return counts;
  }, [allProducts]);

  // Categories formatted for visual cards
  const visualCategoryCards = useMemo<CategoryItem[]>(() => {
    if (categoriesData && categoriesData.length > 0) {
      return categoriesData.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        count: categoryCounts[c.name] ?? c._count?.products ?? 0,
      }));
    }
    return categories.map((name) => ({
      id: name,
      name,
      count: categoryCounts[name] || 0,
    }));
  }, [categoriesData, categories, categoryCounts]);

  // Brands list: combine default brands with brands from products
  const brands = useMemo(() => {
    const extracted = Array.from(new Set(allProducts.map((p) => p.brand).filter(Boolean))) as string[];
    return Array.from(new Set([...DEFAULT_BRANDS, ...extracted]));
  }, [allProducts]);

  // Filter States
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("Featured");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Sync category param from URL
  useEffect(() => {
    if (categoryParam) {
      const paramLower = categoryParam.toLowerCase();
      const matched = categoriesData?.find(
        (c) =>
          c.id === categoryParam ||
          c.name.toLowerCase() === paramLower ||
          c.name.toLowerCase().replace(/\s+/g, "-") === paramLower
      );
      const catToSelect = matched?.name || categoryParam;
      setSelectedCategories([catToSelect]);
    }
  }, [categoryParam, categoriesData]);

  // Filter Toggles
  const toggleFilter = (
    item: string,
    current: string[],
    setter: (val: string[]) => void
  ) => {
    if (current.includes(item)) {
      setter(current.filter((i) => i !== item));
    } else {
      setter([...current, item]);
    }
  };

  const handleSelectSingleCategory = (catName: string | null) => {
    if (catName === null) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([catName]);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([]);
    setInStockOnly(false);
    setSelectedRating(null);
    setSortBy("Featured");
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((product) => {
        // Search query
        if (searchQuery.trim()) {
          const searchLower = searchQuery.toLowerCase().trim();
          const nameMatch = product.name?.toLowerCase().includes(searchLower);
          const descMatch = product.description?.toLowerCase().includes(searchLower);
          const brandMatch = product.brand?.toLowerCase().includes(searchLower);
          const catMatch = product.category?.name?.toLowerCase().includes(searchLower);
          const tagsMatch = product.tags?.some((t: string) => t.toLowerCase().includes(searchLower));

          if (!nameMatch && !descMatch && !brandMatch && !catMatch && !tagsMatch) {
            return false;
          }
        }

        // Category filter
        if (selectedCategories.length > 0) {
          const prodCatName = product.category?.name?.toLowerCase() || "";
          const prodCatId = product.categoryId || product.category?.id || "";

          const matchesCat = selectedCategories.some((cat) => {
            const catLower = cat.toLowerCase();
            return (
              prodCatName === catLower ||
              prodCatId === cat ||
              prodCatName.includes(catLower)
            );
          });
          if (!matchesCat) return false;
        }

        // Brand filter
        if (selectedBrands.length > 0) {
          const prodBrand = product.brand || "Generic";
          if (!selectedBrands.includes(prodBrand)) {
            return false;
          }
        }

        // In-stock only
        if (inStockOnly && product.stock <= 0) {
          return false;
        }

        // Rating filter
        if (selectedRating !== null && (product.rating || 4.8) < selectedRating) {
          return false;
        }

        // Price range presets
        if (priceRange.length > 0) {
          const price = Number(product.price);
          const matchesPrice = priceRange.some((range) => {
            if (range === "Under ₦10,000") return price < 10000;
            if (range === "₦10,000 - ₦25,000") return price >= 10000 && price <= 25000;
            if (range === "₦25,000 - ₦50,000") return price > 25000 && price <= 50000;
            if (range === "₦50,000+") return price > 50000;
            return false;
          });
          if (!matchesPrice) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "Price: Low to High") return Number(a.price) - Number(b.price);
        if (sortBy === "Price: High to Low") return Number(b.price) - Number(a.price);
        if (sortBy === "Newest") {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        }
        if (sortBy === "Rating") {
          return (b.rating || 4.8) - (a.rating || 4.8);
        }
        if (sortBy === "Name: A to Z") {
          return a.name.localeCompare(b.name);
        }
        return 0; // Featured default
      });
  }, [
    allProducts,
    searchQuery,
    selectedCategories,
    selectedBrands,
    inStockOnly,
    selectedRating,
    priceRange,
    sortBy,
  ]);

  // New arrivals for featured carousel
  const newArrivals = useMemo(() => {
    return allProducts.filter((p) => p.badge === "New").slice(0, 8);
  }, [allProducts]);

  // Hero featured highlights (top 2-3 products)
  const heroFeaturedProducts = useMemo(() => {
    return allProducts.slice(0, 3);
  }, [allProducts]);

  // Construct active filter objects for ProductGrid
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const list: ActiveFilter[] = [];

    if (searchQuery.trim()) {
      list.push({
        id: `search-${searchQuery}`,
        label: `"${searchQuery}"`,
        onRemove: () => setSearchQuery(""),
      });
    }

    selectedCategories.forEach((cat) => {
      list.push({
        id: `cat-${cat}`,
        label: cat,
        onRemove: () => toggleFilter(cat, selectedCategories, setSelectedCategories),
      });
    });

    selectedBrands.forEach((brand) => {
      list.push({
        id: `brand-${brand}`,
        label: brand,
        onRemove: () => toggleFilter(brand, selectedBrands, setSelectedBrands),
      });
    });

    priceRange.forEach((range) => {
      list.push({
        id: `price-${range}`,
        label: range,
        onRemove: () => toggleFilter(range, priceRange, setPriceRange),
      });
    });

    if (inStockOnly) {
      list.push({
        id: "stock-only",
        label: "In Stock Only",
        onRemove: () => setInStockOnly(false),
      });
    }

    if (selectedRating !== null) {
      list.push({
        id: `rating-${selectedRating}`,
        label: `${selectedRating}★ & Above`,
        onRemove: () => setSelectedRating(null),
      });
    }

    return list;
  }, [
    searchQuery,
    selectedCategories,
    selectedBrands,
    priceRange,
    inStockOnly,
    selectedRating,
  ]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setNewsletterEmail("");
      toast.success("Thank you for subscribing to FideVoltz store updates!");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900">
      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-slate-950 text-white overflow-hidden pt-12 pb-16 md:pt-16 md:pb-20 border-b border-slate-800">
        {/* Animated Radial Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/25 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[110px] pointer-events-none" />

        {/* Circuit / High-Tech Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>Verified Electronics Components & Maker Hardware</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                Power Your Next Build With <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">Genuine Hardware</span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Direct source for genuine microcontrollers, sensors, dev boards, and precision tools in Nigeria. Tested for engineering labs, maker studios, and industrial prototyping.
              </p>

              {/* Integrated Search Bar with Suggestions */}
              <div className="relative max-w-xl mx-auto lg:mx-0 pt-2" ref={searchRef}>
                <div className="relative flex items-center">
                  <Search className="absolute left-4 h-5 w-5 text-slate-400 pointer-events-none" />
                  <Input
                    placeholder="Search components, sensors, microcontrollers, tools..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => searchQuery && setShowSuggestions(true)}
                    className="h-13 pl-12 pr-28 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white focus:text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-xl backdrop-blur-md text-sm transition-all"
                  />
                  {searchQuery ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 h-8 text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="absolute right-2 h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md"
                      onClick={() => resultsRef.current?.scrollIntoView({ behavior: "smooth" })}
                    >
                      Explore
                    </Button>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <SearchSuggestions
                    products={filteredProducts}
                    searchQuery={searchQuery}
                    onSelect={() => setShowSuggestions(false)}
                  />
                )}

                {/* Popular Keywords Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3 justify-center lg:justify-start">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <TrendingUp className="h-3 w-3 text-blue-400" />
                    Popular:
                  </span>
                  {POPULAR_SEARCH_TERMS.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setSearchQuery(term)}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Trust Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 max-w-2xl mx-auto lg:mx-0">
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold text-white">500+</span>
                  <span className="text-xs text-slate-400">Components in stock</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold text-white">Same-Day</span>
                  <span className="text-xs text-slate-400">Order dispatch</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold text-white">100%</span>
                  <span className="text-xs text-slate-400">Tested & verified</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold text-white flex items-center gap-1">
                    4.9
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </span>
                  <span className="text-xs text-slate-400">Maker satisfaction</span>
                </div>
              </div>
            </div>

            {/* Right Hero: Sleek Featured Highlights Card Stack */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative p-6 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Featured Hardware
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-[10px] border-none">
                    Top Sellers
                  </Badge>
                </div>

                <div className="space-y-3">
                  {heroFeaturedProducts.map((p, idx) => (
                    <Link
                      key={p.id}
                      href={`/store/product/${p.id}`}
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-blue-500/40 transition-all duration-200 group"
                    >
                      <div 
                        className="w-14 h-14 rounded-xl bg-slate-800 bg-cover bg-center shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
                        style={{ backgroundImage: `url('${p.image || ''}')` }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">
                          {p.category?.name || "Hardware"}
                        </span>
                        <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                          {p.name}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-bold text-white">
                            {formatCurrency(Number(p.price))}
                          </span>
                          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            In Stock
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-center">
                  <p className="text-xs text-slate-300">
                    Need bulk or school engineering lab supply?{" "}
                    <Link href="/contact" className="text-blue-400 hover:underline font-semibold">
                      Contact Sales &rarr;
                    </Link>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= MAIN CATALOG BODY ================= */}
      <main className="container mx-auto px-4 sm:px-6 py-8" ref={resultsRef}>
        
        {/* Trust Badges Bar */}
        <TrustBadges />

        {/* Visual Category Navigation Cards */}
        <CategoryCards
          categories={visualCategoryCards}
          selectedCategory={selectedCategories.length === 1 ? selectedCategories[0] : null}
          onSelectCategory={handleSelectSingleCategory}
          totalProductsCount={allProducts.length}
        />

        {/* New Arrivals Section (shown when no specific search is active) */}
        {!searchQuery && newArrivals.length > 0 && (
          <NewArrivals products={newArrivals} />
        )}

        {/* Catalog Main Layout (Sidebar + Product Grid) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start mt-6">
          
          {/* Sidebar Filter Panel */}
          <StoreSidebar
            categories={categories}
            categoryCounts={categoryCounts}
            brands={brands}
            selectedCategories={selectedCategories}
            selectedBrands={selectedBrands}
            priceRange={priceRange}
            inStockOnly={inStockOnly}
            selectedRating={selectedRating}
            onToggleCategory={(cat) => toggleFilter(cat, selectedCategories, setSelectedCategories)}
            onToggleBrand={(brand) => toggleFilter(brand, selectedBrands, setSelectedBrands)}
            onTogglePrice={(range) => toggleFilter(range, priceRange, setPriceRange)}
            onToggleInStock={setInStockOnly}
            onSelectRating={setSelectedRating}
            onReset={resetFilters}
            totalFilteredCount={filteredProducts.length}
          />

          {/* Product Grid Area */}
          <StoreProductGrid
            products={filteredProducts}
            totalProducts={allProducts.length}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onReset={resetFilters}
            isLoading={isLoading}
            activeFilters={activeFilters}
            itemsPerPage={12}
          />
        </div>

        {/* ================= NEWSLETTER & MAKER COMMUNITY CTA ================= */}
        <section className="my-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
              <Zap className="h-3.5 w-3.5 text-blue-400" />
              <span>Maker & Engineer Community</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Get notified about new components, restocks & maker deals
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Subscribe to the FideVoltz hardware dispatch. Receive bi-weekly alerts on newly arrived microcontrollers, datasheets, and exclusive student discounts.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto pt-3"
            >
              <Input
                type="email"
                placeholder="Enter your engineer or maker email..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white focus:text-slate-900 text-sm"
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="w-full sm:w-auto h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shrink-0 shadow-md transition-all"
              >
                {isSubscribing ? "Subscribing..." : "Join Dispatch"}
                <Send className="h-4 w-4 ml-2" />
              </Button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                <span>Zero spam guarantee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                <span>Early access to restocks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                <span>Unsubscribe anytime</span>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-600">Loading FideVoltz store...</p>
          </div>
        </div>
      }
    >
      <StoreContent />
    </Suspense>
  );
}
