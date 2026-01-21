"use client";

import { useState } from "react";
import { Search, Grid3x3, List, Check, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type MediaItem = {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
};

type MediaPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  type?: "image" | "video" | "all";
  title?: string;
};

export function MediaPicker({ 
  open, 
  onOpenChange, 
  onSelect, 
  type = "all",
  title = "Select Media"
}: MediaPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Mock media library data
  const mediaLibrary: MediaItem[] = [
    {
      id: "1",
      name: "arduino-uno.jpg",
      url: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800",
      type: "image"
    },
    {
      id: "2",
      name: "esp32-devkit.jpg",
      url: "https://images.unsplash.com/photo-1608538776654-2e45f9583347?w=800",
      type: "image"
    },
    {
      id: "3",
      name: "circuit-diagram.png",
      url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800",
      type: "image"
    },
    {
      id: "4",
      name: "raspberry-pi.jpg",
      url: "https://images.unsplash.com/photo-1629739884942-8678d13afdd6?w=800",
      type: "image"
    },
  ];

  const filteredMedia = mediaLibrary.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = type === "all" || item.type === type;
    return matchesSearch && matchesType;
  });

  const handleSelect = () => {
    const selected = mediaLibrary.find(m => m.id === selectedId);
    if (selected) {
      onSelect(selected.url);
      onOpenChange(false);
      setSelectedId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Choose from your media library or upload new files
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="library" className="space-y-4">
          <TabsList>
            <TabsTrigger value="library">Media Library</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search media..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-1 border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredMedia.map((item) => (
                    <div
                      key={item.id}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        selectedId === item.id
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "border-transparent hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      {selectedId === item.id && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground rounded-full p-2">
                            <Check className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMedia.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedId === item.id
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:border-primary/50 hover:bg-slate-50"
                      }`}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <Badge variant="secondary" className="text-xs capitalize">{item.type}</Badge>
                      </div>
                      {selectedId === item.id && (
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-slate-50 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports: JPG, PNG, GIF, MP4, WebM (Max 10MB)
              </p>
              <Button>Choose Files</Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedId}>
            Select Media
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
