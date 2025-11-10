import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner 
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import type { UserLoginData } from '../types/authTypes';

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState<UserLoginData>({
    email: '',
    password: ''
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  // Validate form data
  const validateForm = (): boolean => {
    // Check if all fields are filled
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    setValidated(true);
    
    if (!form.checkValidity() || !validateForm()) {
      e.stopPropagation();
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await loginUser(formData);
      setSuccess('Login successful! Redirecting...');
      
      // Reset form
      setFormData({
        email: '',
        password: ''
      });
      setValidated(false);
      
      // Redirect to home after 1 second
      setTimeout(() => {
        navigate('/');
      }, 1000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="text-primary">🔐 Welcome Back</h2>
                <p className="text-muted">Sign in to your account</p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {success}
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                {/* Email Field */}
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid email address.
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Password Field */}
                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your password"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide your password.
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Submit Button */}
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mb-3"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="text-muted mb-2">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-decoration-none text-primary">
                    Create one here
                  </Link>
                </p>
                <p className="text-muted mb-0">
                  <small>
                    <a href="#forgot-password" className="text-decoration-none text-secondary">
                      Forgot your password?
                    </a>
                  </small>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;