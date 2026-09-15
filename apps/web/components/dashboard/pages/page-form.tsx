"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BlockEditor } from './block-editor';
import { SidebarSettings } from '@/components/dashboard/SidebarSettings';
import { SidebarEditor } from '@/components/dashboard/SidebarEditor';
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
    sidebar?: any[];
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
    sidebar: Array.isArray(initialData?.sidebar) ? initialData.sidebar : [],
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left — Page Content (Full width now that sidebar is in a sheet) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Title card */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4 bg-slate-50/50 border-b">
              <CardTitle className="flex items-center gap-2 text-base text-slate-800">
                <FileText className="h-4 w-4 text-blue-600" />
                Page Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-700">Page Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  placeholder="e.g. Shipping Information"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="text-lg font-medium border-slate-300 focus-visible:ring-blue-500"
                />
              </div>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-700">Blocks Content <span className="text-red-500">*</span></Label>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {formData.content.length} block{formData.content.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1">
                  <BlockEditor
                    blocks={formData.content}
                    onChange={(blocks) => setFormData(prev => ({ ...prev, content: blocks }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — Quick tips */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="bg-blue-50/80 border-blue-100 shadow-sm sticky top-24">
            <CardContent className="p-5 space-y-3">
              <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                <span className="text-lg">💡</span> Pro Tips
              </p>
              <ul className="text-sm text-blue-800/90 space-y-2.5">
                <li className="flex gap-2 leading-tight">
                  <span className="text-blue-400">•</span>
                  <span>Add a <strong>Hero</strong> block at the top for visual impact.</span>
                </li>
                <li className="flex gap-2 leading-tight">
                  <span className="text-blue-400">•</span>
                  <span>Use <strong>FAQ</strong> blocks for support pages.</span>
                </li>
                <li className="flex gap-2 leading-tight">
                  <span className="text-blue-400">•</span>
                  <span>Keep meta descriptions under 160 characters in settings.</span>
                </li>
                <li className="flex gap-2 leading-tight">
                  <span className="text-blue-400">•</span>
                  <span>Click <strong>Page Settings</strong> below to configure SEO and URL.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Save Bar — always visible */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:transform-none md:right-8 z-50 flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md px-4 sm:px-5 py-3 sm:py-3.5 rounded-full shadow-2xl border border-slate-200 w-[95%] md:w-auto overflow-x-auto">
        <Link href="/dashboard/pages" className="shrink-0">
          <Button type="button" variant="ghost" size="sm" className="rounded-full hover:bg-slate-100">Cancel</Button>
        </Link>
        
        <div className="w-px h-6 bg-slate-200 shrink-0 mx-1" />

        <SidebarEditor 
          blocks={formData.sidebar as any} 
          onSave={(blocks) => setFormData(prev => ({ ...prev, sidebar: blocks as any }))}
          triggerLabel="Edit Public Sidebar"
          triggerClassName="rounded-full shrink-0"
        />

        <SidebarEditor 
          blocks={formData.content as any} 
          onSave={(blocks) => setFormData(prev => ({ ...prev, content: blocks as any }))}
          triggerLabel="Block Editor"
          triggerClassName="rounded-full shrink-0"
        />

        <SidebarSettings 
          triggerLabel="Page Settings"
          triggerClassName="rounded-full shrink-0"
          data={{
            status: formData.isPublished ? "PUBLISHED" : "DRAFT",
            slug: formData.slug,
            seoTitle: formData.seoTitle,
            seoDescription: formData.seoDesc,
          }}
          onSave={(data) => {
            setFormData(prev => ({
              ...prev,
              isPublished: data.status === "PUBLISHED",
              slug: data.slug || prev.slug,
              seoTitle: data.seoTitle || prev.seoTitle,
              seoDesc: data.seoDescription || prev.seoDesc,
            }));
          }}
        />

        <Button
          type="button"
          onClick={handleSave}
          disabled={mutation.isPending}
          className="gap-2 shadow-md px-6 rounded-full shrink-0 bg-blue-600 hover:bg-blue-700 text-white ml-auto"
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
