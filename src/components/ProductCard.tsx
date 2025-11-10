import React, { useState } from 'react';
import { Card, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { deleteProduct, updateProduct } from '../services/productService';
import type { Product, ProductUpdateData } from '../types/productType';

// Props interface for the ProductCard component
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductUpdated?: () => void; // Callback to refresh product list
}

// Functional component with TypeScript
const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onProductUpdated }) => {
  const { isAuthenticated } = useAuth();
  
  // State for handling image load errors
  const [imageError, setImageError] = useState(false);
  
  // State for edit/delete modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for edit form
  const [editData, setEditData] = useState<ProductUpdateData>({
    title: product.title,
    price: product.price,
    description: product.description,
    category: product.category,
    image: product.image,
    stock: product.inventory.stock,
    isActive: product.isActive
  });
  
  // Fallback image URL from placeholder service
  const fallbackImage = `https://via.placeholder.com/200x200/e9ecef/6c757d?text=${encodeURIComponent(product.category)}`;
  
  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  // Handle edit form changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  // Handle product update
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUpdating(true);
      setError(null);
      
      await updateProduct(product.id, editData);
      setShowEditModal(false);
      onProductUpdated?.(); // Refresh the product list
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error instanceof Error ? error.message : 'Failed to update product');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      
      await deleteProduct(product.id);
      setShowDeleteModal(false);
      onProductUpdated?.(); // Refresh the product list
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format stock display
  const formatStock = (): string => {
    if (!product.inventory.trackInventory) return '';
    const stock = product.inventory.stock;
    if (stock === 0) return 'Out of Stock';
    if (stock <= 5) return `Only ${stock} left`;
    return `${stock} in stock`;
  };

  // Check if product is in stock
  const isInStock = (): boolean => {
    if (!product.inventory.trackInventory) return true;
    return product.inventory.stock > 0;
  };

  return (
    <Card className="h-100 shadow-sm">
      <Card.Img 
        variant="top" 
        src={imageError ? fallbackImage : product.image} 
        alt={product.title}
        onError={handleImageError}
        style={{ 
          height: '200px', 
          objectFit: 'contain',
          padding: '10px'
        }}
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title className="text-truncate" title={product.title}>
          {product.title}
        </Card.Title>
        
        <Card.Text className="text-muted small">
          Category: {product.category}
        </Card.Text>
        
        {/* Stock Status */}
        {product.inventory.trackInventory && (
          <Card.Text className="small">
            <span className={`badge ${isInStock() ? 'bg-success' : 'bg-danger'}`}>
              {formatStock()}
            </span>
          </Card.Text>
        )}
        
        <Card.Text 
          className="flex-grow-1" 
          style={{ 
            fontSize: '0.9rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {product.description}
        </Card.Text>
        
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="h5 text-primary mb-0">
              ${product.price.toFixed(2)}
            </span>
            <small className="text-muted">
              ⭐ {product.rating.rate} ({product.rating.count})
            </small>
          </div>
          
          {/* Customer Actions */}
          <Button 
            variant="primary" 
            className="w-100 mb-2"
            onClick={() => onAddToCart(product)}
            disabled={!isInStock()}
          >
            {isInStock() ? 'Add to Cart' : 'Out of Stock'}
          </Button>
          
          {/* Admin Actions */}
          {isAuthenticated && (
            <div className="d-flex gap-1">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="flex-fill"
                onClick={() => setShowEditModal(true)}
              >
                ✏️ Edit
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm" 
                className="flex-fill"
                onClick={() => setShowDeleteModal(true)}
              >
                🗑️ Delete
              </Button>
            </div>
          )}
        </div>
      </Card.Body>
      
      {/* Edit Product Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Product: {product.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger">
              <strong>Error:</strong> {error}
            </Alert>
          )}
          
          <Form onSubmit={handleUpdateProduct}>
            <Form.Group className="mb-3">
              <Form.Label>Product Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editData.title}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={editData.category}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={editData.price}
                    onChange={handleEditChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </div>
            </div>
            
            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={editData.stock}
                onChange={handleEditChange}
                min="0"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={editData.description}
                onChange={handleEditChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                name="image"
                value={editData.image}
                onChange={handleEditChange}
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button 
                variant="success" 
                type="submit"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Updating...
                  </>
                ) : (
                  'Update Product'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger">
              <strong>Error:</strong> {error}
            </Alert>
          )}
          
          <p>Are you sure you want to delete this product?</p>
          <div className="bg-light p-3 rounded">
            <strong>{product.title}</strong><br />
            <small className="text-muted">Category: {product.category} • Price: ${product.price}</small>
          </div>
          <p className="text-danger mt-2 mb-0">
            <strong>This action cannot be undone.</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteProduct}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete Product'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default ProductCard;