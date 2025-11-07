import React from 'react';
import { Form } from 'react-bootstrap';
import { useCategories } from '../hooks/useCategoriesHook';

// Props interface for the CategoryFilter component
interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  selectedCategory, 
  onCategoryChange 
}) => {
  // Fetch categories using our custom hook
  const { data: categories, isLoading, error } = useCategories();

  // Handle dropdown change
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onCategoryChange(event.target.value);
  };

  // Show loading state
  if (isLoading) {
    return (
      <Form.Select disabled>
        <option>Loading categories...</option>
      </Form.Select>
    );
  }

  // Show error state
  if (error) {
    return (
      <Form.Select disabled>
        <option>Error loading categories</option>
      </Form.Select>
    );
  }

  return (
    <Form.Select 
      value={selectedCategory} 
      onChange={handleChange}
      className="mb-3"
      style={{ maxWidth: '300px' }}
    >
      <option value="">All Categories</option>
      {categories?.map((category) => (
        <option key={category} value={category}>
          {/* Capitalize first letter of each word */}
          {category.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </option>
      ))}
    </Form.Select>
  );
};

export default CategoryFilter;