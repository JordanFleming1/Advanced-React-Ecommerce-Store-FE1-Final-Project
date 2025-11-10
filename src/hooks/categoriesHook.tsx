import { useQuery } from "@tanstack/react-query";

const fetchCategories = async (): Promise<string[]> => {
    const response = await fetch("https://fakestoreapi.com/products/categories");
    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }
    return response.json();
};

// Hook to fetch product categories
export const useCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories, // Fetch categories function
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};