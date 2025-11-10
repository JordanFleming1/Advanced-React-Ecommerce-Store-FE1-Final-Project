import React, { useState } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { getProducts } from '../services/productService';

const FirebaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to test');
  const [isLoading, setIsLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    setStatus('Testing Firebase connection...');
    
    try {
      const result = await getProducts();
      const products = Array.isArray(result) ? result : result.products;
      setStatus(`✅ Firebase connection successful! Found ${products.length} products.`);
    } catch (error) {
      console.error('Firebase test error:', error);
      setStatus(`❌ Firebase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header>
          <h3>🔥 Firebase Connection Test</h3>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <strong>Status:</strong> {status}
          </Alert>
          <Button 
            variant="primary" 
            onClick={testFirebaseConnection}
            disabled={isLoading}
          >
            {isLoading ? 'Testing...' : 'Test Firebase Connection'}
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FirebaseTest;