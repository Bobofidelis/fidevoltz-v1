"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings2, X, Tag, Globe, Eye, EyeOff, Star, Loader2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarSettingsData {
  status?: string;
  featured?: boolean;
  published?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  category?: string;
  slug?: string;
  visibility?: "public" | "private" | "unlisted";
  customFields?: { key: string; value: string }[];
}

interface SidebarSettingsProps {
  /** Data to pre-populate the form */
  data?: SidebarSettingsData;
  /** Callback when user saves */
  onSave?: (data: SidebarSettingsData) => Promise<void> | void;
  /** Available status options */
  statusOptions?: { value: string; label: string }[];
  /** Available categories */
  categories?: { value: string; label: string }[];
  /** Show the trigger button inline — set false if you control open state yourself */
  showTrigger?: boolean;
  /** Externally controlled open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Label shown on trigger button */
  triggerLabel?: string;
  /** Extra className on trigger */
  triggerClassName?: string;
}

const DEFAULT_STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

export function SidebarSettings({
  data = {},
  onSave,
  statusOptions = DEFAULT_STATUS_OPTIONS,
  categories = [],
  showTrigger = true,
  open: controlledOpen,
  onOpenChange,
  triggerLabel = "Settings",
  triggerClassName = "",
}: SidebarSettingsProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const [form, setForm] = useState<SidebarSettingsData>({
    status: "DRAFT",
    featured: false,
    published: false,
    seoTitle: "",
    seoDescription: "",
    tags: [],
    category: "",
    slug: "",
    visibility: "public",
    ...data,
  });

  const set = (key: keyof SidebarSettingsData, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!form.tags?.includes(t)) {
      set("tags", [...(form.tags || []), t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    set("tags", (form.tags || []).filter(t => t !== tag));

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(form);
      setIsOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const statusColor: Record<string, string> = {
    PUBLISHED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    DRAFT: "bg-amber-100 text-amber-700 border-amber-200",
    ARCHIVED: "bg-slate-100 text-slate-600 border-slate-200",
    ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <>
      {showTrigger && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className={cn("gap-2", triggerClassName)}
        >
          <Settings2 className="h-4 w-4" />
          {triggerLabel}
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        </Button>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[420px] overflow-y-auto p-0">
          <div className="sticky top-0 bg-white border-b z-10">
            <SheetHeader className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Settings2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-base">Page Settings</SheetTitle>
                  <SheetDescription className="text-xs">Configure SEO, visibility & metadata</SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <div className="px-6 py-5 space-y-6">

            {/* Status & Visibility */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status & Visibility</h3>

              <div className="space-y-1">
                <Label className="text-sm">Status</Label>
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(o => (
                      <SelectItem key={o.value} value={o.value}>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor[o.value] || "bg-slate-100 text-slate-600"}`}>
                          {o.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Visibility</Label>
                <Select value={form.visibility} onValueChange={v => set("visibility", v as any)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public"><div className="flex items-center gap-2"><Eye className="h-3.5 w-3.5" />Public</div></SelectItem>
                    <SelectItem value="unlisted"><div className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" />Unlisted</div></SelectItem>
                    <SelectItem value="private"><div className="flex items-center gap-2"><EyeOff className="h-3.5 w-3.5" />Private</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Featured</p>
                    <p className="text-xs text-slate-400">Show in featured sections</p>
                  </div>
                </div>
                <Switch checked={!!form.featured} onCheckedChange={v => set("featured", v)} />
              </div>
            </section>

            <Separator />

            {/* Slug */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">URL & Slug</h3>
              <div className="space-y-1">
                <Label className="text-sm">Slug</Label>
                <div className="flex items-center rounded-md border overflow-hidden">
                  <span className="px-3 py-2 bg-slate-50 text-slate-400 text-sm border-r">/</span>
                  <Input
                    value={form.slug || ""}
                    onChange={e => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
                    className="border-0 focus-visible:ring-0 h-9 rounded-none"
                    placeholder="my-page-slug"
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* Category & Tags */}
            {categories.length > 0 && (
              <>
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</h3>
                  <Select value={form.category || ""} onValueChange={v => set("category", v)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No category</SelectItem>
                      {categories.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </section>
                <Separator />
              </>
            )}

            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" />Tags
              </h3>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Add tag, press Enter"
                  className="h-9 flex-1"
                />
                <Button type="button" size="sm" variant="outline" onClick={addTag} className="shrink-0">Add</Button>
              </div>
              {(form.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.tags!.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1 text-xs pl-2 pr-1 py-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors rounded">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </section>

            <Separator />

            {/* SEO */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" />SEO Metadata
              </h3>
              <div className="space-y-1">
                <Label className="text-sm">SEO Title</Label>
                <Input
                  value={form.seoTitle || ""}
                  onChange={e => set("seoTitle", e.target.value)}
                  placeholder="Overrides page title in search results"
                  className="h-9"
                  maxLength={60}
                />
                <p className="text-xs text-slate-400">{(form.seoTitle || "").length}/60 characters</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">SEO Description</Label>
                <Textarea
                  value={form.seoDescription || ""}
                  onChange={e => set("seoDescription", e.target.value)}
                  placeholder="Shown in search engine result snippets"
                  className="resize-none text-sm"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-slate-400">{(form.seoDescription || "").length}/160 characters</p>
              </div>

              {/* SERP Preview */}
              {(form.seoTitle || form.seoDescription) && (
                <div className="p-3 border rounded-lg bg-white space-y-0.5">
                  <p className="text-xs text-slate-400 mb-1">Search preview</p>
                  <p className="text-sm text-blue-700 font-medium truncate">{form.seoTitle || "(No title set)"}</p>
                  <p className="text-xs text-emerald-700">fidevoltz.vercel.app/{form.slug || ""}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{form.seoDescription || "(No description set)"}</p>
                </div>
              )}
            </section>
          </div>

          <SheetFooter className="sticky bottom-0 bg-white border-t px-6 py-4">
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !onSave} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
