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
  Badge,
} from 'react-bootstrap';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { useAuth } from '../hooks/useAuth';
import { createOrder } from '../services/orderService';
import type { CreateOrderData, ShippingAddress } from '../types/orderType';
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
  const { isAuthenticated, user } = useAuth();
  
  // State for checkout process
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  
  // State for image errors (track by product ID)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // State for shipping address
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: user?.displayName || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: ''
  });

  // Handle image error for specific product
  const handleImageError = (productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  // Handle cart close
  const handleClose = () => {
    dispatch(closeCart());
    setCheckoutSuccess(false); // Reset success message when closing
    setCheckoutError(null);
    setShowShippingForm(false);
  };

  // Handle shipping address changes
  const handleShippingAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle initial checkout (show shipping form)
  const handleCheckout = () => {
    if (!isAuthenticated) {
      setCheckoutError('Please log in to place an order');
      return;
    }
    
    if (items.length === 0) {
      setCheckoutError('Your cart is empty');
      return;
    }
    
    setShowShippingForm(true);
  };

  // Handle final order placement
  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setCheckoutError('Please log in to place an order');
      return;
    }

    try {
      setIsCheckingOut(true);
      setCheckoutError(null);
      
      // Validate shipping address
      if (!shippingAddress.fullName || !shippingAddress.addressLine1 || 
          !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
        throw new Error('Please fill in all required shipping address fields');
      }

      // Create order data from cart items
      const orderData: CreateOrderData = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        shippingAddress,
        paymentMethod: 'Credit Card' // Simplified for now
      };

      console.log('Creating order with data:', orderData);
      
      // Create the order
      const order = await createOrder(orderData);
      
      console.log('Order created successfully:', order);
      
      // Clear the cart and show success
      dispatch(clearCart());
      setOrderNumber(order.orderNumber);
      setCheckoutSuccess(true);
      setShowShippingForm(false);
      
      // Close success message automatically after 5 seconds
      setTimeout(() => {
        setCheckoutSuccess(false);
        handleClose();
      }, 5000);
      
    } catch (error) {
      console.error('Error creating order:', error);
      setCheckoutError(error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Handle remove item from cart
  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  // Handle increment quantity
  const handleIncrement = (productId: string) => {
    dispatch(incrementQuantity(productId));
  };

  // Handle decrement quantity
  const handleDecrement = (productId: string) => {
    dispatch(decrementQuantity(productId));
  };

  // Handle manual quantity change
  const handleQuantityChange = (productId: string, newQuantity: string) => {
    const quantity = parseInt(newQuantity);
    if (!isNaN(quantity) && quantity >= 0) {
      if (quantity === 0) {
        dispatch(removeFromCart(productId));
      } else {
        dispatch(updateCartItemQuantity({ productId, quantity }));
      }
    }
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
            <Alert.Heading>🎉 Order Placed Successfully!</Alert.Heading>
            <p>Thank you for your purchase!</p>
            <p><strong>Order Number:</strong> {orderNumber}</p>
            <p className="small text-muted">You can view your order in the Order History section.</p>
          </Alert>
        ) : checkoutError ? (
          // Error Message
          <Alert variant="danger">
            <Alert.Heading>❌ Checkout Error</Alert.Heading>
            <p>{checkoutError}</p>
            <Button 
              variant="outline-danger" 
              size="sm" 
              onClick={() => setCheckoutError(null)}
            >
              Try Again
            </Button>
          </Alert>
        ) : showShippingForm ? (
          // Shipping Address Form
          <div>
            <h5 className="mb-3">Shipping Address</h5>
            <Form>
              <Row>
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleShippingAddressChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Address Line 1 *</Form.Label>
                <Form.Control
                  type="text"
                  name="addressLine1"
                  value={shippingAddress.addressLine1}
                  onChange={handleShippingAddressChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Address Line 2</Form.Label>
                <Form.Control
                  type="text"
                  name="addressLine2"
                  value={shippingAddress.addressLine2}
                  onChange={handleShippingAddressChange}
                />
              </Form.Group>
              
              <Row>
                <Col xs={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>City *</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleShippingAddressChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>State *</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleShippingAddressChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col xs={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>ZIP Code *</Form.Label>
                    <Form.Control
                      type="text"
                      name="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={handleShippingAddressChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleShippingAddressChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
            
            {/* Order Summary */}
            <div className="border-top pt-3 mt-3">
              <Row>
                <Col>
                  <strong>Total: ${totalPrice.toFixed(2)}</strong>
                </Col>
              </Row>
            </div>
            
            {/* Action Buttons */}
            <div className="d-grid gap-2 mt-3">
              <Button 
                variant="success" 
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order ($${totalPrice.toFixed(2)})`
                )}
              </Button>
              
              <Button 
                variant="outline-secondary"
                onClick={() => setShowShippingForm(false)}
                disabled={isCheckingOut}
              >
                Back to Cart
              </Button>
            </div>
          </div>
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
                  disabled={isCheckingOut || !isAuthenticated}
                >
                  {!isAuthenticated ? (
                    'Please Log In to Checkout'
                  ) : (
                    `Proceed to Checkout ($${totalPrice.toFixed(2)})`
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
