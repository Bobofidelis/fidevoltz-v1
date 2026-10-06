"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Editor } from "@/components/editor";
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Layout, AlignLeft, Grid, HelpCircle, FormInput, Image, Video, Youtube, Link as LinkIcon } from "lucide-react";
import { useState, createContext, useContext } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker } from "@/components/media/MediaPicker";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface Block {
  id: string;
  type: string;
  [key: string]: any;
}

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

// ────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────
const BLOCK_TYPES = [
  { type: 'hero',            label: 'Hero Section',   icon: Layout   },
  { type: 'text',            label: 'Rich Text',      icon: AlignLeft },
  { type: 'image',           label: 'Image',          icon: Image    },
  { type: 'video',           label: 'Video',          icon: Video    },
  { type: 'youtube',         label: 'YouTube',        icon: Youtube  },
  { type: 'links',           label: 'Link List',      icon: LinkIcon },
  { type: 'grid',            label: 'Feature Grid',   icon: Grid     },
  { type: 'faq',             label: 'FAQ Accordion',  icon: HelpCircle },
  { type: 'form',            label: 'Special Form',   icon: FormInput },
  { type: 'sidebar_section', label: 'Sidebar Layout', icon: Layout   },
];

const ALLOWED_ICONS = ['Lightbulb', 'Cpu', 'Globe', 'Briefcase', 'FileQuestion', 'MessageCircle', 'LifeBuoy'];

// ────────────────────────────────────────────────
// Drag Handle via Context
// ────────────────────────────────────────────────
const DragListeners = createContext<{ attributes: any; listeners: any } | null>(null);

function DragHandle() {
  const ctx = useContext(DragListeners);
  if (!ctx) return <GripVertical className="h-4 w-4 text-slate-400" />;
  return (
    <div
      {...ctx.attributes}
      {...ctx.listeners}
      className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors touch-none"
      title="Drag to reorder"
    >
      <GripVertical className="h-4 w-4" />
    </div>
  );
}

// ────────────────────────────────────────────────
// Sortable Wrapper
// ────────────────────────────────────────────────
function SortableBlockWrapper({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <DragListeners.Provider value={{ attributes, listeners }}>
      <div ref={setNodeRef} style={style}>
        {children}
      </div>
    </DragListeners.Provider>
  );
}

