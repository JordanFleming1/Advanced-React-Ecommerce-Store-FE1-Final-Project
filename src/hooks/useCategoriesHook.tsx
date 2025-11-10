import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../services/productService";

// Custom hook for fetching categories from Firestore
export const useCategories = () => {
    return useQuery({
        queryKey: ["categories"], // Unique cache key
        queryFn: async (): Promise<string[]> => {
            try {
                return await getCategories();
            } catch (error) {
                console.error("Error fetching categories from Firestore:", error);
                // Return empty array instead of throwing to prevent category filter from breaking
                return [];
            }
        },
        staleTime: 10 * 60 * 1000, // Categories don't change often - 10 minutes
        gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
        retry: 1, // Only retry once
    });
};