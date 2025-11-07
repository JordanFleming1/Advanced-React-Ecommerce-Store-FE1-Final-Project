import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import type { Product } from '../types/productType';

// Props interface for the ProductCard component
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

// Functional component with TypeScript
const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  // State for handling image load errors
  const [imageError, setImageError] = useState(false);
  
  // Fallback image URL from placeholder service
  const fallbackImage = `https://via.placeholder.com/200x200/e9ecef/6c757d?text=${encodeURIComponent(product.category)}`;
  
  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
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
          
          <Button 
            variant="primary" 
            className="w-100"
            onClick={() => onAddToCart(product)}
          >
            Add to Cart
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;