import React, { useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useProductsByCategory } from '../hooks/useProductsByCategoryHook';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import type { Product, ProductCreateData } from '../types/productType';
import { useAppDispatch } from '../hooks/reduxHooks';
import { addToCart, openCart } from '../store/cartSlice';
import { useAuth } from '../hooks/useAuth';
import { createProduct } from '../services/productService';

const Home: React.FC = () => {
  // Redux dispatch hook
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  
  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // State for quick create product modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  
  // Form state for quick product creation
  const [quickProduct, setQuickProduct] = useState<ProductCreateData>({
    title: '',
    price: 0,
    description: '',
    category: '',
    image: '',
    stock: 1,
    trackInventory: true,
    isActive: true
  });

  // Fetch products based on selected category
  const { data: products, isLoading, error, isError } = useProductsByCategory(
    selectedCategory || undefined // Convert empty string to undefined
  );

  // Debug logging for products data
  console.log("🏠 Home component render:", {
    selectedCategory,
    productsLength: products?.length || 0,
    isLoading,
    isError,
    error: error?.message,
    isAuthenticated
  });

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

  // Handle manual refresh
  const handleManualRefresh = async () => {
    console.log("🔄 Manual refresh triggered for user:", user?.uid);
    
    // Invalidate all React Query caches for this specific user
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['products'] }),
      queryClient.invalidateQueries({ queryKey: ['products', selectedCategory, user?.uid] }),
      queryClient.invalidateQueries({ queryKey: ['products', undefined, user?.uid] }),
      queryClient.invalidateQueries({ queryKey: ['products', null, user?.uid] }),
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    ]);
    
    // Force refetch
    await queryClient.refetchQueries({ queryKey: ['products'] });
    
    console.log("✅ Manual refresh completed");
  };

  // Handle product update/delete callback
  const handleProductUpdated = () => {
    // Invalidate React Query cache to refresh product list for this user
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['products', selectedCategory, user?.uid] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  // Handle quick product creation
  const handleQuickCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setCreateError('Please log in to create products');
      return;
    }
    
    try {
      setIsCreating(true);
      setCreateError(null);
      setCreateSuccess(null);
      
      // Validate required fields
      if (!quickProduct.title.trim()) {
        throw new Error('Product title is required');
      }
      if (!quickProduct.category.trim()) {
        throw new Error('Product category is required');
      }
      if (quickProduct.price <= 0) {
        throw new Error('Product price must be greater than 0');
      }
      
      await createProduct(quickProduct);
      setCreateSuccess('Product created successfully!');
      
      console.log("🔄 Invalidating React Query cache for user:", user?.uid);
      
      // Invalidate React Query cache to refresh product list
      // Use Promise.all to ensure all invalidations complete
      await Promise.all([
        // Invalidate all product queries (with any category filter) for this user
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        // Specifically invalidate the current category view for this user
        queryClient.invalidateQueries({ queryKey: ['products', selectedCategory, user?.uid] }),
        // Invalidate the "all products" view specifically for this user
        queryClient.invalidateQueries({ queryKey: ['products', undefined, user?.uid] }),
        queryClient.invalidateQueries({ queryKey: ['products', null, user?.uid] }),
        // Also invalidate categories in case we added a new category
        queryClient.invalidateQueries({ queryKey: ['categories'] })
      ]);
      
      console.log("✅ Cache invalidation completed");
      
      // Force a refetch of the current data for this user
      await queryClient.refetchQueries({ queryKey: ['products'] });
      await queryClient.refetchQueries({ queryKey: ['products', selectedCategory, user?.uid] });
      console.log("🔄 Forced refetch completed");
      
      // Reset form
      setQuickProduct({
        title: '',
        price: 0,
        description: '',
        category: '',
        image: '',
        stock: 1,
        trackInventory: true,
        isActive: true
      });
      
      // Close modal after a delay
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess(null);
      }, 1500);
      
    } catch (error) {
      console.error('Quick product creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
      setCreateError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle form input changes
  const handleQuickProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setQuickProduct(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
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

  // Authentication required message
  if (!isAuthenticated) {
    return (
      <Container className="mt-4">
        <Alert variant="info">
          <Alert.Heading>🔐 Authentication Required</Alert.Heading>
          <p>
            Please sign in to view and manage your products. Each user has their own private product catalog.
          </p>
          <div className="mt-3">
            <Link to="/login">
              <Button variant="primary" className="me-2">🔐 Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline-primary">📝 Create Account</Button>
            </Link>
          </div>
        </Alert>
      </Container>
    );
  }

  // Error state
  if (isError) {
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong while fetching products.';
    const isEmptyDatabase = errorMessage.includes('No products found in your database');
    
    console.log("❌ Error in Home component:", {
      error,
      errorMessage,
      isEmptyDatabase,
      selectedCategory
    });
    
    return (
      <Container className="mt-4">
        <Alert variant={isEmptyDatabase ? "info" : "danger"}>
          <Alert.Heading>
            {isEmptyDatabase ? "🏪 Welcome to Your Store!" : "❌ Error Loading Products"}
          </Alert.Heading>
          <p>{errorMessage}</p>
          
          {/* Debug information */}
          <details className="mt-2">
            <summary className="text-muted small">Debug Information</summary>
            <pre className="text-muted small mt-2">
              Selected Category: {selectedCategory || 'All'}
              {'\n'}Error Type: {error?.constructor?.name || 'Unknown'}
              {'\n'}Authentication: {isAuthenticated ? 'Yes' : 'No'}
            </pre>
          </details>
          
          {isEmptyDatabase && (
            <div className="mt-3">
              <p>Get started by adding products to your store:</p>
              <ul>
                <li><strong>Quick Start:</strong> Import sample products from FakeStore API</li>
                <li><strong>Custom Products:</strong> Create your own products manually</li>
              </ul>
              
              {isAuthenticated ? (
                <div className="d-flex gap-2">
                  <Link to="/admin/products">
                    <Button variant="primary">
                      📦 Go to Product Management
                    </Button>
                  </Link>
                </div>
              ) : (
                <div>
                  <p>Please sign in to manage products:</p>
                  <Link to="/login">
                    <Button variant="primary">🔐 Sign In</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-center flex-grow-1">
              <h1>Our Beautiful Products</h1>
              <p className="text-muted mb-0">
                Discover amazing products at great prices
              </p>
            </div>
            {isAuthenticated && (
              <div className="ms-3 d-flex gap-2">
                <Button 
                  variant="outline-primary" 
                  onClick={handleManualRefresh}
                  className="d-flex align-items-center"
                >
                  <span className="me-2">🔄</span>
                  Refresh
                </Button>
                <Button 
                  variant="success" 
                  onClick={() => setShowCreateModal(true)}
                  className="d-flex align-items-center"
                >
                  <span className="me-2">➕</span>
                  Quick Add Product
                </Button>
              </div>
            )}
          </div>
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
              onProductUpdated={handleProductUpdated}
            />
          </Col>
        ))}
      </Row>

      {/* No Products Found */}
      {products && products.length === 0 && (
        <Row>
          <Col className="text-center">
            <Alert variant="info">
              <Alert.Heading>📦 No Products Found</Alert.Heading>
              <p>
                {selectedCategory 
                  ? `No products found in the "${selectedCategory}" category.` 
                  : 'No products are currently available.'
                }
              </p>
              
              {!selectedCategory && isAuthenticated && (
                <div className="mt-3">
                  <p>Get started by adding some products to your store:</p>
                  <Link to="/admin/products">
                    <Button variant="primary">📦 Manage Products</Button>
                  </Link>
                </div>
              )}
              
              {selectedCategory && (
                <p>Try selecting a different category or view all products.</p>
              )}
            </Alert>
          </Col>
        </Row>
      )}
      
      {/* Quick Create Product Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Quick Create Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {createSuccess && (
            <Alert variant="success">
              <strong>Success!</strong> {createSuccess}
            </Alert>
          )}
          
          {createError && (
            <Alert variant="danger">
              <strong>Error:</strong> {createError}
            </Alert>
          )}
          
          <Form onSubmit={handleQuickCreateProduct}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={quickProduct.title}
                    onChange={handleQuickProductChange}
                    placeholder="Enter product title"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={quickProduct.category}
                    onChange={handleQuickProductChange}
                    placeholder="e.g., electronics, clothing"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price *</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={quickProduct.price}
                    onChange={handleQuickProductChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={quickProduct.stock}
                    onChange={handleQuickProductChange}
                    placeholder="1"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={quickProduct.description}
                onChange={handleQuickProductChange}
                placeholder="Describe your product..."
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                name="image"
                value={quickProduct.image}
                onChange={handleQuickProductChange}
                placeholder="https://example.com/image.jpg"
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setShowCreateModal(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button 
                variant="success" 
                type="submit"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="me-2">✅</span>
                    Create Product
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Home;