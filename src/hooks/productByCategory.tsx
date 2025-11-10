import { useQuery } from '@tanstack/react-query';
import type { Product } from '../types/productType';

const fetchProductsByCategory = async (category?: string): Promise<Product[]> => {
    const url = category 
        ? `https://fakestoreapi.com/products/category/${category}` 
        : 'https://fakestoreapi.com/products';
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    return response.json();
};

// Hook to fetch products by category
export const useProductsByCategory = (category?: string) => {
    return useQuery({
        queryKey: ['products', category],
        queryFn: () => fetchProductsByCategory(category), // Fetch products by category function
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        enabled: true, // Always enabled
    });
};