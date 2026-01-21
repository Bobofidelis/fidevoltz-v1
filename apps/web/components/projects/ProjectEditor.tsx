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
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaPicker } from "@/components/media/MediaPicker";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ProjectEditorProps {
  initialData?: any;
}


type BlockType = "text" | "image" | "video" | "code" | "heading";

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
  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type,
      content: type === "text" ? "" : type === "heading" ? { text: "", level: "h2" } : type === "code" ? { code: "", language: "javascript" } : type === "image" ? { url: "", alt: "" } : { url: "" }
    };
    setBlocks([...blocks, newBlock]);
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
      <div className="flex items-center justify-between">
        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : initialData ? "Update Project" : "Create Project"}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings & Metadata</TabsTrigger>
          <TabsTrigger value="components">Components & Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Content</CardTitle>
              <CardDescription>Build your tutorial content with blocks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <div key={block.id} className="group relative border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors">
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Button type="button" variant="ghost" size="icon" onClick={() => moveBlock(index, "up")} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => moveBlock(index, "down")} disabled={index === blocks.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => removeBlock(block.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mb-2">
                      <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                        {block.type} Block
                      </Badge>
                    </div>


                    {block.type === "text" && (
                      <Textarea 
                        value={block.content} 
                        onChange={(e) => updateBlock(block.id, e.target.value)}
                        placeholder="Write your content here..."
                        className="min-h-[100px]"
                      />
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
                         <MediaPicker
                          mediaType="IMAGE"
                          onChange={(media: any) => {
                            if (media) updateBlock(block.id, { ...block.content, url: media.secureUrl || media.url });
                          }}
                        >
                          <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-accent/50">
                            {block.content.url ? (
                              <img src={block.content.url} alt="Block image" className="max-h-[300px] mx-auto rounded-md" />
                            ) : (
                              <div className="py-8">
                                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Select Image</span>
                              </div>
                            )}
                          </div>
                        </MediaPicker>
                        <Input 
                          placeholder="Image caption / Alt text"
                          value={block.content.alt}
                          onChange={(e) => updateBlock(block.id, { ...block.content, alt: e.target.value })}
                        />
                      </div>
                    )}

                    {block.type === "video" && (
                      <div className="space-y-2">
                        <Label>YouTube URL</Label>
                        <Input 
                          placeholder="https://youtube.com/watch?v=..."
                          value={block.content.url}
                          onChange={(e) => updateBlock(block.id, { ...block.content, url: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => addBlock("heading")} className="gap-2">
                  <Type className="h-4 w-4" /> Add Heading
                </Button>
                <Button type="button" variant="outline" onClick={() => addBlock("text")} className="gap-2">
                  <FileText className="h-4 w-4" /> Add Text
                </Button>
                <Button type="button" variant="outline" onClick={() => addBlock("image")} className="gap-2">
                  <ImageIcon className="h-4 w-4" /> Add Image
                </Button>
                <Button type="button" variant="outline" onClick={() => addBlock("code")} className="gap-2">
                  <Code className="h-4 w-4" /> Add Code
                </Button>
                <Button type="button" variant="outline" onClick={() => addBlock("video")} className="gap-2">
                  <Video className="h-4 w-4" /> Add Video
                </Button>
              </div>
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
                    <Button variant="outline" className="gap-2">
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
                            <Button size="sm" onClick={() => addComponent(product)}>Add</Button>
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
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeComponent(index)}>
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
                     <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeAttachment(index)}>
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
