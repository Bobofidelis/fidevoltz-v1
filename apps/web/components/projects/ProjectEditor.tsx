"use client";


import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Type, 
  Image as ImageIcon, 
  Code, 
  Video, 
  ArrowUp, 
  ArrowDown, 
  X,
  FileText,
  Search,
  ShoppingCart,
  Package,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableBlockItem } from "./SortableBlockItem";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { MediaPicker } from "@/components/media/MediaPicker";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ProductLinkPicker } from "@/components/projects/product-link-picker";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

interface ProjectEditorProps {
  initialData?: any;
}


type BlockType = "text" | "markdown" | "image" | "video" | "youtube" | "code" | "heading" | "project_kit" | "bom" | "ad" | "alert" | "campaign_data";

interface Block {
  id: string;
  type: BlockType;
  content: any;
}

export function ProjectEditor({ initialData }: ProjectEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  
  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "Intermediate");
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || "");
  const [allowComments, setAllowComments] = useState(initialData?.allowComments ?? true);
  const [status, setStatus] = useState(initialData?.status || "DRAFT");

  // Blocks State
  const [blocks, setBlocks] = useState<Block[]>(
    Array.isArray(initialData?.content) ? initialData.content : []
  );

  // Components State
  const [components, setComponents] = useState<any[]>(initialData?.components || []);
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Attachments State
  const [attachments, setAttachments] = useState<any[]>(initialData?.attachments || []);
  const [newAttachment, setNewAttachment] = useState({ name: "", url: "" });

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!initialData) { // Only auto-generate on create
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  };

  // Block Helpers
  const addBlock = (type: BlockType, insertIndex?: number) => {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type,
      content: type === "bom" ? { title: "Hardware Requirements", items: [] } : type === "project_kit" ? { title: "📦 THE FIDEVOLTZ PROJECT KIT", productLink: "" } : type === "image" ? { url: "", layout: "single", size: "default", aspectRatio: "auto", columns: 3 } : type === "ad" ? { zone: "CONTENT_MIDDLE" } : type === "text" || type === "markdown" ? "" 
             : type === "heading" ? { text: "", level: "h2" } 
             : type === "code" ? { code: "", language: "javascript" } 
             : type === "alert" ? { title: "", text: "", type: "info" }
             : type === "youtube" ? { url: "" }
             : type === "campaign_data" ? { metaTitle: "", metaDescription: "", tags: "", youtubeTitle: "", youtubeDescription: "", youtubeScript: "", instagramPost: "", twitterPost: "", linkedinPost: "", facebookPost: "" }
             : { url: "" }
    };
    if (typeof insertIndex === 'number') {
      const newBlocks = [...blocks];
      newBlocks.splice(insertIndex, 0, newBlock);
      setBlocks(newBlocks);
    } else {
      setBlocks([...blocks, newBlock]);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const updateBlock = (id: string, content: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
      setBlocks(newBlocks);
    } else if (direction === "down" && index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      setBlocks(newBlocks);
    }
  };

  // Component Helpers
  const searchProducts = async (query: string) => {
    setProductSearch(query);
    if (query.length < 2) return;
    try {
      const res = await fetch(`/api/products?search=${query}&limit=5`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data.data);
      }
    } catch (e) {
      console.error("Search error", e);
    }
  };

  const addComponent = (product: any) => {
    if (components.find(c => c.productId === product.id)) return;
    setComponents([...components, { 
      productId: product.id, 
      name: product.name, 
      quantity: 1,
      image: product.image 
    }]);
    setIsComponentDialogOpen(false);
    setProductSearch("");
  };

  const updateComponentQuantity = (index: number, quantity: number) => {
    const newComponents = [...components];
    newComponents[index].quantity = quantity;
    setComponents(newComponents);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  // Attachment Helpers
  const addAttachment = () => {
    if (!newAttachment.name || !newAttachment.url) return;
    setAttachments([...attachments, { ...newAttachment, type: "file" }]);
    setNewAttachment({ name: "", url: "" });
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      slug,
      excerpt,
      category,
      difficulty,
      featuredImage,
      allowComments,
      status,
      content: blocks,
      components,
      attachments
    };

    try {
      const url = initialData ? `/api/admin/projects/${initialData.id}` : "/api/admin/projects";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(initialData ? "Project updated successfully" : "Project created successfully");
        router.push("/dashboard/projects");
        router.refresh();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to save project");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="fixed bottom-6 right-6 md:right-8 z-50 flex flex-col md:flex-row items-end md:items-center gap-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading} className="shadow-lg hover:shadow-xl transition-shadow">
            {loading ? "Saving..." : initialData ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings & Metadata</TabsTrigger>
          <TabsTrigger value="campaign">SEO & Campaigns</TabsTrigger>
          <TabsTrigger value="components">Components & Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Content</CardTitle>
              <CardDescription>Build your tutorial content with blocks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {blocks.map((block, index) => (
                      <div key={block.id} className="relative">
                        {/* Insert Block Above Row */}
                        <div className="relative group/add my-2 flex justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="absolute top-1/2 left-0 w-full h-px bg-primary/20 -z-10" />
                          <Select onValueChange={(val: any) => addBlock(val, index)} value="">
                            <SelectTrigger className="w-[140px] bg-white h-8 text-xs border-primary/20 hover:border-primary/50 rounded-full shadow-sm focus:ring-0">
                              <div className="flex items-center gap-1 font-medium text-primary"><Plus className="w-3 h-3"/> Insert Block</div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="heading">Heading</SelectItem>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="markdown">Markdown</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="code">Code</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="alert">Alert</SelectItem>
                              <SelectItem value="project_kit">Project Kit</SelectItem>
                              <SelectItem value="bom">BOM Table</SelectItem>
                              <SelectItem value="ad">Ad Slot</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <SortableBlockItem
                          id={block.id}
                          type={block.type}
                          index={index}
                          total={blocks.length}
                          onMoveUp={() => moveBlock(index, "up")}
                          onMoveDown={() => moveBlock(index, "down")}
                          onRemove={() => removeBlock(block.id)}
                        >


                    {block.type === "text" && (
                      <RichTextEditor 
                        content={block.content.toString()}
                        onChange={(val) => updateBlock(block.id, val)}
                        className="w-full"
                      />
                    )}

                    {block.type === "markdown" && (
                      <div className="space-y-2 border rounded-md p-2 bg-slate-50/50">
                        <Label className="text-xs text-muted-foreground mb-1 block">Markdown Support: Use **bold**, *italic*, - lists, and # headers</Label>
                        <Textarea 
                          value={block.content} 
                          onChange={(e) => updateBlock(block.id, e.target.value)}
                          placeholder="# Your Title&#10;- Item 1&#10;- Item 2"
                          className="min-h-[150px] font-mono text-sm"
                        />
                      </div>
                    )}

                    {block.type === "heading" && (
                      <div className="flex gap-2 items-center">
                        <Select 
                          value={block.content.level} 
                          onValueChange={(val) => updateBlock(block.id, { ...block.content, level: val })}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="h2">H2</SelectItem>
                            <SelectItem value="h3">H3</SelectItem>
                            <SelectItem value="h4">H4</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input 
                          value={block.content.text}
                          onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
                          placeholder="Heading text..."
                          className="font-bold text-lg"
                        />
                      </div>
                    )}

                    {block.type === "code" && (
                      <div className="space-y-2">
                        <Select 
                          value={block.content.language} 
                          onValueChange={(lang) => updateBlock(block.id, { ...block.content, language: lang })}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="cpp">C++ (Arduino)</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="html">HTML</SelectItem>
                          </SelectContent>
                        </Select>
                        <Textarea 
                          value={block.content.code}
                          onChange={(e) => updateBlock(block.id, { ...block.content, code: e.target.value })}
                          placeholder="Paste your code here..."
                          className="font-mono text-sm min-h-[150px] bg-slate-950 text-slate-50"
                        />
                      </div>
                    )}

                    {block.type === "image" && (
                      <div className="space-y-4">
                        {/* Media Picker trigger + preview */}
                        <MediaPicker
                          mediaType="IMAGE"
                          multiple={true}
                          onChange={(media: any) => {
                            if (media) {
                              const mediaArray = Array.isArray(media) ? media : [media];
                              const newUrls = mediaArray.map((m: any) => m.secureUrl || m.url);
                              const existingUrls = block.content.urls || (block.content.url ? [block.content.url] : []);
                              updateBlock(block.id, { 
                                ...block.content, 
                                urls: [...existingUrls, ...newUrls],
                                url: undefined
                              });
                            }
                          }}
                        >
                          <div className="border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group">
                            {(() => {
                              const urls = block.content.urls?.length > 0 
                                ? block.content.urls 
                                : (block.content.url ? [block.content.url] : []);
                              const cols = (block.content.columns || 3) as 2 | 3 | 4;
                              const ratio = (block.content.aspectRatio || 'auto') as 'square' | 'portrait' | 'landscape' | 'wide' | 'auto';
                              const ratioClass: Record<'square'|'portrait'|'landscape'|'wide'|'auto', string> = { square: 'aspect-square', portrait: 'aspect-[3/4]', landscape: 'aspect-[4/3]', wide: 'aspect-video', auto: 'max-h-[200px]' };
                              const gridClass: Record<2|3|4, string> = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };
                              const imgRatioClass = ratioClass[ratio] || 'max-h-[200px]';
                              const imgGridClass = gridClass[cols] || 'grid-cols-3';
                              
                              if (urls.length > 0) {
                                return (
                                  <div className={`p-3 ${urls.length > 1 ? `grid ${imgGridClass} gap-2` : ''}`}>
                                    {urls.map((u: string, idx: number) => (
                                      <div key={idx} className="relative group/img">
                                        <img 
                                          src={u} 
                                          alt={`Image ${idx + 1}`} 
                                          className={`w-full object-cover rounded-lg ${imgRatioClass}`} 
                                        />
                                        <button
                                          type="button"
                                          className="absolute top-1 right-1 w-5 h-5 rounded bg-red-500 text-white opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center shadow"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const newUrls = [...urls];
                                            newUrls.splice(idx, 1);
                                            updateBlock(block.id, { ...block.content, urls: newUrls, url: undefined });
                                          }}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-1 text-slate-400 group-hover:text-blue-500 group-hover:border-blue-300 transition-colors min-h-[80px]">
                                      <Plus className="h-5 w-5" />
                                      <span className="text-xs font-medium">Add</span>
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div className="py-10 flex flex-col items-center gap-3">
                                  <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                                    <ImageIcon className="h-7 w-7 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                  </div>
                                  <div className="text-center">
                                    <p className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">Click to select images</p>
                                    <p className="text-xs text-slate-400 mt-1">Supports multiple selection for galleries</p>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </MediaPicker>

                        {/* Image Controls */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Display Settings</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* Layout */}
                            <div className="space-y-1.5">
                              <Label className="text-xs">Layout</Label>
                              <Select 
                                value={block.content.layout || "single"} 
                                onValueChange={(val) => updateBlock(block.id, { ...block.content, layout: val })}
                              >
                                <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="single">Single / Stack</SelectItem>
                                  <SelectItem value="grid">Grid Gallery</SelectItem>
                                  <SelectItem value="masonry">Masonry</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Columns — only show if grid */}
                            {(block.content.layout === 'grid' || block.content.layout === 'masonry') && (
                              <div className="space-y-1.5">
                                <Label className="text-xs">Columns</Label>
                                <Select 
                                  value={String(block.content.columns || 3)} 
                                  onValueChange={(val) => updateBlock(block.id, { ...block.content, columns: parseInt(val) })}
                                >
                                  <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="2">2 Columns</SelectItem>
                                    <SelectItem value="3">3 Columns</SelectItem>
                                    <SelectItem value="4">4 Columns</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Aspect Ratio */}
                            <div className="space-y-1.5">
                              <Label className="text-xs">Aspect Ratio</Label>
                              <Select 
                                value={block.content.aspectRatio || "auto"} 
                                onValueChange={(val) => updateBlock(block.id, { ...block.content, aspectRatio: val })}
                              >
                                <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="auto">Auto (original)</SelectItem>
                                  <SelectItem value="square">Square (1:1)</SelectItem>
                                  <SelectItem value="landscape">Landscape (4:3)</SelectItem>
                                  <SelectItem value="wide">Wide (16:9)</SelectItem>
                                  <SelectItem value="portrait">Portrait (3:4)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Width / Size */}
                            <div className="space-y-1.5">
                              <Label className="text-xs">Width</Label>
                              <Select 
                                value={block.content.size || "default"} 
                                onValueChange={(val) => updateBlock(block.id, { ...block.content, size: val })}
                              >
                                <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="xs">Extra Small</SelectItem>
                                  <SelectItem value="small">Small (384px)</SelectItem>
                                  <SelectItem value="default">Medium (640px)</SelectItem>
                                  <SelectItem value="large">Large (896px)</SelectItem>
                                  <SelectItem value="xl">Extra Large (1152px)</SelectItem>
                                  <SelectItem value="full">Full Width</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <Input 
                          placeholder="Caption / Alt text (for accessibility and SEO)"
                          value={block.content.alt || ''}
                          onChange={(e) => updateBlock(block.id, { ...block.content, alt: e.target.value })}
                        />
                      </div>
                    )}

                    {block.type === "video" && (
                      <div className="space-y-4">
                        <MediaPicker
                          mediaType="VIDEO"
                          onChange={(media: any) => {
                            if (media) updateBlock(block.id, { ...block.content, url: media.secureUrl || media.url });
                          }}
                        >
                          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:bg-slate-50 transition-colors cursor-pointer text-center group">
                            {block.content.url ? (
                              <div className="space-y-2">
                                <video src={block.content.url} className="max-h-[200px] mx-auto rounded" controls />
                                <div className="text-sm text-blue-600 font-medium group-hover:underline">Replace Video</div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                <span className="font-medium text-slate-700">Click to upload or select a video</span>
                                <span className="text-xs text-slate-500">Supports MP4, WebM, OGG</span>
                              </div>
                            )}
                          </div>
                        </MediaPicker>
                        <div className="space-y-2">
                          <Label>Direct Video URL</Label>
                          <Input 
                            placeholder="https://example.com/video.mp4"
                            value={block.content.url}
                            onChange={(e) => updateBlock(block.id, { ...block.content, url: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    {block.type === "youtube" && (
                      <div className="space-y-2 bg-red-50/50 p-4 border border-red-100 rounded-lg">
                        <Label className="text-red-800">YouTube Video URL</Label>
                        <Input 
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={block.content.url}
                          onChange={(e) => updateBlock(block.id, { ...block.content, url: e.target.value })}
                          className="border-red-200"
                        />
                      </div>
                    )}

                    {block.type === "alert" && (
                      <div className="space-y-4 bg-blue-50/50 p-4 border border-blue-100 rounded-lg">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-1 space-y-2">
                            <Label>Alert Type</Label>
                            <Select 
                              value={block.content.type || "info"} 
                              onValueChange={(val) => updateBlock(block.id, { ...block.content, type: val })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="info">Info (Blue)</SelectItem>
                                <SelectItem value="warning">Warning (Yellow)</SelectItem>
                                <SelectItem value="tip">Tip (Green)</SelectItem>
                                <SelectItem value="danger">Danger (Red)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2 space-y-2">
                            <Label>Title (Optional)</Label>
                            <Input 
                              placeholder="Important Note:"
                              value={block.content.title}
                              onChange={(e) => updateBlock(block.id, { ...block.content, title: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Alert Text</Label>
                          <Textarea 
                            placeholder="Enter the alert content here..."
                            value={block.content.text}
                            onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    {block.type === "project_kit" && (
                      <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Kit Title</Label>
                            <Input placeholder="e.g. 📦 THE FIDEVOLTZ PROJECT KIT" value={block.content.title} onChange={(e) => updateBlock(block.id, { ...block.content, title: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Product Link</Label>
                            <Input placeholder="e.g. /store/product/123" value={block.content.productLink} onChange={(e) => updateBlock(block.id, { ...block.content, productLink: e.target.value })} />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label>Description</Label>
                            <Textarea placeholder="Skip the hassle..." value={block.content.description} onChange={(e) => updateBlock(block.id, { ...block.content, description: e.target.value })} />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label>Includes (Components list)</Label>
                            <Input placeholder="Includes pre-tested Arduino Uno..." value={block.content.includes} onChange={(e) => updateBlock(block.id, { ...block.content, includes: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Guarantee Text</Label>
                            <Input placeholder="Guaranteed to work..." value={block.content.guarantee} onChange={(e) => updateBlock(block.id, { ...block.content, guarantee: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Button Text</Label>
                            <Input placeholder="Buy the Complete Kit - $45.00" value={block.content.buttonText} onChange={(e) => updateBlock(block.id, { ...block.content, buttonText: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    )}

                    {block.type === "bom" && (
                      <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="space-y-2">
                          <Label>Table Title</Label>
                          <Input placeholder="Hardware Requirements & Bill of Materials" value={block.content.title} onChange={(e) => updateBlock(block.id, { ...block.content, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>BOM Items</Label>
                          <div className="space-y-3">
                            {block.content.items?.map((item: any, i: number) => (
                              <div key={i} className="flex gap-2 items-start bg-white p-3 border rounded shadow-sm">
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 flex-1">
                                  <Input placeholder="Component Name" value={item.name || ""} onChange={(e) => {
                                    const newItems = [...(block.content.items || [])];
                                    newItems[i].name = e.target.value;
                                    updateBlock(block.id, { ...block.content, items: newItems });
                                  }} />
                                  <Input placeholder="Qty (e.g. 1, 2, 1 dozen, Full Sheet)" value={item.quantity || ""} onChange={(e) => {
                                    const newItems = [...(block.content.items || [])];
                                    newItems[i].quantity = e.target.value;
                                    updateBlock(block.id, { ...block.content, items: newItems });
                                  }} />
                                  <Input placeholder="Specs/Notes" value={item.specs || ""} onChange={(e) => {
                                    const newItems = [...(block.content.items || [])];
                                    newItems[i].specs = e.target.value;
                                    updateBlock(block.id, { ...block.content, items: newItems });
                                  }} />
                                  <Input placeholder="Link Text" value={item.linkText || ""} onChange={(e) => {
                                    const newItems = [...(block.content.items || [])];
                                    newItems[i].linkText = e.target.value;
                                    updateBlock(block.id, { ...block.content, items: newItems });
                                  }} />
                                  <ProductLinkPicker 
                                    value={item.productLink || ""} 
                                    onChange={(val, product) => {
                                      const newItems = [...(block.content.items || [])];
                                      newItems[i].productLink = val;
                                      if (product) {
                                        newItems[i].productId = product.id;
                                        newItems[i].productName = product.name;
                                        newItems[i].productPrice = product.price;
                                        newItems[i].productImage = product.image;
                                        newItems[i].productSlug = product.slug;
                                        newItems[i].productStock = product.stock;
                                      }
                                      updateBlock(block.id, { ...block.content, items: newItems });
                                    }} 
                                  />
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="text-red-500 mt-1" onClick={() => {
                                  const newItems = [...block.content.items];
                                  newItems.splice(i, 1);
                                  updateBlock(block.id, { ...block.content, items: newItems });
                                }}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => {
                              const newItems = [...(block.content.items || []), { name: "", quantity: "", specs: "", linkText: "Buy", productLink: "" }];
                              updateBlock(block.id, { ...block.content, items: newItems });
                            }}>
                              <Plus className="h-4 w-4 mr-2" /> Add Item
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {block.type === "ad" && (
                      <div className="space-y-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 p-5 rounded-xl shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <ShoppingCart className="w-24 h-24 text-orange-500" />
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="bg-orange-500 text-white rounded-md p-2 shadow-sm">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-orange-900">Advertisement Slot</h4>
                            <p className="text-xs text-orange-700 max-w-[80%]">
                              Ads will automatically populate here from your SEO & Ads Manager based on the zone selected.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-white/60 p-4 rounded-lg border border-orange-100 relative z-10 mt-2">
                          <div className="space-y-3">
                            <Label className="text-orange-900 font-semibold flex items-center gap-2">
                              Select Display Zone <span className="text-red-500">*</span>
                            </Label>
                            <Select value={block.content.zone || "CONTENT_MIDDLE"} onValueChange={(val) => updateBlock(block.id, { ...block.content, zone: val })}>
                              <SelectTrigger className="w-full md:w-[300px] bg-white border-orange-200 focus:ring-orange-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CONTENT_TOP">Top of Content</SelectItem>
                                <SelectItem value="CONTENT_MIDDLE">Middle of Content</SelectItem>
                                <SelectItem value="CONTENT_BOTTOM">Bottom of Content</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-between items-center relative z-10">
                           <p className="text-xs text-orange-600/80 italic flex items-center gap-1">
                            <span>💡</span> Manage ad creatives in your <a href="/dashboard/seo" className="underline font-semibold" target="_blank" rel="noreferrer">Ads Manager</a>
                          </p>
                        </div>
                        </div>
                      )}
                    </SortableBlockItem>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => addBlock("heading")} className="gap-2">
                  <Type className="h-4 w-4" /> Add Heading
                </Button>
                <Button type="button" variant="outline" onClick={() => addBlock("text")} className="gap-2">
                  <FileText className="h-4 w-4" /> Add Text
                </Button>
                <Button type="button" variant="outline" onClick={() => addBlock("markdown")} className="gap-2">
                  <FileText className="h-4 w-4" /> Add Markdown
                </Button>
                <Button type="button" variant="outline" onClick={() => addBlock("image")} className="gap-2">
                  <ImageIcon className="h-4 w-4" /> Add Image
                </Button>
                <Button type="button" variant="outline" onClick={() => addBlock("code")} className="gap-2">
                  <Code className="h-4 w-4" /> Add Code
                </Button>
                <Button type="button" variant="outline" onClick={() => addBlock("youtube")} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Video className="h-4 w-4" /> Add YouTube
                </Button>
                <Button type="button" variant="outline" onClick={() => addBlock("video")} className="gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                  <Upload className="h-4 w-4" /> Add Video
                </Button>
                <Button type="button" variant="outline" onClick={() => addBlock("alert")} className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <span className="font-bold text-lg leading-none">!</span> Add Alert
                </Button>
                <Button type="button" variant="outline" onClick={() => addBlock("project_kit")} className="gap-2">
                  <Package className="h-4 w-4" /> Add Project Kit
                </Button>
                <Button type="button" variant="outline" onClick={() => addBlock("bom")} className="gap-2">
                  <ShoppingCart className="h-4 w-4" /> Add BOM Table
                </Button>
                <Button type="button" variant="outline" onClick={() => addBlock("ad")} className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-50">
                  <span className="text-xs font-bold">AD</span> Insert Ad Slot
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaign" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Social Campaigns</CardTitle>
              <CardDescription>
                Manage your YouTube scripts, social media drafts, and SEO meta tags here. 
                This data is securely saved with your project but will never appear on the public tutorial page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {blocks.findIndex(b => b.type === "campaign_data") === -1 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">You haven't initialized a Campaign Data block for this project yet.</p>
                  <Button type="button" onClick={() => addBlock("campaign_data")}>
                    Initialize Campaign Storage
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {blocks.filter(b => b.type === "campaign_data").map((block) => (
                    <div key={block.id} className="space-y-8">
                      <Accordion type="single" collapsible className="w-full bg-white border rounded-lg">
                        
                        <AccordionItem value="seo" className="px-4">
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-2">
                              <Search className="w-5 h-5 text-indigo-500" />
                              <span className="font-semibold text-lg text-slate-800">Search Engine Optimization</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-6 pt-2 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-slate-700">Meta Title</Label>
                                <Input className="bg-slate-50" value={block.content.metaTitle || ""} onChange={(e) => updateBlock(block.id, { ...block.content, metaTitle: e.target.value })} placeholder="Optimal SEO Title" />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-slate-700">SEO Tags / Keywords</Label>
                                <Input className="bg-slate-50" value={block.content.tags || ""} onChange={(e) => updateBlock(block.id, { ...block.content, tags: e.target.value })} placeholder="Arduino, VVVF, Elevator" />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label className="text-slate-700">Meta Description (150-160 chars)</Label>
                                <Textarea className="bg-slate-50" value={block.content.metaDescription || ""} onChange={(e) => updateBlock(block.id, { ...block.content, metaDescription: e.target.value })} placeholder="Brief description for search engines..." />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="youtube" className="px-4">
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-2">
                              <Video className="w-5 h-5 text-red-500" />
                              <span className="font-semibold text-lg text-slate-800">YouTube Integration</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-6 pt-2 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-slate-700">Video Title</Label>
                                <Input className="bg-red-50/50 border-red-100 focus-visible:ring-red-400" value={block.content.youtubeTitle || ""} onChange={(e) => updateBlock(block.id, { ...block.content, youtubeTitle: e.target.value })} placeholder="Catchy Video Title" />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label className="text-slate-700">Video Description</Label>
                                <Textarea className="bg-red-50/50 border-red-100 focus-visible:ring-red-400 min-h-[100px]" value={block.content.youtubeDescription || ""} onChange={(e) => updateBlock(block.id, { ...block.content, youtubeDescription: e.target.value })} placeholder="Video description with links..." />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label className="text-slate-700">Full Video Script</Label>
                                <Textarea className="bg-red-50/50 border-red-100 focus-visible:ring-red-400 min-h-[200px]" value={block.content.youtubeScript || ""} onChange={(e) => updateBlock(block.id, { ...block.content, youtubeScript: e.target.value })} placeholder="[INTRO] Hey everyone..." />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="social" className="px-4 border-b-0">
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-500" />
                              <span className="font-semibold text-lg text-slate-800">Social Media Drafts</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-6 pt-2 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-pink-600 font-semibold">Instagram Post</Label>
                                <Textarea className="bg-pink-50/30 border-pink-100 focus-visible:ring-pink-400 min-h-[120px]" value={block.content.instagramPost || ""} onChange={(e) => updateBlock(block.id, { ...block.content, instagramPost: e.target.value })} placeholder="Instagram caption..." />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-blue-500 font-semibold">Twitter (X) Post</Label>
                                <Textarea className="bg-blue-50/30 border-blue-100 focus-visible:ring-blue-400 min-h-[120px]" value={block.content.twitterPost || ""} onChange={(e) => updateBlock(block.id, { ...block.content, twitterPost: e.target.value })} placeholder="Short tweet..." />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-blue-700 font-semibold">LinkedIn Post</Label>
                                <Textarea className="bg-blue-50/30 border-blue-100 focus-visible:ring-blue-600 min-h-[120px]" value={block.content.linkedinPost || ""} onChange={(e) => updateBlock(block.id, { ...block.content, linkedinPost: e.target.value })} placeholder="Professional summary..." />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-blue-600 font-semibold">Facebook Post</Label>
                                <Textarea className="bg-blue-50/30 border-blue-100 focus-visible:ring-blue-500 min-h-[120px]" value={block.content.facebookPost || ""} onChange={(e) => updateBlock(block.id, { ...block.content, facebookPost: e.target.value })} placeholder="Facebook announcement..." />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                      </Accordion>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
              <CardDescription>SEO and display settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={handleTitleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                   <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="IoT">IoT</SelectItem>
                      <SelectItem value="Robotics">Robotics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Excerpt (Short Description)</Label>
                <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
              </div>

              <div className="space-y-2">
                <Label>Featured Image</Label>
                <MediaPicker
                  mediaType="IMAGE"
                  onChange={(media: any) => {
                    if (media) setFeaturedImage(media.secureUrl || media.url);
                  }}
                >
                  <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-accent/50 w-full md:w-1/2">
                    {featuredImage ? (
                      <img src={featuredImage} alt="Featured" className="w-full h-auto rounded-md" />
                    ) : (
                      <div className="py-8">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Set Featured Image</span>
                      </div>
                    )}
                  </div>
                </MediaPicker>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="comments" 
                  checked={allowComments} 
                  onChange={(e) => setAllowComments(e.target.checked)} 
                  className="rounded border-gray-300"
                />
                <Label htmlFor="comments">Allow Comments</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Required Components</CardTitle>
                  <CardDescription>Link products from the store used in this project</CardDescription>
                </div>
                <Dialog open={isComponentDialogOpen} onOpenChange={setIsComponentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" /> Add Component
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Search Products</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search for products..." 
                          className="pl-9"
                          value={productSearch}
                          onChange={(e) => searchProducts(e.target.value)}
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {searchResults.map(product => (
                          <div key={product.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md border">
                            <div className="flex items-center gap-3">
                              {product.image && (
                                <img src={product.image} alt="" className="w-10 h-10 object-cover rounded" />
                              )}
                              <div>
                                <div className="font-medium text-sm">{product.name}</div>
                                <div className="text-xs text-muted-foreground">${Number(product.price).toFixed(2)}</div>
                              </div>
                            </div>
                            <Button type="button" size="sm" onClick={() => addComponent(product)}>Add</Button>
                          </div>
                        ))}
                        {productSearch.length > 1 && searchResults.length === 0 && (
                          <div className="text-center text-sm text-muted-foreground py-4">
                            No products found
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {components.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  No components added yet
                </div>
              ) : (
                <div className="space-y-3">
                  {components.map((comp, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                           <ShoppingCart className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{comp.name}</p>
                          {comp.productId && <Badge variant="secondary" className="text-[10px]">Linked Product</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Qty</Label>
                          <Input 
                            type="number" 
                            min="1" 
                            className="w-16 h-8" 
                            value={comp.quantity}
                            onChange={(e) => updateComponentQuantity(index, parseInt(e.target.value))}
                          />
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeComponent(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
              <CardDescription>Datasheets, diagrams, and other files (PDF, ZIP)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="File Name (e.g. Datasheet.pdf)" 
                  value={newAttachment.name}
                  onChange={(e) => setNewAttachment({ ...newAttachment, name: e.target.value })}
                />
                <Input 
                  placeholder="File URL" 
                  value={newAttachment.url}
                  onChange={(e) => setNewAttachment({ ...newAttachment, url: e.target.value })}
                />
                {/* 
                     For robust document upload, we would ideally use a generic file uploader 
                     that uploads to Cloudinary as 'raw' or 'auto' and returns the URL. 
                     Here we assume user uses MediaPicker elsewhere or copies URL. 
                     Enhancement: Add MediaPicker here restricted to raw? 
                */}
                <MediaPicker
                  mediaType="DOCUMENT" // TODO: Extend to support generic files
                  onChange={(media: any) => {
                     if (media) setNewAttachment({ ...newAttachment, url: media.secureUrl || media.url, name: media.name || newAttachment.name });
                  }}
                >
                  <Button type="button" variant="secondary">Pick</Button>
                </MediaPicker>

                <Button type="button" onClick={addAttachment}>Add</Button>
              </div>

               <div className="space-y-2">
                 {attachments.map((att, index) => (
                   <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                     <div className="flex items-center gap-2">
                       <FileText className="h-4 w-4 text-muted-foreground" />
                       <a href={att.url} target="_blank" className="text-sm hover:underline text-blue-600">{att.name || att.url}</a>
                     </div>
                     <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeAttachment(index)}>
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
