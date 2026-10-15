"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { CategoryForm } from '@/components/categories/category-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Package,
  Pencil,
  Trash2,
  Loader2,
  Search,
  X,
  AlertTriangle,
  FolderTree,
} from "lucide-react";
import { toast } from 'sonner';

interface CategoryItem {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  _count: {
    products: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit category state
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete category state
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } else {
        toast.error('Failed to load categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Error loading categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Open Edit dialog and populate fields
  const handleOpenEdit = (category: CategoryItem) => {
    setCategoryToEdit(category);
    setEditName(category.name);
    setEditSlug(category.slug || '');
    setEditDescription(category.description || '');
  };

  // Submit Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToEdit) return;

    if (!editName.trim()) {
      toast.error('Category name is required');
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/categories/${categoryToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          slug: editSlug.trim() || undefined,
          description: editDescription.trim() || undefined,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success(`Category "${result.data.name}" updated successfully`);
        setCategories((prev) =>
          prev.map((c) => (c.id === categoryToEdit.id ? { ...c, ...result.data } : c))
        );
        setCategoryToEdit(null);
      } else {
        toast.error(result.error || 'Failed to update category');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      toast.error('Failed to update category');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Submit Delete
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      });
      const result = await res.json();

      if (res.ok && result.success) {
        toast.success(`Category "${categoryToDelete.name}" deleted successfully`);
        setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
        setCategoryToDelete(null);
      } else {
        toast.error(result.error || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered categories by search
  const filteredCategories = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        (cat.slug || '').toLowerCase().includes(q) ||
        (cat.description || '').toLowerCase().includes(q)
    );
  }, [categories, searchTerm]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Navigation & Header */}
      <div>
        <Link href="/dashboard/products">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Product Categories</h1>
            <p className="text-muted-foreground mt-1">
              Create, edit, and organize categories for your product catalog.
            </p>
          </div>
          <Link href="/dashboard/products/add">
            <Button>
              <Package className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Create Form */}
        <div className="lg:col-span-4">
          <CategoryForm onSuccess={fetchCategories} />
        </div>

        {/* Right Column: Categories Table */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">
                    Existing Categories ({categories.length})
                  </CardTitle>
                  <CardDescription>
                    All product categories currently defined in your store.
                  </CardDescription>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-8 h-9 text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/75 hover:bg-slate-50/75">
                      <TableHead className="font-semibold min-w-[150px]">Name</TableHead>
                      <TableHead className="font-semibold min-w-[130px]">Slug</TableHead>
                      <TableHead className="font-semibold min-w-[180px]">Description</TableHead>
                      <TableHead className="font-semibold text-center w-[110px]">Products</TableHead>
                      <TableHead className="font-semibold text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                          <p className="text-sm text-muted-foreground mt-2">Loading categories...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          <FolderTree className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                          <p className="font-medium text-slate-700">
                            {searchTerm
                              ? 'No categories match your search.'
                              : 'No categories created yet.'}
                          </p>
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="text-xs text-blue-600 hover:underline mt-1"
                            >
                              Clear search query
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCategories.map((category) => (
                        <TableRow key={category.id} className="hover:bg-slate-50/50">
                          {/* Name */}
                          <TableCell className="font-medium text-slate-900">
                            {category.name}
                          </TableCell>

                          {/* Slug */}
                          <TableCell>
                            {category.slug ? (
                              <code className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                                {category.slug}
                              </code>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">None</span>
                            )}
                          </TableCell>

                          {/* Description */}
                          <TableCell className="text-sm text-muted-foreground max-w-[220px]">
                            {category.description ? (
                              <span className="line-clamp-2" title={category.description}>
                                {category.description}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No description</span>
                            )}
                          </TableCell>

                          {/* Product Count */}
                          <TableCell className="text-center">
                            <Badge
                              variant="secondary"
                              className={
                                category._count.products > 0
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'text-slate-500'
                              }
                            >
                              {category._count.products}{' '}
                              {category._count.products === 1 ? 'item' : 'items'}
                            </Badge>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-600 hover:text-slate-900"
                                onClick={() => handleOpenEdit(category)}
                                title="Edit Category"
                              >
                                <Pencil className="w-4 h-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setCategoryToDelete(category)}
                                title="Delete Category"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
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
      </div>

      {/* Edit Category Dialog */}
      <Dialog
        open={!!categoryToEdit}
        onOpenChange={(open) => {
          if (!open) setCategoryToEdit(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveEdit}>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update category details and slug below.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Category Name"
                  disabled={isSavingEdit}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Slug <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Input
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  placeholder="category-slug"
                  disabled={isSavingEdit}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Description <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Category description..."
                  rows={3}
                  disabled={isSavingEdit}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryToEdit(null)}
                disabled={isSavingEdit}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingEdit}>
                {isSavingEdit ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete category{' '}
              <span className="font-semibold text-slate-900">
                &ldquo;{categoryToDelete?.name}&rdquo;
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {categoryToDelete && categoryToDelete._count.products > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2.5 text-amber-800 text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Contains Associated Products</p>
                <p className="text-xs mt-0.5 text-amber-700">
                  This category contains {categoryToDelete._count.products} product
                  {categoryToDelete._count.products === 1 ? '' : 's'}. You must reassign
                  or delete these products before deleting this category.
                </p>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={isDeleting || (categoryToDelete?._count.products ?? 0) > 0}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Category'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
