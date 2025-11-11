import { useQuery } from "@tanstack/react-query";
import { getProducts, getProductsByCategory } from "../services/productService";
import type { Product } from "../types/productType";

// Custom hook for fetching products by category using Firestore
export const useProductsByCategory = (category?: string) => {
    return useQuery({
        queryKey: ["products", category], // Include category in cache key
        queryFn: async (): Promise<Product[]> => {
            try {
                console.log("🎯 useProductsByCategory called with category:", category);
                
                if (category) {
                    console.log("📂 Fetching products for category:", category);
                    const result = await getProductsByCategory(category);
                    console.log("📦 Category products result:", result.length);
                    return result;
                } else {
                    console.log("📦 Fetching all active products");
                    const result = await getProducts({ isActive: true });
                    console.log("📊 All products result:", result.products.length);
                    return result.products;
                }
            } catch (error) {
                console.error("❌ Error in useProductsByCategory:", error);
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