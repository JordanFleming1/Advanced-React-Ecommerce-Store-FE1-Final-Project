/**
 * Product Management Component
 * Comprehensive admin interface for product CRUD operations
 * Custom implementation with advanced filtering and management features
 */
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Alert, 
  Spinner,
  Badge,
  InputGroup,
  Dropdown
} from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  migrateFakeStoreData,
  getProductStats 
} from '../services/productService';
import type { Product, ProductCreateData, ProductUpdateData, ProductFilters } from '../types/productType';

const ProductManagement: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // State for products
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<ProductCreateData>({
    title: '',
    price: 0,
    description: '',
    category: '',
    image: '',
    stock: 0,
    trackInventory: true,
    isActive: true
  });
  
  // Filter and pagination states
  const [filters, setFilters] = useState<ProductFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stats state
  const [stats, setStats] = useState<{
    totalProducts: number;
    activeProducts: number;
    totalValue: number;
    categoriesCount: number;
  } | null>(null);
  
  // Loading states for specific actions
  const [migrating, setMigrating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchFilters = searchTerm ? { ...filters, searchTerm } : filters;
      const result = await getProducts(searchFilters);
      setProducts(result.products);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load products';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  const loadStats = async () => {
    try {
      const statsData = await getProductStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
      loadStats();
    }
  }, [isAuthenticated, loadProducts]); // Include loadProducts dependency

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      console.log("Attempting to create product with form data:", formData);
      
      // Validate form data before submitting
      if (!formData.title.trim()) {
        throw new Error("Product title is required");
      }
      if (!formData.category.trim()) {
        throw new Error("Product category is required");
      }
      if (!formData.description.trim()) {
        throw new Error("Product description is required");
      }
      if (formData.price <= 0) {
        throw new Error("Product price must be greater than 0");
      }
      
      await createProduct(formData);
      setSuccess('Product created successfully!');
      setShowCreateModal(false);
      resetForm();
      loadProducts();
      loadStats();
    } catch (error) {
      console.error("Product creation error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      const updateData: ProductUpdateData = { ...formData };
      await updateProduct(selectedProduct.id, updateData);
      setSuccess('Product updated successfully!');
      setShowEditModal(false);
      resetForm();
      loadProducts();
      loadStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      setDeleting(true);
      setError(null);
      
      await deleteProduct(selectedProduct.id);
      setSuccess('Product deleted successfully!');
      setShowDeleteModal(false);
      setSelectedProduct(null);
      loadProducts();
      loadStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
      setError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleMigrateData = async () => {
    try {
      setMigrating(true);
      setError(null);
      
      await migrateFakeStoreData();
      setSuccess('Successfully migrated FakeStore data to Firestore!');
      loadProducts();
      loadStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to migrate data';
      setError(errorMessage);
    } finally {
      setMigrating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      price: 0,
      description: '',
      category: '',
      image: '',
      stock: 0,
      trackInventory: true,
      isActive: true
    });
    setSelectedProduct(null);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
      stock: product.inventory.stock,
      sku: product.inventory.sku,
      trackInventory: product.inventory.trackInventory,
      tags: product.tags,
      metaTitle: product.seo?.metaTitle,
      metaDescription: product.seo?.metaDescription,
      isActive: product.isActive
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  if (!isAuthenticated) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="text-center">
              <Card.Body>
                <h3>🔐 Access Denied</h3>
                <p>Please log in to access product management.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>📦 Product Management</h2>
              <p className="text-muted">Manage your product catalog</p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="success" 
                onClick={() => setShowCreateModal(true)}
              >
                ➕ Add Product
              </Button>
              <Button 
                variant="info" 
                onClick={handleMigrateData}
                disabled={migrating}
              >
                {migrating ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Migrating...
                  </>
                ) : (
                  '📥 Migrate FakeStore Data'
                )}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Stats Cards */}
      {stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h5 className="text-primary">{stats.totalProducts}</h5>
                <p className="text-muted mb-0">Total Products</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h5 className="text-success">{stats.activeProducts}</h5>
                <p className="text-muted mb-0">Active Products</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h5 className="text-info">${stats.totalValue.toFixed(2)}</h5>
                <p className="text-muted mb-0">Total Inventory Value</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h5 className="text-warning">{stats.categoriesCount}</h5>
                <p className="text-muted mb-0">Categories</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="mb-4">
          {success}
        </Alert>
      )}

      {/* Search and Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={loadProducts}>
              🔍 Search
            </Button>
          </InputGroup>
        </Col>
        <Col md={6}>
          <div className="d-flex gap-2">
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary">
                Status Filter
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setFilters({ ...filters, isActive: undefined })}>
                  All Products
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setFilters({ ...filters, isActive: true })}>
                  Active Only
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setFilters({ ...filters, isActive: false })}>
                  Inactive Only
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary">
                Stock Filter
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setFilters({ ...filters, inStock: undefined })}>
                  All Stock Levels
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setFilters({ ...filters, inStock: true })}>
                  In Stock Only
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setFilters({ ...filters, inStock: false })}>
                  Out of Stock
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Col>
      </Row>

      {/* Products Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Products ({products.length})</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-3">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No products found.</p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create Your First Product
              </Button>
            </div>
          ) : (
            <Table responsive>
              <thead className="bg-light">
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img 
                        src={product.image} 
                        alt={product.title}
                        style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://via.placeholder.com/50x50/e9ecef/6c757d?text=${encodeURIComponent(product.category)}`;
                        }}
                      />
                    </td>
                    <td>
                      <div>
                        <strong>{product.title.length > 30 ? `${product.title.substring(0, 30)}...` : product.title}</strong>
                        {product.inventory.sku && (
                          <div><small className="text-muted">SKU: {product.inventory.sku}</small></div>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge bg="secondary">{product.category}</Badge>
                    </td>
                    <td>
                      <strong>${product.price.toFixed(2)}</strong>
                    </td>
                    <td>
                      {product.inventory.trackInventory ? (
                        <Badge bg={product.inventory.stock > 0 ? 'success' : 'danger'}>
                          {product.inventory.stock}
                        </Badge>
                      ) : (
                        <Badge bg="info">Unlimited</Badge>
                      )}
                    </td>
                    <td>
                      <Badge bg={product.isActive ? 'success' : 'danger'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <div>
                        ⭐ {product.rating.rate.toFixed(1)}
                        <small className="text-muted"> ({product.rating.count})</small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={() => openEditModal(product)}
                        >
                          ✏️
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-danger"
                          onClick={() => openDeleteModal(product)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Create Product Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>➕ Create New Product</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateProduct}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
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
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>SKU (optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="sku"
                    value={formData.sku || ''}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  name="trackInventory"
                  label="Track Inventory"
                  checked={formData.trackInventory}
                  onChange={handleInputChange}
                  className="mb-3"
                />
              </Col>
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  name="isActive"
                  label="Active Product"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mb-3"
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Creating...
                </>
              ) : (
                'Create Product'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>✏️ Edit Product</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateProduct}>
          <Modal.Body>
            {/* Same form fields as create modal */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
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
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>SKU (optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="sku"
                    value={formData.sku || ''}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  name="trackInventory"
                  label="Track Inventory"
                  checked={formData.trackInventory}
                  onChange={handleInputChange}
                  className="mb-3"
                />
              </Col>
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  name="isActive"
                  label="Active Product"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mb-3"
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                'Update Product'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">🗑️ Delete Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <Alert.Heading>Are you sure?</Alert.Heading>
            <p>
              This will permanently delete <strong>{selectedProduct?.title}</strong>.
              This action cannot be undone.
            </p>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteProduct} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete Product'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductManagement;