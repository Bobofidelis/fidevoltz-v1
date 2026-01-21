"use client";

import { PageForm } from '@/components/dashboard/pages/page-form';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import { useMemo, use } from 'react';

export default function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: page, isLoading, isError } = useQuery({
    queryKey: ['page', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/pages/${id}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch page');
      }
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError || !page) {
    notFound();
  }

  return <PageForm mode="edit" initialData={page} />;
}
