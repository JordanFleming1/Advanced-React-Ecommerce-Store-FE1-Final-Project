import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../services/productService";
import type { Product } from "../types/productType";

// Hook to fetch all products from Firestore
export const useProducts = () => {
    return useQuery({
        queryKey: ["products"],
        queryFn: async (): Promise<Product[]> => {
            const result = await getProducts({ isActive: true });
            return result.products;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};