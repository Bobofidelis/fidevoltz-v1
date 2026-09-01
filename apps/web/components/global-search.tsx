"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Loader2, Package, FileText, ArrowRight, BookOpen, Folder, User, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export function GlobalSearch({ triggerClassName = "", variant = "outline", context = "frontend" }: { triggerClassName?: string, variant?: any, context?: "frontend" | "dashboard" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ 
    products: any[]; 
    projects: any[];
    categories: any[];
    users: any[];
    orders: any[];
  }>({ products: [], projects: [], categories: [], users: [], orders: [] });
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults({ products: [], projects: [], categories: [], users: [], orders: [] });
      return;
    }
  }, [open]);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ products: [], projects: [], categories: [], users: [], orders: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&context=${context}`);
        const data = await res.json();
        if (data.success) {
          setResults({
            products: data.data.products || [],
            projects: data.data.projects || [],
            categories: data.data.categories || [],
            users: data.data.users || [],
            orders: data.data.orders || [],
          });
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, context]);

  const handleSelect = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  const hasResults = results.products.length > 0 || results.projects.length > 0 || results.categories.length > 0 || results.users.length > 0 || results.orders.length > 0;

  return (
    <>
      <Button
        variant={variant}
        className={cn(
          "relative h-9 w-9 p-0 xl:h-11 xl:w-72 xl:justify-start xl:px-4 xl:py-2 text-slate-600 font-medium hover:text-slate-900 border-slate-300 bg-slate-50 hover:bg-slate-100 shadow-sm transition-all",
          triggerClassName
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">{context === "dashboard" ? "Search dashboard..." : "Search website..."}</span>
        <kbd className="pointer-events-none absolute right-2 top-2.5 hidden h-6 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex text-slate-500 shadow-sm">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden gap-0 rounded-xl shadow-2xl">
          <div className="sr-only">
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>Search across the platform.</DialogDescription>
          </div>
          <div className="flex items-center border-b px-4 h-20">
            <Search className="h-8 w-8 text-slate-900 mr-4 flex-shrink-0" />
            <input
              type="text"
              placeholder={context === "dashboard" ? "Search users, orders, products..." : "Search products, tutorials, categories..."}
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-2xl font-bold text-black py-6 placeholder:text-slate-400 placeholder:font-medium"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {loading && <Loader2 className="h-6 w-6 animate-spin text-slate-400 flex-shrink-0" />}
          </div>

          <div className="max-h-[60vh] overflow-y-auto bg-white">
            {!query ? (
              <div className="p-12 text-center text-sm text-slate-500">
                Type at least 2 characters to search across the platform...
              </div>
            ) : !loading && !hasResults ? (
              <div className="p-16 text-center">
                <Search className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600 font-medium text-lg">No results found.</p>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your search terms.</p>
              </div>
            ) : (
              <div className="p-3 space-y-4">
                
                {/* CATEGORIES */}
                {results.categories.length > 0 && (
                  <div>
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Categories
                    </div>
                    <div className="space-y-1">
                      {results.categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleSelect(context === 'dashboard' ? `/dashboard/categories` : `/store?category=${cat.id}`)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 text-left transition-colors group"
                        >
                          <div className="h-8 w-8 rounded bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <Folder className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex-1 truncate">
                            <div className="text-sm font-medium text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                              {cat.name}
                            </div>
                            {cat.description && (
                              <div className="text-xs text-slate-500 truncate line-clamp-1">{cat.description}</div>
                            )}
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* USERS (Dashboard only) */}
                {results.users.length > 0 && (
                  <div>
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Users
                    </div>
                    <div className="space-y-1">
                      {results.users.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleSelect(`/dashboard/users/${user.id}`)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 text-left transition-colors group"
                        >
                          <div className="h-8 w-8 rounded bg-teal-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {user.avatar ? (
                              <img src={user.avatar} className="h-full w-full object-cover" alt="" />
                            ) : (
                              <User className="h-4 w-4 text-teal-600" />
                            )}
                          </div>
                          <div className="flex-1 truncate">
                            <div className="text-sm font-medium text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                              {user.name} <span className="text-xs font-normal text-slate-400 ml-2">({user.role})</span>
                            </div>
                            <div className="text-xs text-slate-500 truncate">{user.email}</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ORDERS (Dashboard only) */}
                {results.orders.length > 0 && (
                  <div>
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Orders
                    </div>
                    <div className="space-y-1">
                      {results.orders.map((order) => (
                        <button
                          key={order.id}
                          onClick={() => handleSelect(`/dashboard/orders/${order.id}`)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 text-left transition-colors group"
                        >
                          <div className="h-8 w-8 rounded bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <CreditCard className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="flex-1 truncate">
                            <div className="text-sm font-medium text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                              Order #{order.id.slice(-6).toUpperCase()}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {order.user?.name ? `Placed by ${order.user.name}` : formatDate(order.createdAt)}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-sm font-semibold text-slate-900">
                              {formatCurrency(Number(order.total) || 0)}
                            </div>
                            <div className="text-[10px] uppercase font-bold text-slate-500">
                              {order.status}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* PRODUCTS */}
                {results.products.length > 0 && (
                  <div>
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Store Products
                    </div>
                    <div className="space-y-1">
                      {results.products.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleSelect(context === 'dashboard' ? `/dashboard/products/${product.id}/edit` : `/store/product/${product.id}`)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 text-left transition-colors group"
                        >
                          <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Package className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 truncate">
                            <div className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                              {product.name}
                            </div>
                            {product.category && (
                              <div className="text-xs text-slate-500 truncate">{product.category.name}</div>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-slate-900">
                            {formatCurrency(product.price ? Number(product.price) : 0)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* PROJECTS */}
                {results.projects.length > 0 && (
                  <div>
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Tutorials & Projects
                    </div>
                    <div className="space-y-1">
                      {results.projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleSelect(context === 'dashboard' ? `/dashboard/projects/${project.id}/edit` : `/projects/${project.slug}`)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 text-left transition-colors group"
                        >
                          <div className="h-8 w-8 rounded bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1 truncate">
                            <div className="text-sm font-medium text-slate-900 truncate group-hover:text-purple-600 transition-colors">
                              {project.title}
                            </div>
                            <div className="text-xs text-slate-500 truncate line-clamp-1">
                              {project.excerpt || "Read this tutorial..."}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="bg-slate-50 px-4 py-2 text-xs text-slate-500 border-t flex items-center justify-between">
            <span>Press <kbd className="font-mono bg-slate-200 px-1 rounded text-slate-700">Esc</kbd> to close</span>
            <span>Search powered by FideVoltz</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
