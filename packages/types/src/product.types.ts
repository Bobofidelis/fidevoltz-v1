export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  costPrice?: number;
  currency: string;
  stock: number;
  minStock: number;
  sku: string | null;
  images: string[];
  image: string | null; // Deprecated
  datasheet?: string | null;
  specifications?: Record<string, string> | null; // JSON object
  tags: string[];
  status: ProductStatus;
  allowReviews: boolean;
  categoryId: string;
  category?: Category;
  // UI Enrichment fields (Optional as they may not be in DB)
  badge?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  shortDescription?: string;
  originalPrice?: number;
  inStock?: boolean;
  stockQuantity?: number;
  slug?: string;
  // End UI enrichment
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock?: number;
  sku?: string;
  images?: string[];
  datasheet?: string;
  specifications?: Record<string, string>;
  tags?: string[];
  status?: ProductStatus;
  allowReviews?: boolean;
  categoryId: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  costPrice?: number;
  stock?: number;
  minStock?: number;
  sku?: string;
  images?: string[];
  datasheet?: string;
  specifications?: Record<string, string>;
  tags?: string[];
  status?: ProductStatus;
  allowReviews?: boolean;
  categoryId?: string;
}

export interface CreateCategoryDto {
  name: string;
}
