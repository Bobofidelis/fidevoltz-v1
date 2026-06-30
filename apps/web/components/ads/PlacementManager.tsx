"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Info } from "lucide-react";

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
  { value: "all", label: "All Pages (Sitewide)" },
  { value: "home", label: "Home Page" },
  { value: "projects", label: "All Project Pages" },
  { value: "store", label: "Store / Shop" },
  { value: "about", label: "About Page" },
  { value: "contact", label: "Contact Page" },
  { value: "custom", label: "Custom URL Path..." },
];

const AVAILABLE_ZONES = [
  { value: "HEADER", label: "Header (Top of page)" },
  { value: "SIDEBAR_LEFT", label: "Sidebar Left" },
  { value: "SIDEBAR_RIGHT", label: "Sidebar Right" },
  { value: "CONTENT_TOP", label: "Content Top (Before body)" },
  { value: "CONTENT_MIDDLE", label: "Content Middle (In body)" },
  { value: "CONTENT_BOTTOM", label: "Content Bottom (After body)" },
  { value: "FOOTER", label: "Footer" },
  { value: "POPUP", label: "Popup / Overlay" },
];

export function PlacementManager({ placements, setPlacements }: PlacementManagerProps) {
  const [selectedPage, setSelectedPage] = useState("projects");
  const [selectedZone, setSelectedZone] = useState("CONTENT_MIDDLE");
  const [customPage, setCustomPage] = useState("");

  const getEffectivePage = () => {
    if (selectedPage === "custom") {
      return customPage.trim().replace(/^\//, ""); // Remove leading slash
    }
    return selectedPage;
  };

  const addPlacement = () => {
    const effectivePage = getEffectivePage();
    if (!effectivePage) return;

    const exists = placements.some(
      (p) => p.page === effectivePage && p.zone === selectedZone
    );

    if (exists) return;

    setPlacements([
      ...placements,
      { page: effectivePage, zone: selectedZone, isActive: true },
    ]);
    
    if (selectedPage === "custom") {
      setCustomPage("");
    }
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

  const getPageLabel = (pageValue: string) => {
    const known = AVAILABLE_PAGES.find(p => p.value === pageValue);
    return known ? known.label : pageValue;
  };

  const getZoneLabel = (zoneValue: string) => {
    const known = AVAILABLE_ZONES.find(z => z.value === zoneValue);
    return known ? known.label : zoneValue;
  };

  return (
    <div className="space-y-4">
      {/* Help text */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <strong>How placements work:</strong> Select which page and zone this ad should appear in.
          Choose <em>"All Project Pages"</em> to show this ad on every tutorial/project. 
          The zone determines where on the page it renders. 
          Your ad must be <strong>Active</strong> to display.
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label className="text-sm font-medium">Page</Label>
            <Select value={selectedPage} onValueChange={setSelectedPage}>
              <SelectTrigger className="mt-1">
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

          {selectedPage === "custom" && (
            <div>
              <Label className="text-sm font-medium">Custom URL Path</Label>
              <Input
                className="mt-1"
                placeholder="e.g. projects/my-specific-project"
                value={customPage}
                onChange={(e) => setCustomPage(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Enter the path without leading slash. e.g. <code>projects/vvvf-elevator</code></p>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Zone (Position on page)</Label>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="mt-1">
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
        </div>

        <Button
          type="button"
          onClick={addPlacement}
          className="w-full"
          variant="outline"
          disabled={selectedPage === "custom" && !customPage.trim()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add This Placement
        </Button>
      </div>

      {placements.length > 0 ? (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">
            Active Placements ({placements.length})
          </Label>
          <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
            {placements.map((placement, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  placement.isActive
                    ? "bg-white border-green-200"
                    : "bg-gray-100 border-gray-200 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={placement.isActive}
                    onChange={() => togglePlacement(index)}
                    className="rounded"
                  />
                  <div className="flex flex-wrap gap-1.5 min-w-0">
                    <Badge
                      variant="outline"
                      className="text-xs bg-blue-50 border-blue-200 text-blue-700"
                    >
                      {getPageLabel(placement.page)}
                    </Badge>
                    <span className="text-gray-400 text-xs self-center">→</span>
                    <Badge
                      variant="secondary"
                      className="text-xs"
                    >
                      {getZoneLabel(placement.zone)}
                    </Badge>
                    {!placement.isActive && (
                      <Badge variant="outline" className="text-xs text-gray-400">Paused</Badge>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePlacement(index)}
                  className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 flex-shrink-0 ml-2"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed rounded-lg bg-gray-50">
          <Plus className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No placements yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Add at least one placement above to show this ad.
          </p>
        </div>
      )}
    </div>
  );
}
