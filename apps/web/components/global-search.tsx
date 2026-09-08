"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Search, Loader2, Package, ArrowRight, BookOpen, Folder,
  User, CreditCard, LifeBuoy, FileText, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

interface SearchResults {
  products: any[];
  projects: any[];
  categories: any[];
  users: any[];
  orders: any[];
  pages: any[];
  tickets: any[];
}

const EMPTY: SearchResults = {
  products: [], projects: [], categories: [],
  users: [], orders: [], pages: [], tickets: [],
};

function ResultSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest mb-1 ${color}`}>
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function ResultRow({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  right,
  onClick,
}: {
  icon: any;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left transition-colors group border border-transparent hover:border-slate-200"
    >
      <div className={`h-8 w-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-900 truncate group-hover:text-slate-700">{title}</div>
        {subtitle && <div className="text-xs text-slate-400 truncate">{subtitle}</div>}
      </div>
      {right ? (
        <div className="shrink-0 text-right">{right}</div>
      ) : (
        <ArrowRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      )}
    </button>
  );
}

export function GlobalSearch({
  triggerClassName = "",
  variant = "outline",
  context = "frontend",
}: {
  triggerClassName?: string;
  variant?: any;
  context?: "frontend" | "dashboard";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!open) { setQuery(""); setResults(EMPTY); }
  }, [open]);

  useEffect(() => {
    if (query.length < 2) { setResults(EMPTY); setLoading(false); return; }
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
            pages: data.data.pages || [],
            tickets: data.data.tickets || [],
          });
        }
      } catch (e) {
        console.error("Search failed:", e);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, context]);

  const go = (url: string) => { setOpen(false); router.push(url); };

  const totalResults = Object.values(results).reduce((a, v) => a + v.length, 0);
  const hasResults = totalResults > 0;

  return (
    <>
      <Button
        variant={variant}
        className={cn(
          "relative h-9 w-9 p-0 xl:h-10 xl:w-64 xl:justify-start xl:px-3 xl:py-2 text-slate-500 font-medium hover:text-slate-900 border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-all rounded-lg",
          triggerClassName
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2 shrink-0" />
        <span className="hidden xl:inline-flex text-sm">
          {context === "dashboard" ? "Search dashboard..." : "Search..."}
        </span>
        <kbd className="pointer-events-none absolute right-2 top-2 hidden h-6 select-none items-center gap-0.5 rounded-md border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-500 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[680px] p-0 overflow-hidden gap-0 rounded-2xl shadow-2xl border-0">
          <div className="sr-only">
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>Search the platform</DialogDescription>
          </div>

          {/* Input bar */}
          <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100 bg-white">
            <Search className="h-5 w-5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder={context === "dashboard" ? "Search users, orders, products, tickets..." : "Search products, tutorials, categories..."}
              className="flex-1 bg-transparent border-none outline-none text-lg font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {loading && <Loader2 className="h-5 w-5 animate-spin text-slate-400 shrink-0" />}
            {query && !loading && (
              <button
                onClick={() => setQuery("")}
                className="text-xs text-slate-400 hover:text-slate-600 shrink-0 px-2 py-1 rounded border border-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[65vh] overflow-y-auto bg-white">
            {!query ? (
              <div className="py-16 text-center">
                <Search className="h-8 w-8 mx-auto text-slate-200 mb-3" />
                <p className="text-sm font-medium text-slate-400">Start typing to search...</p>
                <p className="text-xs text-slate-300 mt-1">
                  {context === "dashboard"
                    ? "Search users, orders, products, projects, pages & tickets"
                    : "Search products by name, tags, tutorials & categories"}
                </p>
              </div>
            ) : !loading && !hasResults ? (
              <div className="py-16 text-center">
                <Search className="h-8 w-8 mx-auto text-slate-200 mb-3" />
                <p className="text-sm font-medium text-slate-500">No results for <span className="text-slate-700">"{query}"</span></p>
                <p className="text-xs text-slate-400 mt-1">Try a different keyword or check the spelling</p>
              </div>
            ) : (
              <div className="p-3 space-y-3">

                {/* CATEGORIES */}
                {results.categories.length > 0 && (
                  <ResultSection title="Categories" color="text-orange-500">
                    {results.categories.map((cat) => (
                      <ResultRow
                        key={cat.id}
                        icon={Folder}
                        iconBg="bg-orange-50"
                        iconColor="text-orange-500"
                        title={cat.name}
                        subtitle={`Browse all ${cat.name} products`}
                        onClick={() => go(`/store?category=${cat.id}`)}
                      />
                    ))}
                  </ResultSection>
                )}

                {/* USERS (admin dashboard) */}
                {results.users.length > 0 && (
                  <ResultSection title="Users" color="text-teal-600">
                    {results.users.map((u) => (
                      <ResultRow
                        key={u.id}
                        icon={User}
                        iconBg="bg-teal-50"
                        iconColor="text-teal-600"
                        title={u.name || u.email}
                        subtitle={`${u.email} · ${u.role}`}
                        onClick={() => go(`/dashboard/users/${u.id}`)}
                      />
                    ))}
                  </ResultSection>
                )}

                {/* ORDERS */}
                {results.orders.length > 0 && (
                  <ResultSection title="Orders" color="text-emerald-600">
                    {results.orders.map((order) => (
                      <ResultRow
                        key={order.id}
                        icon={CreditCard}
                        iconBg="bg-emerald-50"
                        iconColor="text-emerald-600"
                        title={`Order #${order.id.slice(-8).toUpperCase()}`}
                        subtitle={order.user?.name ? `By ${order.user.name} · ${order.status}` : `${formatDate(order.createdAt)} · ${order.status}`}
                        right={
                          <div className="text-sm font-bold text-slate-800">
                            {formatCurrency(Number(order.totalAmount) || 0)}
                          </div>
                        }
                        onClick={() => go(`/dashboard/orders/${order.id}`)}
                      />
                    ))}
                  </ResultSection>
                )}

                {/* PRODUCTS */}
                {results.products.length > 0 && (
                  <ResultSection title="Store Products" color="text-blue-600">
                    {results.products.map((product) => (
                      <ResultRow
                        key={product.id}
                        icon={Package}
                        iconBg="bg-blue-50"
                        iconColor="text-blue-600"
                        title={product.name}
                        subtitle={product.category?.name || product.status || ""}
                        right={
                          product.price != null ? (
                            <span className="text-sm font-bold text-slate-800">
                              {formatCurrency(Number(product.price))}
                            </span>
                          ) : undefined
                        }
                        onClick={() => go(context === "dashboard" ? `/dashboard/products/${product.id}/edit` : `/store/product/${product.id}`)}
                      />
                    ))}
                  </ResultSection>
                )}

                {/* PROJECTS / TUTORIALS */}
                {results.projects.length > 0 && (
                  <ResultSection title="Tutorials & Projects" color="text-purple-600">
                    {results.projects.map((project) => (
                      <ResultRow
                        key={project.id}
                        icon={BookOpen}
                        iconBg="bg-purple-50"
                        iconColor="text-purple-600"
                        title={project.title}
                        subtitle={project.category ? `${project.category} · ${project.status || ""}` : (project.excerpt || "Tutorial")}
                        onClick={() => go(context === "dashboard" ? `/dashboard/projects/${project.id}/edit` : `/projects/${project.slug}`)}
                      />
                    ))}
                  </ResultSection>
                )}

                {/* PAGES (admin dashboard) */}
                {results.pages.length > 0 && (
                  <ResultSection title="Pages" color="text-slate-600">
                    {results.pages.map((page) => (
                      <ResultRow
                        key={page.id}
                        icon={FileText}
                        iconBg="bg-slate-100"
                        iconColor="text-slate-600"
                        title={page.title}
                        subtitle={`/${page.slug}`}
                        onClick={() => go(`/dashboard/pages/${page.id}`)}
                      />
                    ))}
                  </ResultSection>
                )}

                {/* SUPPORT TICKETS */}
                {results.tickets.length > 0 && (
                  <ResultSection title="Support Tickets" color="text-rose-600">
                    {results.tickets.map((ticket) => (
                      <ResultRow
                        key={ticket.id}
                        icon={LifeBuoy}
                        iconBg="bg-rose-50"
                        iconColor="text-rose-600"
                        title={ticket.subject}
                        subtitle={`${ticket.status} · ${ticket.priority} priority`}
                        onClick={() => go(`/dashboard/support?ticket=${ticket.id}`)}
                      />
                    ))}
                  </ResultSection>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span><kbd className="font-mono bg-white border border-slate-200 rounded px-1">↵</kbd> to open</span>
              <span><kbd className="font-mono bg-white border border-slate-200 rounded px-1">Esc</kbd> to close</span>
            </div>
            {hasResults && <span>{totalResults} result{totalResults !== 1 ? "s" : ""}</span>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