// ────────────────────────────────────────────────
// Block Editor
// ────────────────────────────────────────────────
export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(blocks[0]?.id ?? null);

  // Ensure every block has an id (migration-safe)
  const normalizedBlocks: Block[] = blocks.map((b, i) =>
    b.id ? b : { ...b, id: `legacy-${i}-${b.type}` }
  );

  // ── Sensors ──────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Drag End ─────────────────────────────────
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = normalizedBlocks.findIndex(b => b.id === active.id);
      const newIndex = normalizedBlocks.findIndex(b => b.id === over.id);
      onChange(arrayMove(normalizedBlocks, oldIndex, newIndex));
    }
  };

  // ── Add block ────────────────────────────────
  const addBlock = (type: string) => {
    const id = crypto.randomUUID();
    let newBlock: Block = { id, type };

    if (type === 'hero') {
      newBlock = { ...newBlock, title: '', subtitle: '', badge: '', backgroundImage: '' };
    } else if (type === 'text') {
      newBlock = { ...newBlock, content: '' };
    } else if (type === 'image') {
      newBlock = { ...newBlock, url: '', alt: '', caption: '' };
    } else if (type === 'video') {
      newBlock = { ...newBlock, url: '', poster: '' };
    } else if (type === 'youtube') {
      newBlock = { ...newBlock, url: '', title: '' };
    } else if (type === 'links') {
      newBlock = { ...newBlock, title: 'Quick Links', links: [{ label: 'Link 1', href: '#', description: '' }] };
    } else if (type === 'grid') {
      newBlock = { ...newBlock, columns: 3, items: [{ title: 'Example Feature', content: 'Feature description here', icon: 'Lightbulb' }] };
    } else if (type === 'faq') {
      newBlock = { ...newBlock, categories: [{ name: 'General', questions: [{ q: 'Question?', a: 'Answer here.' }] }] };
    } else if (type === 'form') {
      newBlock = { ...newBlock, formType: 'support' };
    } else if (type === 'sidebar_section') {
      newBlock = { ...newBlock, content: '', sidebar: [], layout: { side: 'right', sticky: true, width: 'normal' } };
    }

    onChange([...normalizedBlocks, newBlock]);
    setExpandedId(id);
  };

  // ── Remove block ──────────────────────────────
  const removeBlock = (id: string) => {
    onChange(normalizedBlocks.filter(b => b.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  // ── Move block ────────────────────────────────
  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const idx = normalizedBlocks.findIndex(b => b.id === id);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= normalizedBlocks.length) return;
    onChange(arrayMove(normalizedBlocks, idx, targetIdx));
  };

  // ── Update block ──────────────────────────────
  const updateBlock = (id: string, data: Partial<Block>) => {
    onChange(normalizedBlocks.map(b => b.id === id ? { ...b, ...data } : b));
  };

  return (
    <div className="space-y-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={normalizedBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {normalizedBlocks.map((block, index) => (
              <SortableBlockWrapper key={block.id} id={block.id}>
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="py-3 px-4 bg-slate-50 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                      <DragHandle />
                      <span className="font-medium text-sm text-slate-700 uppercase tracking-wider">
                        Block {index + 1}: {block.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => moveBlock(block.id, 'up')} disabled={index === 0}>
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => moveBlock(block.id, 'down')} disabled={index === normalizedBlocks.length - 1}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeBlock(block.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => setExpandedId(expandedId === block.id ? null : block.id)}>
                        <Plus className={`h-4 w-4 transition-transform ${expandedId === block.id ? 'rotate-45' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>

                  {expandedId === block.id && (
                    <CardContent className="p-6 space-y-6">
                      {/* ── HERO ── */}
                      {block.type === 'hero' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2 col-span-2">
                            <Label>Hero Title</Label>
                            <Input value={block.title || ''} onChange={e => updateBlock(block.id, { title: e.target.value })} />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label>Hero Subtitle</Label>
                            <Input value={block.subtitle || ''} onChange={e => updateBlock(block.id, { subtitle: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Badge Text</Label>
                            <Input value={block.badge || ''} onChange={e => updateBlock(block.id, { badge: e.target.value })} />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label>Background Image</Label>
                            <MediaPicker
                              mediaType="IMAGE"
                              onChange={(media: any) => updateBlock(block.id, { backgroundImage: media.url })}
                            />
                            {block.backgroundImage && (
                              <div className="mt-2 text-sm text-green-600 truncate">Selected: {block.backgroundImage}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ── TEXT ── */}
                      {block.type === 'text' && (
                        <div className="space-y-2">
                          <Label>Rich Text Content</Label>
                          <Editor value={block.content || ''} onChange={content => updateBlock(block.id, { content })} />
                        </div>
                      )}

                      {/* ── IMAGE ── */}
                      {block.type === 'image' && (
                        <div className="space-y-4">
                          <Label className="text-base font-bold">Image</Label>
                          <MediaPicker mediaType="IMAGE" onChange={(media: any) => updateBlock(block.id, { ...block, url: media.url })}>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all text-center">
                              {block.url ? (
                                <div className="space-y-2">
                                  <img src={block.url} alt={block.alt || ''} className="max-h-48 mx-auto rounded-lg object-cover" />
                                  <p className="text-xs text-blue-600 font-medium">Click to replace image</p>
                                </div>
                              ) : (
                                <div className="py-4">
                                  <Image className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                                  <p className="text-sm font-medium text-slate-600">Click to select image from media library</p>
                                </div>
                              )}
                            </div>
                          </MediaPicker>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs">Alt Text</Label>
                              <Input placeholder="Describe the image" value={block.alt || ''} onChange={e => updateBlock(block.id, { ...block, alt: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Caption (optional)</Label>
                              <Input placeholder="Caption text" value={block.caption || ''} onChange={e => updateBlock(block.id, { ...block, caption: e.target.value })} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Or paste image URL directly</Label>
                            <Input placeholder="https://..." value={block.url || ''} onChange={e => updateBlock(block.id, { ...block, url: e.target.value })} />
                          </div>
                        </div>
                      )}

                      {/* ── VIDEO ── */}
                      {block.type === 'video' && (
                        <div className="space-y-4">
                          <Label className="text-base font-bold">Video</Label>
                          <div className="space-y-2">
                            <Label className="text-xs">Video URL or Embed URL</Label>
                            <Input placeholder="https://... (MP4, WebM, or embed URL)" value={block.url || ''} onChange={e => updateBlock(block.id, { ...block, url: e.target.value })} />
                          </div>
                          {block.url && (
                            <video src={block.url} controls className="w-full max-h-64 rounded-lg border" />
                          )}
                          <div className="space-y-2">
                            <Label className="text-xs">Poster Image URL (thumbnail, optional)</Label>
                            <Input placeholder="https://... (shown before video plays)" value={block.poster || ''} onChange={e => updateBlock(block.id, { ...block, poster: e.target.value })} />
                          </div>
                        </div>
                      )}

                      {/* ── YOUTUBE ── */}
                      {block.type === 'youtube' && (
                        <div className="space-y-4 p-5 bg-red-50/50 border border-red-100 rounded-xl">
                          <Label className="text-base font-bold text-red-900">YouTube / Video Embed</Label>
                          <div className="space-y-2">
                            <Label className="text-xs text-red-700">Video URL</Label>
                            <Input placeholder="https://www.youtube.com/watch?v=... or any video URL" value={block.url || ''} onChange={e => updateBlock(block.id, { ...block, url: e.target.value })} className="border-red-200" />
                            <p className="text-xs text-slate-500">Supports YouTube, Vimeo, and any embed-compatible URL</p>
                          </div>
                          {block.url && (
                            <div className="aspect-video rounded-lg overflow-hidden border border-red-200">
                              <iframe src={block.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} className="w-full h-full" allowFullScreen title={block.title || 'Video'} />
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label className="text-xs">Title (accessibility)</Label>
                            <Input placeholder="Video title" value={block.title || ''} onChange={e => updateBlock(block.id, { ...block, title: e.target.value })} />
                          </div>
                        </div>
                      )}

                      {/* ── LINKS ── */}
                      {block.type === 'links' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-base font-bold">Link List</Label>
                            <Input placeholder="Section title" value={block.title || ''} onChange={e => updateBlock(block.id, { ...block, title: e.target.value })} />
                          </div>
                          <div className="space-y-3">
                            {block.links?.map((link: any, i: number) => (
                              <div key={i} className="grid grid-cols-1 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex gap-2">
                                  <Input className="bg-white" placeholder="Label" value={link.label || ''} onChange={e => { const ls = [...block.links]; ls[i] = {...ls[i], label: e.target.value}; updateBlock(block.id, { ...block, links: ls }); }} />
                                  <Input className="bg-white" placeholder="URL" value={link.href || ''} onChange={e => { const ls = [...block.links]; ls[i] = {...ls[i], href: e.target.value}; updateBlock(block.id, { ...block, links: ls }); }} />
                                  <Button type="button" variant="ghost" size="icon" onClick={() => { const ls = block.links.filter((_: any, idx: number) => idx !== i); updateBlock(block.id, { ...block, links: ls }); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                </div>
                                <Input className="bg-white text-xs" placeholder="Description (optional)" value={link.description || ''} onChange={e => { const ls = [...block.links]; ls[i] = {...ls[i], description: e.target.value}; updateBlock(block.id, { ...block, links: ls }); }} />
                              </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => { const ls = [...(block.links||[]), {label:'New Link', href:'#', description:''}]; updateBlock(block.id, { ...block, links: ls }); }}>
                              <Plus className="h-4 w-4 mr-2" /> Add Link
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* ── GRID ── */}
                      {block.type === 'grid' && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <Label>Columns</Label>
                            <Input type="number" className="w-20" value={block.columns || 3}
                              onChange={e => updateBlock(block.id, { columns: parseInt(e.target.value) })} />
                          </div>
                          <div className="space-y-4">
                            <Label className="text-base font-bold">Grid Items</Label>
                            {block.items?.map((item: any, itemIndex: number) => (
                              <Card key={itemIndex} className="bg-slate-50 border-slate-200">
                                <CardContent className="p-4 space-y-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Item {itemIndex + 1}</span>
                                    <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-red-500 hover:text-red-700"
                                      onClick={() => {
                                        const newItems = block.items.filter((_: any, i: number) => i !== itemIndex);
                                        updateBlock(block.id, { items: newItems });
                                      }}>
                                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-xs">Icon</Label>
                                      <Select value={item.icon || 'Lightbulb'} onValueChange={val => {
                                        const newItems = [...block.items];
                                        newItems[itemIndex] = { ...newItems[itemIndex], icon: val };
                                        updateBlock(block.id, { items: newItems });
                                      }}>
                                        <SelectTrigger className="bg-white h-9 text-sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          {ALLOWED_ICONS.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs">Title</Label>
                                      <Input className="bg-white h-9" value={item.title || ''} onChange={e => {
                                        const newItems = [...block.items];
                                        newItems[itemIndex] = { ...newItems[itemIndex], title: e.target.value };
                                        updateBlock(block.id, { items: newItems });
                                      }} />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                      <Label className="text-xs">Description</Label>
                                      <Textarea className="bg-white" rows={2} value={item.content || ''} onChange={e => {
                                        const newItems = [...block.items];
                                        newItems[itemIndex] = { ...newItems[itemIndex], content: e.target.value };
                                        updateBlock(block.id, { items: newItems });
                                      }} />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                            <Button type="button" variant="outline" size="sm" className="w-full border-dashed"
                              onClick={() => {
                                const newItems = [...(block.items || []), { title: '', content: '', icon: 'Lightbulb' }];
                                updateBlock(block.id, { items: newItems });
                              }}>
                              <Plus className="h-4 w-4 mr-2" /> Add Grid Item
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* ── FAQ ── */}
                      {block.type === 'faq' && (
                        <div className="space-y-8">
                          {block.categories?.map((cat: any, catIndex: number) => (
                            <div key={catIndex} className="space-y-4 p-4 border rounded-xl bg-slate-50 border-slate-200">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 max-w-sm space-y-2">
                                  <Label className="text-xs font-bold uppercase text-slate-500">Category Name</Label>
                                  <Input className="bg-white font-bold" value={cat.name || ''} onChange={e => {
                                    const newCats = [...block.categories];
                                    newCats[catIndex] = { ...newCats[catIndex], name: e.target.value };
                                    updateBlock(block.id, { categories: newCats });
                                  }} />
                                </div>
                                <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700"
                                  onClick={() => {
                                    const newCats = block.categories.filter((_: any, i: number) => i !== catIndex);
                                    updateBlock(block.id, { categories: newCats });
                                  }}>
                                  <Trash2 className="h-4 w-4 mr-2" /> Remove Category
                                </Button>
                              </div>
                              <div className="space-y-4 pl-4 border-l-2 border-slate-200 mt-4">
                                <Label className="text-xs font-bold uppercase text-slate-500">Questions & Answers</Label>
                                {cat.questions?.map((q: any, qIndex: number) => (
                                  <div key={qIndex} className="space-y-3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative group">
                                    <Button type="button" variant="ghost" size="sm"
                                      className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border shadow-sm text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        const newQuestions = cat.questions.filter((_: any, i: number) => i !== qIndex);
                                        const newCats = [...block.categories];
                                        newCats[catIndex] = { ...newCats[catIndex], questions: newQuestions };
                                        updateBlock(block.id, { categories: newCats });
                                      }}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <div className="space-y-2">
                                      <Label className="text-[10px] uppercase text-slate-400 font-bold">Question</Label>
                                      <Input placeholder="What is your question?" value={q.q || ''} onChange={e => {
                                        const newQuestions = [...cat.questions];
                                        newQuestions[qIndex] = { ...newQuestions[qIndex], q: e.target.value };
                                        const newCats = [...block.categories];
                                        newCats[catIndex] = { ...newCats[catIndex], questions: newQuestions };
                                        updateBlock(block.id, { categories: newCats });
                                      }} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-[10px] uppercase text-slate-400 font-bold">Answer</Label>
                                      <Textarea placeholder="Provide the answer here..." value={q.a || ''} onChange={e => {
                                        const newQuestions = [...cat.questions];
                                        newQuestions[qIndex] = { ...newQuestions[qIndex], a: e.target.value };
                                        const newCats = [...block.categories];
                                        newCats[catIndex] = { ...newCats[catIndex], questions: newQuestions };
                                        updateBlock(block.id, { categories: newCats });
                                      }} />
                                    </div>
                                  </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="w-full text-xs font-medium h-8 bg-white border-dashed"
                                  onClick={() => {
                                    const newQuestions = [...(cat.questions || []), { q: '', a: '' }];
                                    const newCats = [...block.categories];
                                    newCats[catIndex] = { ...newCats[catIndex], questions: newQuestions };
                                    updateBlock(block.id, { categories: newCats });
                                  }}>
                                  <Plus className="h-3 w-3 mr-2" /> Add Question
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button type="button" variant="outline" className="w-full border-dashed py-6 flex flex-col gap-2"
                            onClick={() => {
                              const newCats = [...(block.categories || []), { name: 'New Category', questions: [] }];
                              updateBlock(block.id, { categories: newCats });
                            }}>
                            <Plus className="h-5 w-5 text-blue-600" />
                            <span className="font-semibold text-sm">Add FAQ Category</span>
                          </Button>
                        </div>
                      )}

                      {/* ── FORM ── */}
                      {block.type === 'form' && (
                        <div className="space-y-2">
                          <Label>Form Type</Label>
                          <Select value={block.formType || 'support'} onValueChange={val => updateBlock(block.id, { formType: val })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="support">Support Ticket</SelectItem>
                              <SelectItem value="contact">Contact Form</SelectItem>
                              <SelectItem value="career">Career Application</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* ── SIDEBAR SECTION ── */}
                      {block.type === 'sidebar_section' && (
                        <div className="space-y-8">
                          {/* Layout Settings Panel */}
                          <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                              <Layout className="h-4 w-4 text-blue-600" />
                              Sidebar Settings
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-600">Sidebar Position</Label>
                                <Select 
                                  value={block.layout?.side || 'right'} 
                                  onValueChange={val => updateBlock(block.id, { layout: { ...block.layout, side: val } })}
                                >
                                  <SelectTrigger className="bg-white border-slate-200"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="right">Right Side</SelectItem>
                                    <SelectItem value="left">Left Side</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-600">Scroll Behaviour</Label>
                                <Select 
                                  value={block.layout?.sticky === false ? 'scroll' : 'sticky'} 
                                  onValueChange={val => updateBlock(block.id, { layout: { ...block.layout, sticky: val === 'sticky' } })}
                                >
                                  <SelectTrigger className="bg-white border-slate-200"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="sticky">Sticky (Floats alongside content)</SelectItem>
                                    <SelectItem value="scroll">Normal (Scrolls with page)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-600">Sidebar Width</Label>
                                <Select 
                                  value={block.layout?.width || 'normal'} 
                                  onValueChange={val => updateBlock(block.id, { layout: { ...block.layout, width: val } })}
                                >
                                  <SelectTrigger className="bg-white border-slate-200"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="narrow">Narrow (25%)</SelectItem>
                                    <SelectItem value="normal">Normal (33%)</SelectItem>
                                    <SelectItem value="wide">Wide (41%)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-base font-bold">Main Content</Label>
                            <Editor value={block.content || ''} onChange={content => updateBlock(block.id, { content })} />
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-bold">Sidebar Items (Right)</Label>
                              <Button type="button" variant="outline" size="sm"
                                onClick={() => {
                                  const newSidebar = [...(block.sidebar || []), { title: 'New Item', type: 'text', content: '' }];
                                  updateBlock(block.id, { sidebar: newSidebar });
                                }}>
                                <Plus className="h-4 w-4 mr-2" /> Add Sidebar Item
                              </Button>
                            </div>
                            {block.sidebar?.map((sidebarItem: any, sbIndex: number) => (
                              <Card key={sbIndex} className="bg-slate-50 border-slate-200">
                                <CardContent className="p-4 space-y-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Item {sbIndex + 1}</span>
                                    <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-red-500 hover:text-red-700"
                                      onClick={() => {
                                        const newSidebar = block.sidebar.filter((_: any, i: number) => i !== sbIndex);
                                        updateBlock(block.id, { sidebar: newSidebar });
                                      }}>
                                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-xs">Title</Label>
                                      <Input className="bg-white h-9" value={sidebarItem.title || ''} onChange={e => {
                                        const newSidebar = [...block.sidebar];
                                        newSidebar[sbIndex] = { ...newSidebar[sbIndex], title: e.target.value };
                                        updateBlock(block.id, { sidebar: newSidebar });
                                      }} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs">Type</Label>
                                      <Select value={sidebarItem.type || 'text'} onValueChange={val => {
                                        const newSidebar = [...block.sidebar];
                                        newSidebar[sbIndex] = { ...newSidebar[sbIndex], type: val };
                                        if (val === 'links' && !newSidebar[sbIndex].links) {
                                          newSidebar[sbIndex].links = [{ label: 'Link 1', href: '#' }];
                                        }
                                        updateBlock(block.id, { sidebar: newSidebar });
                                      }}>
                                        <SelectTrigger className="bg-white h-9 text-sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="text">Text / Info</SelectItem>
                                          <SelectItem value="links">Quick Links</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                      {sidebarItem.type === 'links' ? (
                                        <div className="space-y-3">
                                          <Label className="text-xs">Links</Label>
                                          {sidebarItem.links?.map((link: any, linkIndex: number) => (
                                            <div key={linkIndex} className="flex gap-2 items-center">
                                              <Input className="bg-white" placeholder="Label" value={link.label || ''} onChange={e => {
                                                const newSidebar = [...block.sidebar];
                                                newSidebar[sbIndex].links[linkIndex].label = e.target.value;
                                                updateBlock(block.id, { sidebar: newSidebar });
                                              }} />
                                              <Input className="bg-white" placeholder="URL" value={link.href || ''} onChange={e => {
                                                const newSidebar = [...block.sidebar];
                                                newSidebar[sbIndex].links[linkIndex].href = e.target.value;
                                                updateBlock(block.id, { sidebar: newSidebar });
                                              }} />
                                              <Button type="button" variant="ghost" size="icon"
                                                onClick={() => {
                                                  const newSidebar = [...block.sidebar];
                                                  newSidebar[sbIndex].links = newSidebar[sbIndex].links.filter((_: any, i: number) => i !== linkIndex);
                                                  updateBlock(block.id, { sidebar: newSidebar });
                                                }}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                              </Button>
                                            </div>
                                          ))}
                                          <Button type="button" variant="outline" size="sm" className="w-full text-xs"
                                            onClick={() => {
                                              const newSidebar = [...block.sidebar];
                                              if (!newSidebar[sbIndex].links) newSidebar[sbIndex].links = [];
                                              newSidebar[sbIndex].links.push({ label: 'New Link', href: '#' });
                                              updateBlock(block.id, { sidebar: newSidebar });
                                            }}>
                                            Add Link
                                          </Button>
                                        </div>
                                      ) : (
                                        <>
                                          <Label className="text-xs">Content</Label>
                                          <Textarea className="bg-white" rows={3} value={sidebarItem.content || ''} onChange={e => {
                                            const newSidebar = [...block.sidebar];
                                            newSidebar[sbIndex] = { ...newSidebar[sbIndex], content: e.target.value };
                                            updateBlock(block.id, { sidebar: newSidebar });
                                          }} />
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              </SortableBlockWrapper>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add block panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4 text-blue-600" />
          Add Content Block
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {BLOCK_TYPES.map(bt => (
            <Button
              key={bt.type}
              type="button"
              variant="outline"
              className="flex flex-col h-auto py-4 gap-2 border-dashed hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all"
              onClick={() => addBlock(bt.type)}
            >
              <bt.icon className="h-5 w-5" />
              <span className="text-xs">{bt.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
