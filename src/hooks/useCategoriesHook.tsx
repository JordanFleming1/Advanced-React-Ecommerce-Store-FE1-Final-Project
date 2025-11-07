import { useQuery } from "@tanstack/react-query";

// Function to fetch all categories from the API
const fetchCategories = async (): Promise<string[]> => {
    const response = await fetch("https://fakestoreapi.com/products/categories");
    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }
    return response.json();
};

// Custom hook for fetching categories
export const useCategories = () => {
    return useQuery({
        queryKey: ["categories"], // Unique cache key
        queryFn: fetchCategories, // Function that fetches data
        staleTime: 10 * 60 * 1000, // Categories don't change often - 10 minutes
        gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    });
};