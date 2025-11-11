import React, { useState } from 'react';
import { Navbar, Nav, Badge, Dropdown, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { useAuth } from '../hooks/useAuth';
import { toggleCart } from '../store/cartSlice';

const NavBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get cart state from Redux
  const { totalItems } = useAppSelector((state) => state.cart);

  // Handle cart toggle
  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(toggleCart());
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      setError(null);
      await logout();
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
      setError(errorMessage);
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-0">
          {error}
        </Alert>
      )}
      <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
        <Navbar.Brand as={Link} to="/">🛍️ Jolyca Co.</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
          </Nav>
          <Nav className="d-flex align-items-center">
            {/* Cart */}
            <Nav.Link href="#cart" className="position-relative me-3" onClick={handleCartClick}>
              🛒 Cart
              <Badge 
                bg="danger" 
                className="position-absolute top-0 start-100 translate-middle"
              >
                {totalItems}
              </Badge>
            </Nav.Link>
            
            {/* Authentication Section */}
            {loading ? (
              <div className="text-light">Loading...</div>
            ) : isAuthenticated && user ? (
              /* Authenticated User Dropdown */
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-light" id="user-dropdown">
                  👤 {user.firstName} {user.lastName}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Header>
                    <div><strong>{user.displayName}</strong></div>
                    <div className="text-muted small">{user.email}</div>
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="/profile">
                    👤 View Profile
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/profile/edit">
                    🔧 Edit Profile
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="/admin/products">
                    📦 Manage Products
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/orders">
                    📦 My Orders
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="/debug-products">
                    🐛 Debug Products
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item 
                    onClick={handleLogout}
                    disabled={logoutLoading}
                  >
                    {logoutLoading ? '🔄 Signing out...' : '🚪 Sign Out'}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              /* Non-authenticated User Buttons */
              <div className="d-flex gap-2">
                <Link to="/login">
                  <Button 
                    variant="outline-light" 
                    size="sm"
                  >
                    🔐 Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    variant="primary" 
                    size="sm"
                  >
                    📝 Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};

export default NavBar;