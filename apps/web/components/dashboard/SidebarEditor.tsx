"use client";

import { useState, useRef, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  PencilLine, Plus, Trash2, GripVertical, FileText, Code2,
  Image as ImageIcon, AlertCircle, ChevronRight, Loader2,
  Bold, Italic, Underline, List, Heading2, Quote, Minus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";

type KnownBlockType = "text" | "markdown" | "code" | "heading" | "image" | "alert" | "sidebar_settings" | "toc" | "latest_posts" | "featured_posts" | "categories" | "ad";
type BlockType = KnownBlockType | (string & {});

export interface Block {
  id: string;
  type: BlockType;
  content: any;
}

interface SidebarEditorProps {
  /** Initial blocks to edit */
  blocks?: Block[];
  /** Called when user saves with the updated blocks */
  onSave?: (blocks: Block[]) => Promise<void> | void;
  /** Show built-in trigger button */
  showTrigger?: boolean;
  /** Trigger label */
  triggerLabel?: string;
  /** Controlled open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Extra className on trigger button */
  triggerClassName?: string;
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: any; desc: string; color: string }[] = [
  { type: "text", label: "Rich Text", icon: FileText, desc: "Formatted text with headings, lists, links", color: "text-blue-600 bg-blue-50" },
  { type: "markdown", label: "Markdown", icon: Code2, desc: "Markdown with code blocks", color: "text-purple-600 bg-purple-50" },
  { type: "heading", label: "Heading", icon: Heading2, desc: "H2, H3, H4 section heading", color: "text-slate-700 bg-slate-100" },
  { type: "alert", label: "Alert Box", icon: AlertCircle, desc: "Info, warning, tip or danger callout", color: "text-amber-600 bg-amber-50" },
  { type: "code", label: "Code Block", icon: Code2, desc: "Syntax-highlighted code snippet", color: "text-emerald-600 bg-emerald-50" },
  { type: "image", label: "Image", icon: ImageIcon, desc: "Single image or gallery", color: "text-pink-600 bg-pink-50" },
  { type: "sidebar_settings", label: "Sidebar Settings", icon: GripVertical, desc: "Configure if sidebar floats", color: "text-slate-600 bg-slate-100" },
  { type: "toc", label: "Table of Contents", icon: List, desc: "Auto-generated clickable TOC", color: "text-indigo-600 bg-indigo-50" },
  { type: "latest_posts", label: "Latest Posts", icon: FileText, desc: "Recent articles list", color: "text-blue-600 bg-blue-50" },
  { type: "featured_posts", label: "Featured Posts", icon: FileText, desc: "Hand-picked articles", color: "text-orange-600 bg-orange-50" },
  { type: "categories", label: "Categories", icon: FileText, desc: "List of categories", color: "text-teal-600 bg-teal-50" },
  { type: "ad", label: "Ad Slot", icon: Plus, desc: "Monetization ad placement", color: "text-red-600 bg-red-50" },
];

function defaultContent(type: BlockType): any {
  switch (type) {
    case "text": return "<p>Enter your text here...</p>";
    case "markdown": return "## Heading\n\nEnter **markdown** content here.";
    case "code": return { language: "cpp", code: "// Your code here" };
    case "heading": return { level: "h2", text: "New Heading" };
    case "image": return { urls: [], alt: "", size: "default", layout: "single" };
    case "alert": return { type: "info", title: "Note", text: "Add your callout text here." };
    case "sidebar_settings": return { sticky: true };
    case "toc": return { title: "Table of Contents" };
    case "latest_posts": return { title: "Latest Posts", count: 3 };
    case "featured_posts": return { title: "Featured Posts", slugs: "" };
    case "categories": return { title: "Categories" };
    case "ad": return { zone: "SIDEBAR_RIGHT" };
    default: return "";
  }
}

function BlockIcon({ type }: { type: BlockType }) {
  const item = BLOCK_TYPES.find(b => b.type === type);
  const Icon = item?.icon || FileText;
  return (
    <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${item?.color || "bg-slate-100 text-slate-600"}`}>
      <Icon className="h-3.5 w-3.5" />
    </div>
  );
}

function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  const set = (content: any) => onChange({ ...block, content });

  switch (block.type) {
    case "text":
    case "markdown":
      return (
        <Textarea
          value={typeof block.content === "string" ? block.content : JSON.stringify(block.content)}
          onChange={e => set(e.target.value)}
          className="font-mono text-sm resize-none min-h-[180px]"
          placeholder={block.type === "markdown" ? "Enter Markdown..." : "Enter HTML or rich text..."}
        />
      );

    case "heading":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Level</Label>
            <Select value={block.content.level || "h2"} onValueChange={v => set({ ...block.content, level: v })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="h2">H2 — Section</SelectItem>
                <SelectItem value="h3">H3 — Subsection</SelectItem>
                <SelectItem value="h4">H4 — Minor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Text</Label>
            <Input value={block.content.text || ""} onChange={e => set({ ...block.content, text: e.target.value })} className="h-9" placeholder="Heading text" />
          </div>
        </div>
      );

    case "code":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Language</Label>
            <Select value={block.content.language || "cpp"} onValueChange={v => set({ ...block.content, language: v })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["cpp", "c", "python", "javascript", "typescript", "bash", "json", "html", "css", "rust", "arduino"].map(l => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Code</Label>
            <Textarea
              value={block.content.code || ""}
              onChange={e => set({ ...block.content, code: e.target.value })}
              className="font-mono text-xs resize-none min-h-[160px] bg-slate-900 text-slate-100 border-slate-700"
              placeholder="// paste your code here"
            />
          </div>
        </div>
      );

    case "alert":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Alert Type</Label>
            <Select value={block.content.type || "info"} onValueChange={v => set({ ...block.content, type: v })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="info">ℹ️ Info</SelectItem>
                <SelectItem value="warning">⚠️ Warning</SelectItem>
                <SelectItem value="tip">💡 Tip</SelectItem>
                <SelectItem value="danger">🚨 Danger</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Title (optional)</Label>
            <Input value={block.content.title || ""} onChange={e => set({ ...block.content, title: e.target.value })} className="h-9" placeholder="Alert title" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Message</Label>
            <Textarea value={block.content.text || ""} onChange={e => set({ ...block.content, text: e.target.value })} className="resize-none min-h-[100px] text-sm" placeholder="Alert message..." />
          </div>
        </div>
      );

    case "image":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Image URL(s)</Label>
            <Textarea
              value={(block.content.urls || []).join("\n")}
              onChange={e => set({ ...block.content, urls: e.target.value.split("\n").filter(Boolean) })}
              className="resize-none text-sm min-h-[80px] font-mono text-xs"
              placeholder="One URL per line"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Alt Text / Caption</Label>
            <Input value={block.content.alt || ""} onChange={e => set({ ...block.content, alt: e.target.value })} className="h-9" placeholder="Image description" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Size</Label>
              <Select value={block.content.size || "default"} onValueChange={v => set({ ...block.content, size: v })}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["xs", "small", "default", "large", "xl", "full"].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Layout</Label>
              <Select value={block.content.layout || "single"} onValueChange={v => set({ ...block.content, layout: v })}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="masonry">Masonry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );

    case "sidebar_settings":
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold">Floating Sidebar</Label>
              <p className="text-xs text-slate-500">Make the sidebar sticky while scrolling</p>
            </div>
            <input 
              type="checkbox" 
              className="h-4 w-4"
              checked={block.content.sticky} 
              onChange={e => set({ ...block.content, sticky: e.target.checked })} 
            />
          </div>
        </div>
      );

    case "toc":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input value={block.content.title || ""} onChange={e => set({ ...block.content, title: e.target.value })} className="h-9" placeholder="Table of Contents" />
          </div>
        </div>
      );

    case "latest_posts":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input value={block.content.title || ""} onChange={e => set({ ...block.content, title: e.target.value })} className="h-9" placeholder="Latest Posts" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Number of Posts</Label>
            <Input type="number" min="1" max="10" value={block.content.count || 3} onChange={e => set({ ...block.content, count: parseInt(e.target.value) || 3 })} className="h-9" />
          </div>
        </div>
      );

    case "featured_posts":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input value={block.content.title || ""} onChange={e => set({ ...block.content, title: e.target.value })} className="h-9" placeholder="Featured Posts" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Project Slugs (comma separated)</Label>
            <Textarea value={block.content.slugs || ""} onChange={e => set({ ...block.content, slugs: e.target.value })} className="text-xs min-h-[60px]" placeholder="project-1, project-2" />
          </div>
        </div>
      );

    case "categories":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input value={block.content.title || ""} onChange={e => set({ ...block.content, title: e.target.value })} className="h-9" placeholder="Categories" />
          </div>
        </div>
      );

    case "ad":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Ad Zone</Label>
            <Select value={block.content.zone || "SIDEBAR_RIGHT"} onValueChange={v => set({ ...block.content, zone: v })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SIDEBAR_RIGHT">Sidebar Right</SelectItem>
                <SelectItem value="CONTENT_TOP">Content Top</SelectItem>
                <SelectItem value="CONTENT_BOTTOM">Content Bottom</SelectItem>
                <SelectItem value="CONTENT_MIDDLE">Content Middle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    default:
      return <p className="text-sm text-slate-400">Unsupported block type: {block.type}</p>;
  }
}

export function SidebarEditor({
  blocks: initialBlocks = [],
  onSave,
  showTrigger = true,
  triggerLabel = "Edit Content",
  open: controlledOpen,
  onOpenChange,
  triggerClassName = "",
}: SidebarEditorProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  const [blocks, setBlocks] = useState<Block[]>(initialBlocks.map(b => ({ ...b })));
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"blocks" | "add">("blocks");

  const selectedBlock = blocks.find(b => b.id === selected);

  const addBlock = (type: BlockType) => {
    const newBlock: Block = { id: nanoid(), type, content: defaultContent(type) };
    setBlocks(prev => [...prev, newBlock]);
    setSelected(newBlock.id);
    setTab("blocks");
  };

  const updateBlock = (updated: Block) =>
    setBlocks(prev => prev.map(b => (b.id === updated.id ? updated : b)));

  const removeBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selected === id) setSelected(null);
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(blocks);
      setIsOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {showTrigger && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className={cn("gap-2", triggerClassName)}
        >
          <PencilLine className="h-4 w-4" />
          {triggerLabel}
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        </Button>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[520px] p-0 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b bg-white sticky top-0 z-10">
            <SheetHeader className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <PencilLine className="h-4 w-4 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-base">Content Editor</SheetTitle>
                  <SheetDescription className="text-xs">{blocks.length} block{blocks.length !== 1 ? "s" : ""} · click a block to edit</SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left: block list */}
            <div className="w-52 border-r bg-slate-50 overflow-y-auto flex flex-col shrink-0">
              <div className="p-2 space-y-1 flex-1">
                {blocks.length === 0 && (
                  <div className="text-center py-8 px-3">
                    <FileText className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs text-slate-400">No blocks yet.<br />Add one to start.</p>
                  </div>
                )}
                {blocks.map((block, i) => {
                  const meta = BLOCK_TYPES.find(b => b.type === block.type);
                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelected(block.id)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg cursor-pointer group transition-colors",
                        selected === block.id
                          ? "bg-white border border-blue-200 shadow-sm"
                          : "hover:bg-white hover:shadow-sm border border-transparent"
                      )}
                    >
                      <BlockIcon type={block.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">{meta?.label || block.type}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {typeof block.content === "string"
                            ? block.content.replace(/<[^>]+>/g, "").slice(0, 30)
                            : block.content?.text?.slice(0, 30) || block.content?.code?.slice(0, 20) || ""}
                        </p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); removeBlock(block.id); }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="p-2 border-t">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full gap-2 h-8 text-xs"
                  onClick={() => setTab("add")}
                >
                  <Plus className="h-3.5 w-3.5" />Add Block
                </Button>
              </div>
            </div>

            {/* Right: editor pane */}
            <div className="flex-1 overflow-y-auto">
              {tab === "add" ? (
                <div className="p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Choose Block Type</p>
                  {BLOCK_TYPES.map(({ type, label, icon: Icon, desc, color }) => (
                    <button
                      key={type}
                      onClick={() => addBlock(type)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-left transition-all group"
                    >
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{label}</p>
                        <p className="text-xs text-slate-400">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : selectedBlock ? (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BlockIcon type={selectedBlock.type} />
                      <p className="text-sm font-semibold text-slate-700">
                        {BLOCK_TYPES.find(b => b.type === selectedBlock.type)?.label || selectedBlock.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveBlock(selectedBlock.id, -1)} title="Move up">↑</Button>
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveBlock(selectedBlock.id, 1)} title="Move down">↓</Button>
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => removeBlock(selectedBlock.id)} title="Remove">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <BlockEditor block={selectedBlock} onChange={updateBlock} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <PencilLine className="h-10 w-10 text-slate-200 mb-3" />
                  <p className="text-sm font-medium text-slate-500">Select a block to edit</p>
                  <p className="text-xs text-slate-400 mt-1">Or add a new block using the button below the list</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <SheetFooter className="border-t bg-white px-5 py-4 sticky bottom-0">
            <div className="flex gap-2 w-full">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">Cancel</Button>
              <Button type="button" onClick={handleSave} disabled={saving || !onSave} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {saving ? "Saving..." : `Save ${blocks.length} Block${blocks.length !== 1 ? "s" : ""}`}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
