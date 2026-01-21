'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, Plus, X, Upload, FileText, Trash, ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';

import { MediaPicker } from '@/components/media/MediaPicker';
import { ProductStatus } from '@fidevoltz/types';

// Schema definition
const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0),
  costPrice: z.coerce.number().optional(),
  stock: z.coerce.number().int().min(0),
  minStock: z.coerce.number().int().min(0).default(0),
  sku: z.string().optional(),
  categoryId: z.string().min(1, 'Please select a category'),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
  images: z.array(z.string()).default([]),
  datasheet: z.string().optional().nullable(),
  specifications: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string()).default([]),
  allowReviews: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any; // Replace with proper type
  categories: { id: string; name: string }[];
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [specKeys, setSpecKeys] = useState<{ key: string; value: string }[]>(
    initialData?.specifications 
      ? Object.entries(initialData.specifications).map(([key, value]) => ({ key, value: value as string }))
      : []
  );
  const [newTag, setNewTag] = useState('');

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: (initialData ? {
      ...initialData,
      price: parseFloat(initialData.price),
      costPrice: initialData.costPrice ? parseFloat(initialData.costPrice) : undefined,
      tags: initialData.tags || [],
      images: initialData.images || (initialData.image ? [initialData.image] : []),
      datasheet: initialData.datasheet || null,
      specifications: initialData.specifications || undefined,
      sku: initialData.sku || '',
    } : {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      minStock: 0,
      sku: '',
      status: ProductStatus.DRAFT,
      images: [],
      tags: [],
      allowReviews: true,
      categoryId: '',
      datasheet: null,
      specifications: undefined,
      costPrice: 0,
    }) as any,
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      
      // Convert specKeys array back to object
      const specifications = specKeys.reduce((acc, curr) => {
        if (curr.key && curr.value) {
          acc[curr.key] = curr.value;
        }
        return acc;
      }, {} as Record<string, string>);

      const payload = { ...data, specifications };

      if (initialData) {
        // Update
        const res = await fetch(`/api/admin/products/${initialData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update product');
        toast.success('Product updated successfully');
      } else {
        // Create
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create product');
        toast.success('Product created successfully');
      }
      
      router.push('/dashboard/products');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const addSpec = () => {
    setSpecKeys([...specKeys, { key: '', value: '' }]);
  };

  const removeSpec = (index: number) => {
    setSpecKeys(specKeys.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
    const newSpecs = [...specKeys];
    newSpecs[index][field] = val;
    setSpecKeys(newSpecs);
  };

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = form.getValues('tags');
      if (!currentTags.includes(newTag.trim())) {
        form.setValue('tags', [...currentTags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-4">
               <TabsList>
                 <TabsTrigger value="general">General</TabsTrigger>
                 <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
                 <TabsTrigger value="media">Media & Files</TabsTrigger>
                 <TabsTrigger value="specs">Specifications</TabsTrigger>
               </TabsList>
               
               <div className="flex items-center gap-2">
                 <Button type="submit" disabled={loading}>
                   {loading ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       Saving...
                     </>
                   ) : (
                     'Save Product'
                   )}
                 </Button>
               </div>
            </div>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Product name, description and categorization</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control as any}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Arduino Uno R3" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control as any}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                                placeholder="Detailed product description..." 
                                className="min-h-[150px]"
                                {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control as any}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>Category</FormLabel>
                              <Link href="/dashboard/categories" className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
                                Manage Categories
                              </Link>
                            </div>
                            {categories.length === 0 ? (
                                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                                    No categories found. <Link href="/dashboard/categories" className="underline hover:text-amber-800 font-medium">Create one first</Link>.
                                </div>
                            ) : (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control as any}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. PROD-001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-2">
                   <CardHeader>
                     <CardTitle>Settings & Tags</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      <FormField
                        control={form.control as any}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.values(ProductStatus).map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-center space-x-2">
                        <FormField
                          control={form.control as any}
                          name="allowReviews"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Allow Reviews</FormLabel>
                                <FormDescription>
                                  Customers can leave reviews on this product
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                          <FormLabel>Tags</FormLabel>
                          <div className="flex gap-2">
                              <Input 
                                  value={newTag} 
                                  onChange={(e) => setNewTag(e.target.value)}
                                  placeholder="Add tag and press Enter"
                                  onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                          e.preventDefault();
                                          addTag();
                                      }
                                  }}
                              />
                              <Button type="button" variant="secondary" onClick={addTag}>Add</Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                              {form.watch('tags').map((tag, i) => (
                                  <Badge key={i} variant="secondary">
                                      {tag}
                                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                                          <X className="w-3 h-3" />
                                      </button>
                                  </Badge>
                              ))}
                          </div>
                      </div>
                   </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Inventory (Currency: NGN)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control as any}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Selling Price (₦)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="costPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost Price (₦)</FormLabel>
                            <FormDescription>For internal profit calculation</FormDescription>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control as any}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Stock</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="minStock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Stock Level</FormLabel>
                            <FormDescription>Alert/Icon when stock goes below this</FormDescription>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                   </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <Card>
                 <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                    <CardDescription>Upload one or more images. First one is the main image.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <FormField
                        control={form.control as any}
                        name="images"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {field.value.map((url: string, index: number) => (
                                                <div key={index} className="relative aspect-square border rounded-md overflow-hidden group">
                                                    <img src={url} alt={`Product ${index}`} className="object-cover w-full h-full" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newImages = [...field.value];
                                                            newImages.splice(index, 1);
                                                            field.onChange(newImages);
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    {index === 0 && (
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-1">
                                                            Main Image
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            <MediaPicker
                                                mediaType="IMAGE"
                                                onChange={(item: any) => {
                                                    field.onChange([...field.value, item.secureUrl]);
                                                }}
                                            >
                                                <div className="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                                                    <Plus className="w-8 h-8 text-slate-400" />
                                                    <span className="text-sm text-slate-500 mt-2">Add Image</span>
                                                </div>
                                            </MediaPicker>
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                 </CardContent>
              </Card>

              <Card>
                  <CardHeader>
                      <CardTitle>Datasheet / Documentation</CardTitle>
                      <CardDescription>Optional PDF or document for technical specs</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <FormField
                          control={form.control as any}
                          name="datasheet"
                          render={({ field }) => (
                              <FormItem>
                                  <FormControl>
                                      <div className="flex items-center gap-4">
                                          {field.value ? (
                                              <div className="flex items-center gap-4 border p-4 rounded-md w-full">
                                                  <FileText className="w-8 h-8 text-blue-500" />
                                                  <div className="flex-1 overflow-hidden">
                                                      <p className="text-sm font-medium truncate">{field.value.split('/').pop()}</p>
                                                      <a href={field.value} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">View Document</a>
                                                  </div>
                                                  <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => field.onChange(null)}
                                                  >
                                                      <Trash className="w-4 h-4 text-red-500" />
                                                  </Button>
                                              </div>
                                          ) : (
                                              <MediaPicker
                                                  mediaType="DOCUMENT"
                                                  onChange={(item: any) => field.onChange(item.secureUrl)}
                                              >
                                                  <Button type="button" variant="outline">
                                                      <Upload className="w-4 h-4 mr-2" />
                                                      Upload Datasheet
                                                  </Button>
                                              </MediaPicker>
                                          )}
                                      </div>
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                  </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specs" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Technical Specifications</CardTitle>
                        <CardDescription>Add key-value pairs for technical details (e.g. Voltage: 5V)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {specKeys.map((spec, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <div className="flex-1">
                                    <Input 
                                        placeholder="Specification (e.g. Input Voltage)" 
                                        value={spec.key}
                                        onChange={(e) => updateSpec(index, 'key', e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Input 
                                        placeholder="Value (e.g. 5V - 12V)" 
                                        value={spec.value}
                                        onChange={(e) => updateSpec(index, 'value', e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeSpec(index)}
                                >
                                    <Trash className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addSpec} className="w-full">
                            <Plus className="w-4 h-4 mr-2" /> Add Specification
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
