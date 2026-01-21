'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type CategoryFormValues = z.infer<typeof formSchema>;

export const CategoryForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      toast.success('Category created');
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Create New Category</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input disabled={loading} placeholder="Category name" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button disabled={loading} className="w-full" type="submit">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Plus className="w-4 h-4 mr-2" />}
                    Create Category
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
};
