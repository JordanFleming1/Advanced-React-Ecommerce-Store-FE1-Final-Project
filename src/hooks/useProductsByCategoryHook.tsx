import { useQuery } from "@tanstack/react-query";
import { getProducts, getProductsByCategory } from "../services/productService";
import type { Product } from "../types/productType";

// Custom hook for fetching products by category using Firestore
export const useProductsByCategory = (category?: string) => {
    return useQuery({
        queryKey: ["products", category], // Include category in cache key
        queryFn: async (): Promise<Product[]> => {
            try {
                if (category) {
                    return await getProductsByCategory(category);
                } else {
                    const result = await getProducts({ isActive: true });
                    return result.products;
                }
            } catch (error) {
                console.error("Error fetching products from Firestore:", error);
                // If it's a Firestore error and we're getting all products, provide helpful message
                if (!category && error instanceof Error) {
                    throw new Error("No products found in your database. Use the Product Management page to add products or migrate sample data.");
                }
                throw error;
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        enabled: true, // Always enabled
        retry: 1, // Only retry once to avoid long loading times
    });
};