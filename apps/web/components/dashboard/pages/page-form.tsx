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
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
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
    content: initialData?.content || [] as any[],
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.content || (Array.isArray(formData.content) && formData.content.length === 0)) {
      toast.error('Please fill in all required fields and add at least one block');
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/pages">
            <Button type="button" variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Create New Page' : 'Edit Page'}
            </h1>
            <p className="text-sm text-gray-500">
              {mode === 'create' ? 'Add a new static page to your site' : 'Update page content and settings'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/pages">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Page
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  placeholder="e.g. Shipping Information"
                  value={formData.title}
                  onChange={handleTitleChange}
                />
              </div>
              
              <div className="space-y-4">
                <Label>Blocks Content <span className="text-red-500">*</span></Label>
                <BlockEditor
                  blocks={formData.content}
                  onChange={(blocks) => setFormData(prev => ({ ...prev, content: blocks }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search Engine Optimization (SEO)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  placeholder="Leave blank to use page title"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="seoDesc">Meta Description</Label>
                <Input
                  id="seoDesc"
                  placeholder="Brief summary for search results"
                  value={formData.seoDesc}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoDesc: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug <span className="text-red-500">*</span></Label>
                <Input
                  id="slug"
                  placeholder="e.g. shipping-info"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                />
                <p className="text-xs text-gray-500">
                  Visible at: yourdomain.com/{formData.slug || '...'}
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
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
