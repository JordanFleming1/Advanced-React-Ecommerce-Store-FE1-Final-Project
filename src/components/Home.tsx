import React, { useState } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useProductsByCategory } from '../hooks/useProductsByCategoryHook';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import type { Product } from '../types/productType';
import { useAppDispatch } from '../hooks/reduxHooks';
import { addToCart, openCart } from '../store/cartSlice';

const Home: React.FC = () => {
  // Redux dispatch hook
  const dispatch = useAppDispatch();
  
  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Fetch products based on selected category
  const { data: products, isLoading, error, isError } = useProductsByCategory(
    selectedCategory || undefined // Convert empty string to undefined
  );

  // Handle adding products to cart with Redux
  const handleAddToCart = (product: Product) => {
    // Dispatch addToCart action
    dispatch(addToCart({ product, quantity: 1 }));
    
    // Optionally open the cart after adding item
    dispatch(openCart());
    
    console.log('Added to cart:', product.title);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Loading state
  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-3">
            Loading {selectedCategory ? `${selectedCategory} ` : ''}products...
          </p>
        </div>
      </Container>
    );
  }

  // Error state
  if (isError) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Error loading products</Alert.Heading>
          <p>
            {error instanceof Error ? error.message : 'Something went wrong while fetching products.'}
          </p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Our Beautiful Products</h1>
          <p className="text-center text-muted">
            Discover amazing products at great prices
          </p>
        </Col>
      </Row>

      {/* Category Filter Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">Filter by Category:</h5>
              <CategoryFilter 
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>
            <div className="text-muted">
              {products?.length || 0} product{products?.length !== 1 ? 's' : ''} found
              {selectedCategory && (
                <span> in <strong>{selectedCategory}</strong></span>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Products Grid */}
      <Row>
        {products?.map((product) => (
          <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <ProductCard 
              product={product} 
              onAddToCart={handleAddToCart}
            />
          </Col>
        ))}
      </Row>

      {/* No Products Found */}
      {products && products.length === 0 && (
        <Row>
          <Col className="text-center">
            <Alert variant="info">
              No products found
              {selectedCategory && ` in the "${selectedCategory}" category`}.
              Try selecting a different category.
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Home;