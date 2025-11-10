// Product types for Firestore-based product management
export interface Product {
  id: string; // Firestore document ID
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
  // Additional Firestore-specific fields
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // User ID who created the product
  isActive: boolean; // For soft delete/draft functionality
  inventory: {
    stock: number;
    sku?: string;
    trackInventory: boolean;
  };
  seo?: {
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
  };
  tags?: string[];
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Size", "Color"
  options: string[]; // e.g., ["Small", "Medium", "Large"] or ["Red", "Blue", "Green"]
  priceModifier?: number; // Additional cost for this variant
}

export interface ProductFormData {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  stock: number;
  sku?: string;
  trackInventory: boolean;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
}

export interface ProductCreateData {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  stock: number;
  sku?: string;
  trackInventory: boolean;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
}

export interface ProductUpdateData {
  title?: string;
  price?: number;
  description?: string;
  category?: string;
  image?: string;
  stock?: number;
  sku?: string;
  trackInventory?: boolean;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isActive?: boolean;
  tags?: string[];
  searchTerm?: string;
}

export interface ProductSort {
  field: 'title' | 'price' | 'createdAt' | 'updatedAt' | 'rating.rate';
  direction: 'asc' | 'desc';
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export type ProductsResponseLegacy = Product[]; // For backward compatibility