"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Link as LinkIcon, ExternalLink, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface ProductLinkPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ProductLinkPicker({ value, onChange, placeholder = "Product Link (URL)" }: ProductLinkPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      return;
    }

    const searchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(debouncedQuery)}&limit=5`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data);
        }
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setIsLoading(false);
      }
    };

    searchProducts();
  }, [debouncedQuery, open]);

  const handleSelect = (product: any) => {
    // Generate the store link for this product
    const url = `/store/product/${product.slug || product.id}`;
    onChange(url);
    setOpen(false);
  };

  return (
    <div className="relative flex items-center w-full">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 h-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="Search Store Products"
          >
            <Search className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="end">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search store products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    className="w-full text-left px-2 py-2 text-sm hover:bg-slate-100 rounded-md flex items-start gap-2 transition-colors"
                  >
                    <div className="mt-0.5 p-1 bg-blue-100 rounded text-blue-600 shrink-0">
                      <Package className="h-3 w-3" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground truncate flex items-center mt-1">
                        <LinkIcon className="h-3 w-3 mr-1 inline" />
                        /store/product/{product.slug || product.id}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.length > 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No products found
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Type to search products
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {value && value.startsWith('/') && (
        <a 
          href={value} 
          target="_blank" 
          rel="noreferrer"
          title="Test Link"
          className="absolute right-10 h-full flex items-center justify-center w-10 text-slate-400 hover:text-slate-600"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
