import { 
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { auth, db } from "../firebase/index";
import type { 
  Product, 
  ProductCreateData, 
  ProductUpdateData, 
  ProductFilters, 
  ProductSort,
  ProductsResponse 
} from "../types/productType";

/**
 * Product Management Service
 * Custom CRUD Operations for Product Management in Firestore
 * Comprehensive product service with advanced filtering and management features
 */

// ========================================
// CREATE Operations
// ========================================

/**
 * Create a new product in Firestore
 */
export const createProduct = async (productData: ProductCreateData): Promise<Product> => {
  try {
    console.log("🛍️ Creating product with data:", productData);
    
    const user = auth.currentUser;
    if (!user) {
      console.error("❌ User not authenticated");
      throw new Error("User must be authenticated to create products");
    }

    console.log("✅ User authenticated:", user.uid);

    // Validate required fields
    if (!productData.title || !productData.category || !productData.description) {
      console.error("❌ Missing required fields:", {
        title: !!productData.title,
        category: !!productData.category,
        description: !!productData.description
      });
      throw new Error("Title, category, and description are required");
    }

    if (productData.price <= 0) {
      console.error("❌ Invalid price:", productData.price);
      throw new Error("Price must be greater than 0");
    }

    // Generate a new document reference with unique ID
    const productRef = doc(collection(db, "products"));
    console.log("📝 Generated product ref:", productRef.id);
    
    // Prepare product data with Firestore fields
    const product: Omit<Product, 'id'> = {
      title: productData.title,
      price: productData.price,
      description: productData.description,
      category: productData.category,
      image: productData.image || '',
      rating: {
        rate: 0,
        count: 0
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.uid,
      isActive: productData.isActive ?? true,
      inventory: {
        stock: productData.stock || 0,
        sku: productData.sku || '',
        trackInventory: productData.trackInventory ?? true
      },
      seo: {
        slug: generateSlug(productData.title),
        metaTitle: productData.metaTitle || productData.title,
        metaDescription: productData.metaDescription || productData.description
      },
      tags: productData.tags || [],
      variants: []
    };

    console.log("🏗️ Prepared product data:", product);

    // Save to Firestore
    console.log("💾 Saving to Firestore...");
    await setDoc(productRef, {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log("✅ Product saved successfully with ID:", productRef.id);

    const finalProduct = {
      id: productRef.id,
      ...product
    };

    console.log("🎉 Returning created product:", finalProduct);

    return finalProduct;
  } catch (error) {
    console.error("Error creating product:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
    throw new Error("Failed to create product: Unknown error");
  }
};

/**
 * Bulk create products (useful for initial data seeding)
 */
export const createProductsBatch = async (products: ProductCreateData[]): Promise<Product[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be authenticated to create products");
    }

    const batch = writeBatch(db);
    const createdProducts: Product[] = [];

    for (const productData of products) {
      const productRef = doc(collection(db, "products"));
      
      const product: Omit<Product, 'id'> = {
        title: productData.title,
        price: productData.price,
        description: productData.description,
        category: productData.category,
        image: productData.image,
        rating: {
          rate: 0,
          count: 0
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid,
        isActive: productData.isActive ?? true,
        inventory: {
          stock: productData.stock,
          sku: productData.sku,
          trackInventory: productData.trackInventory
        },
        seo: {
          slug: generateSlug(productData.title),
          metaTitle: productData.metaTitle,
          metaDescription: productData.metaDescription
        },
        tags: productData.tags || [],
        variants: []
      };

      batch.set(productRef, {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      createdProducts.push({
        id: productRef.id,
        ...product
      });
    }

    await batch.commit();
    return createdProducts;
  } catch (error) {
    console.error("Error creating products batch:", error);
    throw new Error("Failed to create products");
  }
};

// ========================================
// READ Operations
// ========================================

/**
 * Get all products with optional filtering, sorting, and pagination
 * Only returns products created by the currently authenticated user
 */
export const getProducts = async (
  filters: ProductFilters = {},
  sort: ProductSort = { field: 'createdAt', direction: 'desc' },
  pageSize: number = 20
): Promise<ProductsResponse> => {
  try {
    console.log("🔍 getProducts called with filters:", filters);
    
    // Check if user is authenticated
    const user = auth.currentUser;
    if (!user) {
      console.log("❌ User not authenticated, returning empty results");
      return {
        products: [],
        total: 0,
        page: 0,
        limit: pageSize,
        hasMore: false
      };
    }

    console.log("✅ User authenticated:", user.uid, "- filtering products by createdBy");
    
    // Use a simplified query to avoid complex Firestore indexes
    const constraints: Parameters<typeof query>[1][] = [];

    // IMPORTANT: Filter by user ID first to ensure user-specific products
    constraints.push(where("createdBy", "==", user.uid));
    
    // Only use basic filters that don't require complex composite indexes
    if (filters.category) {
      console.log("📂 Adding category filter:", filters.category);
      constraints.push(where("category", "==", filters.category));
    }

    // Simple ordering without multiple where clauses to avoid index requirements
    constraints.push(orderBy("createdAt", "desc"));
    constraints.push(limit(100)); // Get more for client-side filtering
    
    console.log("📝 Query constraints:", constraints.length);
    
    // Create and execute query
    const productsQuery = query(collection(db, "products"), ...constraints);
    console.log("🔄 Executing Firestore query...");
    const querySnapshot = await getDocs(productsQuery);
    
    console.log("📊 Raw Firestore results:", querySnapshot.docs.length, "documents");
    
    const products: Product[] = [];
    
    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log("📄 Processing document:", doc.id, data.title);
      products.push({
        id: doc.id,
        title: data.title,
        price: data.price,
        description: data.description,
        category: data.category,
        image: data.image,
        rating: data.rating || { rate: 0, count: 0 },
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        createdBy: data.createdBy,
        isActive: data.isActive !== false,
        inventory: data.inventory || { stock: 0, trackInventory: false },
        seo: data.seo || {},
        tags: data.tags || [],
        variants: data.variants || []
      });
    });

    console.log("📦 Processed products:", products.length);

    // Apply client-side filtering to avoid complex Firestore indexes
    let filteredProducts = products;
    
    if (filters.isActive !== undefined) {
      console.log("🎯 Filtering by isActive:", filters.isActive);
      filteredProducts = filteredProducts.filter(p => p.isActive === filters.isActive);
      console.log("📊 After isActive filter:", filteredProducts.length);
    }
    
    if (filters.inStock) {
      filteredProducts = filteredProducts.filter(p => p.inventory.stock > 0);
    }

    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice!);
    }
    
    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice!);
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        p.tags && p.tags.some(tag => filters.tags!.includes(tag))
      );
    }

    // Filter by search term (client-side)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    // Apply client-side sorting
    filteredProducts.sort((a, b) => {
      const aValue = a[sort.field as keyof Product] as string | number | Date;
      const bValue = b[sort.field as keyof Product] as string | number | Date;
      
      if (sort.direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = 0; // Simplified pagination
    const endIndex = pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    console.log("✅ Final result:", {
      totalRaw: products.length,
      afterFiltering: filteredProducts.length,
      afterPagination: paginatedProducts.length,
      hasMore: filteredProducts.length > pageSize
    });

    return {
      products: paginatedProducts,
      total: filteredProducts.length,
      page: 0,
      limit: pageSize,
      hasMore: filteredProducts.length > pageSize
    };
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
};

/**
 * Get product by ID (only if owned by current user)
 */
export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("❌ User not authenticated, cannot access product");
      return null;
    }

    const productDoc = await getDoc(doc(db, "products", productId));
    
    if (productDoc.exists()) {
      const data = productDoc.data();
      
      // Check if the product belongs to the current user
      if (data.createdBy !== user.uid) {
        console.log("❌ Product does not belong to current user");
        return null;
      }
      
      return {
        id: productDoc.id,
        title: data.title,
        price: data.price,
        description: data.description,
        category: data.category,
        image: data.image,
        rating: data.rating || { rate: 0, count: 0 },
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        createdBy: data.createdBy,
        isActive: data.isActive !== false,
        inventory: data.inventory || { stock: 0, trackInventory: false },
        seo: data.seo || {},
        tags: data.tags || [],
        variants: data.variants || []
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to fetch product");
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const result = await getProducts({ category, isActive: true });
    return result.products;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw new Error("Failed to fetch products by category");
  }
};

/**
 * Get all categories (only from user's own products)
 */
export const getCategories = async (): Promise<string[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("❌ User not authenticated, returning empty categories");
      return [];
    }

    const q = query(
      collection(db, "products"),
      where("createdBy", "==", user.uid),
      where("isActive", "==", true),
      orderBy("category")
    );
    
    const querySnapshot = await getDocs(q);
    const categories = new Set<string>();
    
    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.category) {
        categories.add(data.category);
      }
    });
    
    return Array.from(categories).sort();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
};

/**
 * Search products
 */
export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  try {
    const result = await getProducts({ 
      searchTerm, 
      isActive: true 
    });
    return result.products;
  } catch (error) {
    console.error("Error searching products:", error);
    throw new Error("Failed to search products");
  }
};

// ========================================
// UPDATE Operations
// ========================================

/**
 * Update product
 */
export const updateProduct = async (
  productId: string, 
  updateData: ProductUpdateData
): Promise<Product> => {
  try {
    const productRef = doc(db, "products", productId);
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      throw new Error("Product not found");
    }

    // Prepare update data
    const updates: Record<string, unknown> = {
      updatedAt: serverTimestamp()
    };

    // Update basic fields
    if (updateData.title !== undefined) {
      updates.title = updateData.title;
      // Update slug if title changes
      updates["seo.slug"] = generateSlug(updateData.title);
    }
    
    if (updateData.price !== undefined) updates.price = updateData.price;
    if (updateData.description !== undefined) updates.description = updateData.description;
    if (updateData.category !== undefined) updates.category = updateData.category;
    if (updateData.image !== undefined) updates.image = updateData.image;
    if (updateData.isActive !== undefined) updates.isActive = updateData.isActive;

    // Update inventory
    if (updateData.stock !== undefined) updates["inventory.stock"] = updateData.stock;
    if (updateData.sku !== undefined) updates["inventory.sku"] = updateData.sku;
    if (updateData.trackInventory !== undefined) updates["inventory.trackInventory"] = updateData.trackInventory;

    // Update SEO
    if (updateData.metaTitle !== undefined) updates["seo.metaTitle"] = updateData.metaTitle;
    if (updateData.metaDescription !== undefined) updates["seo.metaDescription"] = updateData.metaDescription;

    // Update tags
    if (updateData.tags !== undefined) updates.tags = updateData.tags;

    // Update Firestore document
    await updateDoc(productRef, updates);
    
    // Return updated product
    const updatedProduct = await getProductById(productId);
    if (!updatedProduct) {
      throw new Error("Failed to fetch updated product");
    }
    
    return updatedProduct;
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error("Failed to update product");
  }
};

/**
 * Update product rating
 */
export const updateProductRating = async (
  productId: string, 
  newRating: number
): Promise<void> => {
  try {
    const productRef = doc(db, "products", productId);
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      throw new Error("Product not found");
    }

    const currentData = productDoc.data();
    const currentRating = currentData.rating || { rate: 0, count: 0 };
    
    // Calculate new average rating
    const totalRating = currentRating.rate * currentRating.count + newRating;
    const newCount = currentRating.count + 1;
    const newAverageRating = totalRating / newCount;

    await updateDoc(productRef, {
      "rating.rate": Number(newAverageRating.toFixed(1)),
      "rating.count": newCount,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating product rating:", error);
    throw new Error("Failed to update product rating");
  }
};

/**
 * Update product inventory
 */
export const updateProductInventory = async (
  productId: string, 
  quantityChange: number
): Promise<void> => {
  try {
    const productRef = doc(db, "products", productId);
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      throw new Error("Product not found");
    }

    const currentData = productDoc.data();
    const currentStock = currentData.inventory?.stock || 0;
    const newStock = Math.max(0, currentStock + quantityChange);

    await updateDoc(productRef, {
      "inventory.stock": newStock,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating product inventory:", error);
    throw new Error("Failed to update product inventory");
  }
};

// ========================================
// DELETE Operations
// ========================================

/**
 * Soft delete product (mark as inactive)
 */
export const deactivateProduct = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error deactivating product:", error);
    throw new Error("Failed to deactivate product");
  }
};

