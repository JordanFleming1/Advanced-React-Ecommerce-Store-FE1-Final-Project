import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  migrateFakeStoreData,
  getProductStats
} from '../services/productService';
import type { 
  ProductCreateData, 
  ProductUpdateData, 
  ProductFilters, 
  ProductSort 
} from '../types/productType';

// Hook for getting products with filters and pagination
export const useProducts = (
  filters: ProductFilters = {},
  sort: ProductSort = { field: 'createdAt', direction: 'desc' },
  pageSize: number = 20
) => {
  return useQuery({
    queryKey: ['products', filters, sort, pageSize],
    queryFn: () => getProducts(filters, sort, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: true,
  });
};

// Hook for getting a single product
export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId),
    staleTime: 5 * 60 * 1000,
    enabled: !!productId,
  });
};

// Hook for getting product statistics
export const useProductStats = () => {
  return useQuery({
    queryKey: ['productStats'],
    queryFn: getProductStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for creating products
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productData: ProductCreateData) => createProduct(productData),
    onSuccess: () => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productStats'] });
    },
  });
};

// Hook for updating products
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdateData }) => 
      updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      // Update specific product in cache
      queryClient.setQueryData(['product', updatedProduct.id], updatedProduct);
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productStats'] });
    },
  });
};

// Hook for deleting products
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: (_, productId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['product', productId] });
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productStats'] });
    },
  });
};

// Hook for migrating FakeStore data
export const useMigrateFakeStoreData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: migrateFakeStoreData,
    onSuccess: () => {
      // Invalidate all product-related queries
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productStats'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};