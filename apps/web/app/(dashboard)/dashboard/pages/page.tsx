"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Loader2,
  FileText,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function PagesDashboard() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const res = await fetch('/api/admin/pages');
      if (!res.ok) throw new Error('Failed to fetch pages');
      const json = await res.json();
      return json.data || [];
    },
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete page');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Page deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete page');
    },
  });

  const filteredPages = pages?.filter((page: any) =>
    page.title.toLowerCase().includes(search.toLowerCase()) ||
    page.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      deletePage.mutate(id);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Pages
          </h1>
          <p className="text-gray-500 mt-1">Manage static content and legal pages</p>
        </div>
        <Link href="/dashboard/pages/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Page
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Title</TableHead>
                  <TableHead>URL Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPages?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                      No pages found. Create your first page!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPages?.map((page: any) => (
                    <TableRow key={page.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          {page.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                          /{page.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={page.isPublished ? "default" : "secondary"}>
                          {page.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/${page.slug}`} target="_blank">
                              <DropdownMenuItem>
                                <Globe className="h-4 w-4 mr-2" />
                                View Live
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/dashboard/pages/${page.id}`}>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(page.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
