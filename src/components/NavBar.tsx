import React from 'react';
import { Navbar, Nav, Badge } from 'react-bootstrap';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { toggleCart } from '../store/cartSlice';

const NavBar: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Get cart state from Redux
  const { totalItems } = useAppSelector((state) => state.cart);

  // Handle cart toggle
  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(toggleCart());
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
      <Navbar.Brand href="#home">🛍️ Jolyca Co.</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="#home">Home</Nav.Link>
        </Nav>
        <Nav>
          <Nav.Link href="#cart" className="position-relative" onClick={handleCartClick}>
            🛒 Cart
            <Badge 
              bg="danger" 
              className="position-absolute top-0 start-100 translate-middle"
            >
              {totalItems}
            </Badge>
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavBar;