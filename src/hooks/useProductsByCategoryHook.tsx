import { useQuery } from "@tanstack/react-query";
import type { Product } from "../types/productType";

// Function to fetch products, optionally filtered by category
const fetchProductsByCategory = async (category?: string): Promise<Product[]> => {
    // Build URL based on whether category is provided
    const url = category 
        ? `https://fakestoreapi.com/products/category/${category}`
        : "https://fakestoreapi.com/products";
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch products${category ? ` for category: ${category}` : ''}`);
    }
    return response.json();
};

// Custom hook for fetching products by category
export const useProductsByCategory = (category?: string) => {
    return useQuery({
        queryKey: ["products", category], // Include category in cache key
        queryFn: () => fetchProductsByCategory(category),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        enabled: true, // Always enabled
    });
};