/**
 * Hard delete product (permanent removal)
 */
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be authenticated to delete products");
    }

    // Check if user is the creator or has admin rights
    const productDoc = await getDoc(doc(db, "products", productId));
    if (!productDoc.exists()) {
      throw new Error("Product not found");
    }

    const productData = productDoc.data();
    if (productData.createdBy !== user.uid) {
      // In a real app, you'd check for admin role here
      throw new Error("Unauthorized to delete this product");
    }

    await deleteDoc(doc(db, "products", productId));
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete product");
  }
};

/**
 * Delete products by category (admin function)
 */
export const deleteProductsByCategory = async (category: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be authenticated to delete products");
    }

    const q = query(collection(db, "products"), where("category", "==", category));
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Error deleting products by category:", error);
    throw new Error("Failed to delete products by category");
  }
};

// ========================================
// Utility Functions
// ========================================

/**
 * Generate URL-friendly slug from title
 */
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

/**
 * Check if product exists
 */
export const checkProductExists = async (productId: string): Promise<boolean> => {
  try {
    const productDoc = await getDoc(doc(db, "products", productId));
    return productDoc.exists();
  } catch (error) {
    console.error("Error checking if product exists:", error);
    return false;
  }
};

/**
 * Get product statistics (only from user's own products)
 */
export const getProductStats = async (): Promise<{
  totalProducts: number;
  activeProducts: number;
  totalValue: number;
  categoriesCount: number;
}> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        totalProducts: 0,
        activeProducts: 0,
        totalValue: 0,
        categoriesCount: 0
      };
    }

    const allProductsQuery = query(
      collection(db, "products"),
      where("createdBy", "==", user.uid)
    );
    const allProductsSnapshot = await getDocs(allProductsQuery);
    
    let activeProducts = 0;
    let totalValue = 0;
    const categories = new Set<string>();
    
    allProductsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.isActive !== false) {
        activeProducts++;
        totalValue += (data.price || 0) * (data.inventory?.stock || 0);
      }
      if (data.category) {
        categories.add(data.category);
      }
    });
    
    return {
      totalProducts: allProductsSnapshot.size,
      activeProducts,
      totalValue,
      categoriesCount: categories.size
    };
  } catch (error) {
    console.error("Error getting product stats:", error);
    throw new Error("Failed to get product statistics");
  }
};

/**
 * Migrate FakeStore API data to Firestore
 */
export const migrateFakeStoreData = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be authenticated to migrate data");
    }

    // Fetch data from FakeStore API
    const response = await fetch('https://fakestoreapi.com/products');
    if (!response.ok) {
      throw new Error('Failed to fetch FakeStore data');
    }
    
    interface FakeStoreProduct {
      id: number;
      title: string;
      price: number;
      description: string;
      category: string;
      image: string;
      rating: {
        rate: number;
        count: number;
      };
    }
    
    const fakeStoreProducts: FakeStoreProduct[] = await response.json();
    
    // Convert to our format and create in Firestore
    const productData: ProductCreateData[] = fakeStoreProducts.map((item: FakeStoreProduct) => ({
      title: item.title,
      price: item.price,
      description: item.description,
      category: item.category,
      image: item.image,
      stock: Math.floor(Math.random() * 100) + 10, // Random stock between 10-109
      trackInventory: true,
      tags: [item.category],
      isActive: true
    }));
    
    await createProductsBatch(productData);
    console.log(`Successfully migrated ${productData.length} products from FakeStore API`);
  } catch (error) {
    console.error("Error migrating FakeStore data:", error);
    throw new Error("Failed to migrate FakeStore data");
  }
};