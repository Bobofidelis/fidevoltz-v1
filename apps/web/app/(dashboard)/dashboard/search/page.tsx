"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, FileText, User, ShoppingCart } from "lucide-react";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query);
  };

  // Mock search results
  const results = searchQuery ? [
    {
      id: "1",
      type: "product",
      title: "Arduino Uno R3",
      description: "Microcontroller board based on the ATmega328P",
      category: "Products",
      icon: Package,
    },
    {
      id: "2",
      type: "project",
      title: "LED Blink Tutorial",
      description: "Learn how to blink an LED with Arduino",
      category: "Projects",
      icon: FileText,
    },
    {
      id: "3",
      type: "user",
      title: "John Doe",
      description: "john@example.com",
      category: "Users",
      icon: User,
    },
    {
      id: "4",
      type: "order",
      title: "Order #TRK-2024-001",
      description: "Completed - $125.50",
      category: "Orders",
      icon: ShoppingCart,
    },
  ].filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Search</h2>
        <p className="text-muted-foreground">Search across products, projects, users, and orders</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for anything..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {results.length} result{results.length !== 1 ? 's' : ''} for "{searchQuery}"
            </h3>
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or browse the dashboard
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {results.map((result) => {
                const Icon = result.icon;
                return (
                  <Card key={result.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-slate-100">
                          <Icon className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{result.title}</h4>
                            <Badge variant="secondary">{result.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{result.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!searchQuery && (
        <Card>
          <CardContent className="py-16 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Start searching</h3>
            <p className="text-muted-foreground">
              Enter a search term to find products, projects, users, and more
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
