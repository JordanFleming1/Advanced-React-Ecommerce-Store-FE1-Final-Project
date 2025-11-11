import React, { useState } from 'react';
import { Button, Alert, Card, Container } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { createProduct, getProducts } from '../services/productService';
import type { Product } from '../types/productType';

const DebugProducts: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);

  const createTestProduct = async () => {
    if (!isAuthenticated) {
      setMessage('❌ Please sign in first');
      return;
    }

    try {
      setLoading(true);
      setMessage('🔄 Creating test product...');

      const testProduct = {
        title: `Test Product ${Date.now()}`,
        price: 29.99,
        description: 'This is a test product to debug creation',
        category: 'test',
        image: 'https://via.placeholder.com/300',
        stock: 10,
        trackInventory: true,
        isActive: true
      };

      console.log('📝 Creating product with data:', testProduct);
      
      const createdProduct = await createProduct(testProduct);
      console.log('✅ Product created:', createdProduct);
      
      setMessage(`✅ Successfully created product: ${createdProduct.title} (ID: ${createdProduct.id})`);
      
      // Refresh the products list
      await loadProducts();
      
    } catch (error) {
      console.error('❌ Product creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`❌ Error creating product: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!isAuthenticated) {
      setMessage('❌ Please sign in first');
      return;
    }

    try {
      setLoading(true);
      setMessage('🔄 Loading products...');

      console.log('📋 Fetching products...');
      const result = await getProducts();
      console.log('📦 Products result:', result);
      
      setProducts(result.products);
      setMessage(`📦 Found ${result.products.length} products`);
      
    } catch (error) {
      console.error('❌ Product loading error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`❌ Error loading products: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const clearMessage = () => setMessage('');

  if (!isAuthenticated) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          <h5>🔐 Authentication Required</h5>
          <p>Please sign in to test product functionality.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h5>🐛 Product Debug Panel</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex gap-2 mb-3">
            <Button 
              variant="primary" 
              onClick={createTestProduct}
              disabled={loading}
            >
              {loading ? '🔄 Working...' : '➕ Create Test Product'}
            </Button>
            
            <Button 
              variant="info" 
              onClick={loadProducts}
              disabled={loading}
            >
              {loading ? '🔄 Working...' : '📋 Load Products'}
            </Button>

            {message && (
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={clearMessage}
              >
                ✖️ Clear
              </Button>
            )}
          </div>

          {message && (
            <Alert variant={message.includes('❌') ? 'danger' : message.includes('✅') ? 'success' : 'info'}>
              {message}
            </Alert>
          )}

          <div className="mt-3">
            <h6>📦 Products Found ({products.length}):</h6>
            {products.length === 0 ? (
              <Alert variant="info">No products found. Try creating a test product first.</Alert>
            ) : (
              <div className="row">
                {products.map((product) => (
                  <div key={product.id} className="col-md-6 mb-2">
                    <Card>
                      <Card.Body>
                        <h6>{product.title}</h6>
                        <small className="text-muted">
                          ID: {product.id}<br/>
                          Price: ${product.price}<br/>
                          Category: {product.category}<br/>
                          Created By: {product.createdBy}<br/>
                          Created: {product.createdAt.toLocaleString()}
                        </small>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-light rounded">
            <h6>🔍 Debugging Tips:</h6>
            <ul className="small mb-0">
              <li>Check browser console for detailed logs</li>
              <li>Verify Firebase authentication is working</li>
              <li>Check Firestore rules allow authenticated users to read/write</li>
              <li>Ensure products are associated with current user ID</li>
            </ul>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DebugProducts;