import { useQuery } from "@tanstack/react-query";
import type { Product } from "../types/productType";

const fetchProducts = async (): Promise<Product[]> => {
    const response = await fetch("https://fakestoreapi.com/products");
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
};

export const useProducts = () => {
    return useQuery({
        queryKey: ["products"],
        queryFn: fetchProducts,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};