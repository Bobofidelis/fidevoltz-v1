"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect, useRef } from "react";
import { NewArrivals } from "@/components/store/new-arrivals";
import { StoreSidebar } from "@/components/store/store-sidebar";
import { StoreProductGrid } from "@/components/store/product-grid";
import { SearchSuggestions } from "@/components/store/search-suggestions";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import type { Product, PaginatedResponse } from "@fidevoltz/types";

export default function StorePage() {
  // Use React Query to fetch products - public endpoint
  const { data, isLoading } = useApiQuery<PaginatedResponse<Product>>({
    endpoint: '/api/products',
    queryKey: ['products', 'store'],
    requireAuth: false, // Public endpoint - no auth required
  });

  // Fetch categories from database
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useApiQuery<{ id: string; name: string }[]>({
    endpoint: '/api/categories',
    queryKey: ['categories', 'public'],
    requireAuth: false,
  });

  // Transform products with CORRECT stock status logic
  const allProducts = useMemo(() => {
    return data?.data?.map((p: Product) => {
      const stock = p.stock || 0;
      const minStock = p.minStock || 5;
      
      // Determine badge based on stock status
      let badge: string | undefined;
      if (stock === 0) {
        badge = 'Out of Stock';
      } else if (stock <= minStock) {
        badge = 'Low Stock';
      } else if (p.createdAt && new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        badge = 'New';
      }

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        image: p.image || p.images?.[0] || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
        category: p.category?.name || 'Uncategorized',
        brand: 'Generic',
        badge,
        stock,
        inStock: stock > 0, // Product is in stock if stock > 0
      };
    }) || [];
  }, [data]);
  
  // Get categories from database, fallback to empty array
  const categories = useMemo(() => {
    return categoriesData?.map(cat => cat.name) || [];
  }, [categoriesData]);

  const brands = ["Arduino", "Espressif", "Raspberry Pi", "Adafruit", "SparkFun", "Generic", "TechTools", "SolderMaster"];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Featured");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);

  const toggleFilter = (item: string, current: string[], setter: (val: string[]) => void) => {
    if (current.includes(item)) {
      setter(current.filter((i) => i !== item));
    } else {
      setter([...current, item]);
    }
  };

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Search
      const searchLower = searchQuery.toLowerCase();
      if (searchQuery && 
          !(product.name && product.name.toLowerCase().includes(searchLower)) && 
          !(product.description && product.description.toLowerCase().includes(searchLower))) {
        return false;
      }

      // Categories
      if (selectedCategories.length > 0 && !(product.category && selectedCategories.includes(product.category))) {
        return false;
      }

      // Brands
      if (selectedBrands.length > 0 && !(product.brand && selectedBrands.includes(product.brand))) {
        return false;
      }

      // Price Range
      if (priceRange.length > 0) {
        const price = product.price;
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
    }).sort((a, b) => {
      if (sortBy === "Price: Low to High") return a.price - b.price;
      if (sortBy === "Price: High to Low") return b.price - a.price;
      if (sortBy === "Newest") return parseInt(b.id) - parseInt(a.id);
      return 0; // Featured default
    });
  }, [allProducts, searchQuery, selectedCategories, selectedBrands, priceRange, sortBy]);

  const newArrivals = useMemo(() => {
    return allProducts.filter(p => p.badge === "New").slice(0, 8);
  }, [allProducts]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ref for auto-scroll
  const resultsRef = useRef<HTMLDivElement>(null);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([]);
    setSortBy("Featured");
  };

  // Auto-scroll on search
  useEffect(() => {
    if (searchQuery && resultsRef.current && window.scrollY < resultsRef.current.offsetTop - 200) {
      const timeout = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        
        <div className="container px-4 md:px-6 relative z-10 text-center">
          <Badge className="mb-4 bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1 mx-auto">
            Official Store
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight max-w-4xl mx-auto">
            Build The Future With <span className="text-blue-400">Premium Components</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
            Discover our curated collection of microcontrollers, sensors, and tools. 
            Everything you need to bring your electronic projects to life.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 bg-slate-50 min-h-screen" ref={resultsRef}>
        <div className="container px-4 md:px-6">
          
          {/* New Arrivals Section - Hide when searching to focus on results */}
          {!searchQuery && <NewArrivals products={newArrivals as any[]} />}

          {/* Sticky Toolbar for Search & Filters */}
          <div className={`sticky top-20 z-40 backdrop-blur-md rounded-xl border shadow-md p-4 mb-8 transition-all duration-300 ${searchQuery ? 'bg-blue-50/90 border-blue-200 ring-2 ring-blue-500/20 shadow-lg scale-[1.01]' : 'bg-white/90 border-slate-200'}`}>
             <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                
                {/* Search */}
                <div className="relative w-full lg:max-w-md" ref={searchRef}>
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors ${searchQuery ? 'text-blue-600' : 'text-slate-400'}`} />
                  <Input 
                    placeholder="Search components, tools, sensors..." 
                    className={`pl-10 transition-all ${searchQuery ? 'bg-white border-blue-500 ring-1 ring-blue-500' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => searchQuery && setShowSuggestions(true)}
                  />
                  
                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && (
                    <SearchSuggestions
                      products={filteredProducts}
                      searchQuery={searchQuery}
                      onSelect={() => setShowSuggestions(false)}
                    />
                  )}
                </div>

                {/* Filters Row */}
                <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 hide-scrollbar scroll-smooth">
                   {/* Categories Pill Group */}
                   <div className="flex items-center bg-slate-100 rounded-lg p-1">
                      <Button 
                        variant={selectedCategories.length === 0 ? "default" : "ghost"} 
                        size="sm" 
                        className={`rounded-md h-8 text-xs ${selectedCategories.length === 0 ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                        onClick={() => setSelectedCategories([])}
                      >
                        All
                      </Button>
                      {categories.length > 0 ? (
                        categories.map(cat => (
                          <Button
                            key={cat}
                            variant="ghost"
                            size="sm"
                            className={`rounded-md h-8 text-xs whitespace-nowrap ${selectedCategories.includes(cat) ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-slate-500 hover:text-slate-900'}`}
                            onClick={() => toggleFilter(cat, selectedCategories, setSelectedCategories)}
                          >
                            {cat}
                          </Button>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 px-3">No categories yet</span>
                      )}
                   </div>
                   
                   {/* Sort Dropdown Hook Component could be better but simplified to Select for now or Button toggles */}
                   <div className="h-6 w-px bg-slate-200 mx-2 flex-shrink-0" />

                   <select 
                      className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:text-slate-900"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                   >
                     <option>Featured</option>
                     <option>Price: Low to High</option>
                     <option>Price: High to Low</option>
                     <option>Newest</option>
                   </select>
                </div>
             </div>
             
             {/* Active Filter Tags */}
             {(selectedCategories.length > 0 || searchQuery) && (
               <div className="mt-3 flex flex-wrap gap-2 items-center text-xs">
                 <span className="text-slate-400">Active Filters:</span>
                 {selectedCategories.map(cat => (
                   <Badge key={cat} variant="secondary" className="flex items-center gap-1 cursor-pointer hover:bg-slate-200" onClick={() => toggleFilter(cat, selectedCategories, setSelectedCategories)}>
                     {cat} <span className="opacity-50">×</span>
                   </Badge>
                 ))}
                 {searchQuery && (
                   <Badge variant="secondary" className="flex items-center gap-1 cursor-pointer hover:bg-slate-200" onClick={() => setSearchQuery("")}>
                     Search: "{searchQuery}" <span className="opacity-50">×</span>
                   </Badge>
                 )}
                 <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-600" onClick={resetFilters}>
                   Clear All
                 </Button>
               </div>
             )}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* We removed the Sidebar to focus on the Sticky Top Bar which is "Close to Content" 
                But for Layout stability, we can keep the Grid full width now.
             */}

            {/* Product Grid - Full Width */}
            <div className="flex-1">
              <StoreProductGrid 
                products={filteredProducts as any as Product[]}
                totalProducts={allProducts.length}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onReset={resetFilters}
                hideHeader={true} // Add this prop to hide the redundant header in grid if exists
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

