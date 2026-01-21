import { Role } from '@fidevoltz/types';

export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  categoryId: string;
  brand?: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  stock: number;
  stockQuantity?: number;
  inStock: boolean;
  minStock: number;
  sku?: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'OUT_OF_STOCK';
  tags: string[];
  specifications?: Record<string, any>;
  createdAt: Date | string;
  updatedAt: Date | string;
}
