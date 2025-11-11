import { useQuery } from "@tanstack/react-query";
import { getProducts, getProductsByCategory } from "../services/productService";
import { useAuth } from "./useAuth";
import type { Product } from "../types/productType";

// Custom hook for fetching products by category using Firestore
export const useProductsByCategory = (category?: string) => {
    const { user, isAuthenticated } = useAuth();
    
    return useQuery({
        queryKey: ["products", category, user?.uid], // Include user ID in cache key for user-specific caching
        queryFn: async (): Promise<Product[]> => {
            try {
                console.log("🎯 useProductsByCategory called with:", {
                    category,
                    userUID: user?.uid,
                    isAuthenticated
                });
                
                if (!isAuthenticated || !user) {
                    console.log("❌ User not authenticated, returning empty array");
                    return [];
                }
                
                if (category) {
                    console.log("📂 Fetching products for category:", category, "for user:", user.uid);
                    const result = await getProductsByCategory(category);
                    console.log("📦 Category products result:", result.length);
                    return result;
                } else {
                    console.log("📦 Fetching all active products for user:", user.uid);
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
        staleTime: 0, // Always consider data stale to force fresh fetches
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: isAuthenticated && !!user, // Only run when user is authenticated
        retry: 1, // Only retry once to avoid long loading times
        refetchOnWindowFocus: true, // Refetch when window regains focus
        refetchOnMount: true, // Always refetch on mount
    });
};