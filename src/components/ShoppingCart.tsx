import React, { useState } from 'react';
import { 
  Offcanvas, 
  Row, 
  Col, 
  Card, 
  Button, 
  InputGroup, 
  Form,
  Alert,
  Badge
} from 'react-bootstrap';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { 
  closeCart, 
  removeFromCart, 
  incrementQuantity, 
  decrementQuantity, 
  updateCartItemQuantity,
  clearCart 
} from '../store/cartSlice';

const ShoppingCart: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, totalItems, totalPrice, isOpen } = useAppSelector((state) => state.cart);
  
  // State for checkout process
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  
  // State for image errors (track by product ID)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Handle image error for specific product
  const handleImageError = (productId: number) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  // Handle cart close
  const handleClose = () => {
    dispatch(closeCart());
    setCheckoutSuccess(false); // Reset success message when closing
  };

  // Handle remove item from cart
  const handleRemoveItem = (productId: number) => {
    dispatch(removeFromCart(productId));
  };

  // Handle increment quantity
  const handleIncrement = (productId: number) => {
    dispatch(incrementQuantity(productId));
  };

  // Handle decrement quantity
  const handleDecrement = (productId: number) => {
    dispatch(decrementQuantity(productId));
  };

  // Handle manual quantity change
  const handleQuantityChange = (productId: number, newQuantity: string) => {
    const quantity = parseInt(newQuantity);
    if (!isNaN(quantity) && quantity >= 0) {
      if (quantity === 0) {
        dispatch(removeFromCart(productId));
      } else {
        dispatch(updateCartItemQuantity({ productId, quantity }));
      }
    }
  };

  // Handle checkout
  const handleCheckout = async () => {
    setIsCheckingOut(true);
    
    // Simulate checkout process (since FakeStore API doesn't have real checkout)
    setTimeout(() => {
      // Clear the cart
      dispatch(clearCart());
      setIsCheckingOut(false);
      setCheckoutSuccess(true);
      
      // Auto-close success message after 3 seconds
      setTimeout(() => {
        setCheckoutSuccess(false);
        handleClose();
      }, 3000);
    }, 2000); // 2 second delay to simulate processing
  };

  return (
    <Offcanvas show={isOpen} onHide={handleClose} placement="end" style={{ width: '400px' }}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          🛒 Shopping Cart 
          {totalItems > 0 && (
            <Badge bg="danger" className="ms-2">
              {totalItems}
            </Badge>
          )}
        </Offcanvas.Title>
      </Offcanvas.Header>
      
      <Offcanvas.Body>
        {checkoutSuccess ? (
          // Checkout Success Message
          <Alert variant="success" className="text-center">
            <Alert.Heading>🎉 Order Successful!</Alert.Heading>
            <p>Thank you for your purchase! Your cart has been cleared.</p>
            <p className="small text-muted">This window will close automatically...</p>
          </Alert>
        ) : items.length === 0 ? (
          // Empty Cart
          <div className="text-center py-5">
            <h5 className="text-muted">Your cart is empty</h5>
            <p className="text-muted">Add some products to get started!</p>
            <Button variant="primary" onClick={handleClose}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          // Cart with Items
          <>
            {/* Cart Items */}
            <div className="cart-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {items.map((item) => (
                <Card key={item.id} className="mb-3 border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <Row className="align-items-center">
                      {/* Product Image */}
                      <Col xs={3}>
                        <img 
                          src={imageErrors[item.id] 
                            ? `https://via.placeholder.com/60x60/e9ecef/6c757d?text=${encodeURIComponent(item.product.category)}`
                            : item.product.image
                          } 
                          alt={item.product.title}
                          onError={() => handleImageError(item.id)}
                          style={{ 
                            width: '100%', 
                            height: '60px', 
                            objectFit: 'contain' 
                          }}
                        />
                      </Col>
                      
                      {/* Product Details */}
                      <Col xs={9}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1 me-2">
                            <h6 className="mb-1" style={{ fontSize: '0.9rem' }}>
                              {item.product.title.length > 40 
                                ? `${item.product.title.substring(0, 40)}...` 
                                : item.product.title
                              }
                            </h6>
                            <p className="text-primary mb-2 fw-bold">
                              ${item.product.price.toFixed(2)} each
                            </p>
                          </div>
                          
                          {/* Remove Button */}
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            ✕
                          </Button>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="d-flex align-items-center justify-content-between">
                          <InputGroup size="sm" style={{ width: '120px' }}>
                            <Button 
                              variant="outline-secondary"
                              onClick={() => handleDecrement(item.id)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <Form.Control
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              min="1"
                              className="text-center"
                            />
                            <Button 
                              variant="outline-secondary"
                              onClick={() => handleIncrement(item.id)}
                            >
                              +
                            </Button>
                          </InputGroup>
                          
                          {/* Item Total */}
                          <div className="text-end">
                            <strong>${(item.product.price * item.quantity).toFixed(2)}</strong>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>
            
            {/* Cart Summary */}
            <div className="cart-summary border-top pt-3 mt-3">
              <Row className="mb-2">
                <Col>
                  <strong>Total Items:</strong>
                </Col>
                <Col className="text-end">
                  <strong>{totalItems}</strong>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col>
                  <h5>Total Price:</h5>
                </Col>
                <Col className="text-end">
                  <h5 className="text-primary">${totalPrice.toFixed(2)}</h5>
                </Col>
              </Row>
              
              {/* Action Buttons */}
              <div className="d-grid gap-2">
                <Button 
                  variant="success" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Processing...
                    </>
                  ) : (
                    `Checkout ($${totalPrice.toFixed(2)})`
                  )}
                </Button>
                
                <Button 
                  variant="outline-secondary"
                  onClick={handleClose}
                  disabled={isCheckingOut}
                >
                  Continue Shopping
                </Button>
                
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => dispatch(clearCart())}
                  disabled={isCheckingOut}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default ShoppingCart;
