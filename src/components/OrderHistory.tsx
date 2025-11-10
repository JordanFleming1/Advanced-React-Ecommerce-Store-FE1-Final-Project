/**
 * Order History Component
 * Displays user's order history with detailed order viewing capabilities
 * Custom implementation for comprehensive order management
 */
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Table, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserOrders } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import type { Order, OrderStatus } from '../types/orderType';

const OrderHistory: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Fetch user orders
  const { 
    data: ordersResponse, 
    isLoading, 
    error, 
    isError 
  } = useQuery({
    queryKey: ['userOrders'],
    queryFn: () => getUserOrders(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle order click
  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: OrderStatus): string => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'processing': return 'primary';
      case 'shipped': return 'success';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Container className="mt-4">
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-3">Loading your order history...</p>
        </div>
      </Container>
    );
  }

  // Show error state
  if (isError) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load order history';
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>❌ Error Loading Orders</Alert.Heading>
          <p>{errorMessage}</p>
        </Alert>
      </Container>
    );
  }

  // Show authentication required
  if (!isAuthenticated) {
    return (
      <Container className="mt-4">
        <Alert variant="warning" className="text-center">
          <Alert.Heading>🔐 Please Log In</Alert.Heading>
          <p>You need to be logged in to view your order history.</p>
          <Link to="/login">
            <Button variant="primary">Log In</Button>
          </Link>
        </Alert>
      </Container>
    );
  }

  const orders = ordersResponse?.orders || [];

  return (
    <Container className="mt-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1>📋 Order History</h1>
          <p className="text-muted">View your previous orders and their status</p>
        </Col>
      </Row>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Row>
          <Col>
            <Alert variant="info" className="text-center">
              <Alert.Heading>📦 No Orders Yet</Alert.Heading>
              <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
              <Link to="/">
                <Button variant="primary">Start Shopping</Button>
              </Link>
            </Alert>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Your Orders ({orders.length})</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Order</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <div>
                            <strong>{order.orderNumber}</strong>
                            <br />
                            <small className="text-muted">#{order.id.substring(0, 8)}</small>
                          </div>
                        </td>
                        <td>
                          <small>{formatDate(order.createdAt)}</small>
                        </td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </td>
                        <td>
                          <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                        </td>
                        <td>
                          <strong>${order.summary.total.toFixed(2)}</strong>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleOrderClick(order)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Order Details Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Order Details - {selectedOrder?.orderNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              {/* Order Information */}
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Order Information</h6>
                  <p><strong>Order Number:</strong> {selectedOrder.orderNumber}</p>
                  <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p><strong>Status:</strong> {' '}
                    <Badge bg={getStatusBadgeVariant(selectedOrder.status)}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                  </p>
                  {selectedOrder.trackingNumber && (
                    <p><strong>Tracking:</strong> {selectedOrder.trackingNumber}</p>
                  )}
                </Col>
                <Col md={6}>
                  <h6>Shipping Address</h6>
                  <address>
                    <strong>{selectedOrder.shippingAddress.fullName}</strong><br />
                    {selectedOrder.shippingAddress.addressLine1}<br />
                    {selectedOrder.shippingAddress.addressLine2 && (
                      <>{selectedOrder.shippingAddress.addressLine2}<br /></>
                    )}
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br />
                    {selectedOrder.shippingAddress.country}
                    {selectedOrder.shippingAddress.phone && (
                      <><br />Phone: {selectedOrder.shippingAddress.phone}</>
                    )}
                  </address>
                </Col>
              </Row>

              {/* Order Items */}
              <h6>Order Items</h6>
              <Table striped bordered hover responsive className="mb-4">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={item.product.image} 
                            alt={item.product.title}
                            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                            className="me-2"
                          />
                          <div>
                            <strong>{item.product.title}</strong>
                            <br />
                            <small className="text-muted">{item.product.category}</small>
                          </div>
                        </div>
                      </td>
                      <td>${item.priceAtTime.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td><strong>${item.totalPrice.toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Order Summary */}
              <Row>
                <Col md={6} className="ms-auto">
                  <Table borderless>
                    <tbody>
                      <tr>
                        <td>Subtotal:</td>
                        <td className="text-end">${selectedOrder.summary.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Tax:</td>
                        <td className="text-end">${selectedOrder.summary.tax.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Shipping:</td>
                        <td className="text-end">${selectedOrder.summary.shipping.toFixed(2)}</td>
                      </tr>
                      {selectedOrder.summary.discount > 0 && (
                        <tr>
                          <td>Discount:</td>
                          <td className="text-end text-success">-${selectedOrder.summary.discount.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="fw-bold border-top">
                        <td>Total:</td>
                        <td className="text-end">${selectedOrder.summary.total.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>

              {/* Order Notes */}
              {selectedOrder.notes && (
                <div className="mt-3">
                  <h6>Order Notes</h6>
                  <div className="bg-light p-3 rounded">
                    {selectedOrder.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrderHistory;