"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface Placement {
  page: string;
  zone: string;
  isActive: boolean;
}

interface PlacementManagerProps {
  placements: Placement[];
  setPlacements: (placements: Placement[]) => void;
}

const AVAILABLE_PAGES = [
  { value: "home", label: "Home Page" },
  { value: "store", label: "Store" },
  { value: "products", label: "Products" },
  { value: "projects", label: "Projects" },
  { value: "contact", label: "Contact" },
  { value: "about", label: "About" },
  { value: "all", label: "All Pages" },
];

const AVAILABLE_ZONES = [
  { value: "HEADER", label: "Header" },
  { value: "SIDEBAR_LEFT", label: "Sidebar Left" },
  { value: "SIDEBAR_RIGHT", label: "Sidebar Right" },
  { value: "CONTENT_TOP", label: "Content Top" },
  { value: "CONTENT_MIDDLE", label: "Content Middle" },
  { value: "CONTENT_BOTTOM", label: "Content Bottom" },
  { value: "FOOTER", label: "Footer" },
  { value: "POPUP", label: "Popup" },
];

export function PlacementManager({ placements, setPlacements }: PlacementManagerProps) {
  const [selectedPage, setSelectedPage] = useState("home");
  const [selectedZone, setSelectedZone] = useState("HEADER");

  const addPlacement = () => {
    const exists = placements.some(
      (p) => p.page === selectedPage && p.zone === selectedZone
    );

    if (exists) {
      return;
    }

    setPlacements([
      ...placements,
      { page: selectedPage, zone: selectedZone, isActive: true },
    ]);
  };

  const removePlacement = (index: number) => {
    setPlacements(placements.filter((_, i) => i !== index));
  };

  const togglePlacement = (index: number) => {
    setPlacements(
      placements.map((p, i) =>
        i === index ? { ...p, isActive: !p.isActive } : p
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label>Page</Label>
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_PAGES.map((page) => (
                <SelectItem key={page.value} value={page.value}>
                  {page.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label>Zone</Label>
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_ZONES.map((zone) => (
                <SelectItem key={zone.value} value={zone.value}>
                  {zone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="button" onClick={addPlacement} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {placements.length > 0 ? (
        <div className="space-y-2">
          <Label className="text-sm text-gray-600">
            Active Placements ({placements.length})
          </Label>
          <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
            {placements.map((placement, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={placement.isActive}
                    onChange={() => togglePlacement(index)}
                    className="rounded"
                  />
                  <div className="flex gap-2">
                    <Badge variant="outline" className="capitalize">
                      {AVAILABLE_PAGES.find((p) => p.value === placement.page)?.label || placement.page}
                    </Badge>
                    <Badge variant="secondary">
                      {AVAILABLE_ZONES.find((z) => z.value === placement.zone)?.label || placement.zone}
                    </Badge>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePlacement(index)}
                  className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500">
            No placements added yet. Add at least one placement to show your ad.
          </p>
        </div>
      )}
    </div>
  );
}
