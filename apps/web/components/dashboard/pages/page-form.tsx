"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BlockEditor } from './block-editor';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Save, Eye, Globe, Lock, FileText, Search } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface PageFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    content: any[];
    isPublished: boolean;
    seoTitle?: string;
    seoDesc?: string;
  };
  mode: 'create' | 'edit';
}

export function PageForm({ initialData, mode }: PageFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: Array.isArray(initialData?.content) 
      ? initialData?.content 
      : (initialData?.content && typeof initialData.content === 'object' && (initialData.content as any).type === 'doc')
        ? [{ type: 'text', content: initialData.content }]
        : [] as any[],
    isPublished: initialData?.isPublished ?? true,
    seoTitle: initialData?.seoTitle || '',
    seoDesc: initialData?.seoDesc || '',
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = mode === 'create' 
        ? '/api/admin/pages' 
        : `/api/admin/pages/${initialData?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PATCH';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save page');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success(`Page ${mode === 'create' ? 'created' : 'updated'} successfully`);
      router.push('/dashboard/pages');
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSave = () => {
    if (!formData.title || !formData.slug) {
      toast.error('Please fill in all required fields');
      return;
    }
    mutation.mutate(formData);
  };

  // Auto-generate slug from title if in create mode and slug is empty
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    if (mode === 'create' && (!formData.slug || formData.slug === formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))) {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, title, slug }));
    } else {
      setFormData(prev => ({ ...prev, title }));
    }
  };

  return (
    // NOT a form element — buttons use onClick instead of submit to prevent accidental page close
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/pages">
          <Button type="button" variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Create New Page' : 'Edit Page'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {mode === 'create' ? 'Add a new static page to your site' : 'Update page content and settings'}
          </p>
        </div>
        {/* Status badge */}
        <Badge
          className={formData.isPublished 
            ? 'bg-green-100 text-green-700 border-green-200' 
            : 'bg-slate-100 text-slate-600 border-slate-200'}
          variant="outline"
        >
          {formData.isPublished ? (
            <><Globe className="h-3 w-3 mr-1" /> Published</>
          ) : (
            <><Lock className="h-3 w-3 mr-1" /> Draft</>
          )}
        </Badge>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left — Page Content (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Title card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-blue-600" />
                Page Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  placeholder="e.g. Shipping Information"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="text-lg font-medium"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Blocks Content <span className="text-red-500">*</span></Label>
                  <span className="text-xs text-slate-400">
                    {formData.content.length} block{formData.content.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <BlockEditor
                  blocks={formData.content}
                  onChange={(blocks) => setFormData(prev => ({ ...prev, content: blocks }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4 text-green-600" />
                Search Engine Optimization
              </CardTitle>
              <CardDescription>Optimize how this page appears in search results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  placeholder={formData.title || "Leave blank to use page title"}
                  value={formData.seoTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                />
                <p className="text-xs text-slate-400">
                  {(formData.seoTitle || formData.title).length}/60 characters
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="seoDesc">Meta Description</Label>
                <Textarea
                  id="seoDesc"
                  placeholder="Brief summary for search results (150-160 characters ideal)"
                  value={formData.seoDesc}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoDesc: e.target.value }))}
                  rows={3}
                />
                <p className="text-xs text-slate-400">{formData.seoDesc.length}/160 characters</p>
              </div>

              {/* Google Preview */}
              {(formData.title || formData.seoTitle) && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Google Preview</p>
                  <p className="text-blue-700 font-medium text-sm leading-snug hover:underline cursor-pointer">
                    {formData.seoTitle || formData.title}
                  </p>
                  <p className="text-green-700 text-xs mt-0.5">
                    yourdomain.com/{formData.slug || '...'}
                  </p>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed line-clamp-2">
                    {formData.seoDesc || 'No description provided. Add a meta description to improve search visibility.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — Settings sidebar (1/3 width) */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Page Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug <span className="text-red-500">*</span></Label>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-sm flex-shrink-0">/</span>
                  <Input
                    id="slug"
                    placeholder="e.g. shipping-info"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                    className="font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  yourdomain.com/<strong className="text-slate-600">{formData.slug || '...'}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.isPublished ? "published" : "draft"}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, isPublished: val === "published" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-600" />
                        Published
                      </div>
                    </SelectItem>
                    <SelectItem value="draft">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-slate-500" />
                        Draft
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {mode === 'edit' && formData.slug && (
                <Link href={`/${formData.slug}`} target="_blank">
                  <Button type="button" variant="outline" className="w-full gap-2 mt-2">
                    <Eye className="h-4 w-4" />
                    View Live Page
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Quick tips */}
          <Card className="bg-blue-50 border-blue-100 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-blue-800">📌 Tips</p>
              <ul className="text-xs text-blue-700 space-y-1.5">
                <li>• Add a <strong>Hero</strong> block at the top for visual impact</li>
                <li>• Use <strong>FAQ</strong> blocks for support pages</li>
                <li>• Use <strong>Grid</strong> blocks to highlight features</li>
                <li>• Keep meta descriptions under 160 characters</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Save Bar — always visible, no form submit needed */}
      <div className="fixed bottom-6 right-6 md:right-8 z-50 flex items-center gap-3 bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-200">
        <Link href="/dashboard/pages">
          <Button type="button" variant="outline" size="sm">Cancel</Button>
        </Link>
        <Button
          type="button"
          onClick={handleSave}
          disabled={mutation.isPending}
          className="gap-2 shadow-md px-5"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Page
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
