import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  Spinner,
  Alert,
  Tab,
  Tabs,
  ListGroup,
  Modal
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  getUserProfile, 
  getUserStats, 
  deactivateUserAccount,
  deleteUserAccount 
} from '../services/userCrudService';
import type { UserProfile } from '../types/authTypes';

const UserProfilePage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<{
    totalOrders: number;
    totalSpent: number;
    accountAge: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load profile and stats in parallel
        const [profileData, statsData] = await Promise.all([
          getUserProfile(user.uid),
          getUserStats(user.uid)
        ]);
        
        setProfile(profileData);
        setUserStats(statsData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load user data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      loadData();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, user, authLoading]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Load profile and stats in parallel
      const [profileData, statsData] = await Promise.all([
        getUserProfile(user.uid),
        getUserStats(user.uid)
      ]);
      
      setProfile(profileData);
      setUserStats(statsData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load user data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !deletePassword) return;
    
    try {
      setDeleteLoading(true);
      await deleteUserAccount(user.uid, deletePassword);
      // User will be logged out after account deletion
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete account';
      setError(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!user) return;
    
    try {
      await deactivateUserAccount(user.uid);
      await loadUserData(); // Refresh profile data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate account';
      setError(errorMessage);
    }
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Not specified';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: profile?.preferences?.currency || 'USD'
    }).format(amount);
  };

  if (authLoading || loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="text-center">
              <Card.Body>
                <h3>🔐 Access Denied</h3>
                <p>Please log in to view your profile.</p>
                <Link to="/login">
                  <Button variant="primary">Sign In</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <Alert.Heading>Error Loading Profile</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={loadUserData}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <Alert.Heading>Profile Not Found</Alert.Heading>
          <p>Your profile information could not be found.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Profile Header */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="d-flex align-items-center">
                    {profile.profilePicture ? (
                      <img 
                        src={profile.profilePicture} 
                        alt="Profile" 
                        className="rounded-circle me-3"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                        style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                      >
                        {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h2 className="mb-1">{profile.displayName}</h2>
                      <p className="text-muted mb-1">{profile.email}</p>
                      <div>
                        <Badge 
                          bg={profile.isActive ? 'success' : 'secondary'}
                          className="me-2"
                        >
                          {profile.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {userStats && (
                          <small className="text-muted">
                            Member for {userStats.accountAge} days
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={4} className="text-end">
                  <Link to="/profile/edit">
                    <Button variant="outline-primary" className="me-2">
                      ✏️ Edit Profile
                    </Button>
                  </Link>
                  <Button 
                    variant="outline-secondary"
                    onClick={loadUserData}
                    disabled={loading}
                  >
                    🔄 Refresh
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Profile Tabs */}
      <Tabs defaultActiveKey="overview" className="mb-4">
        {/* Overview Tab */}
        <Tab eventKey="overview" title="📊 Overview">
          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">👤 Personal Information</h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between">
                      <strong>First Name:</strong>
                      <span>{profile.firstName}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <strong>Last Name:</strong>
                      <span>{profile.lastName}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <strong>Email:</strong>
                      <span>{profile.email}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <strong>Phone:</strong>
                      <span>{profile.phone || 'Not specified'}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <strong>Date of Birth:</strong>
                      <span>{formatDate(profile.dateOfBirth)}</span>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              {userStats && (
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">📈 Account Statistics</h5>
                  </Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="d-flex justify-content-between">
                        <strong>Total Orders:</strong>
                        <Badge bg="primary">{userStats.totalOrders}</Badge>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between">
                        <strong>Total Spent:</strong>
                        <Badge bg="success">{formatCurrency(userStats.totalSpent)}</Badge>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between">
                        <strong>Account Age:</strong>
                        <span>{userStats.accountAge} days</span>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between">
                        <strong>Member Since:</strong>
                        <span>{formatDate(profile.createdAt)}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between">
                        <strong>Last Login:</strong>
                        <span>{formatDate(profile.lastLoginAt)}</span>
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Tab>

        {/* Addresses Tab */}
        <Tab eventKey="addresses" title="📍 Addresses">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Saved Addresses</h5>
              <Link to="/profile/addresses/add">
                <Button variant="primary" size="sm">
                  ➕ Add Address
                </Button>
              </Link>
            </Card.Header>
            <Card.Body>
              {profile.addresses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No addresses saved yet.</p>
                  <Link to="/profile/addresses/add">
                    <Button variant="outline-primary">Add Your First Address</Button>
                  </Link>
                </div>
              ) : (
                <div className="row g-3">
                  {profile.addresses.map((address, index) => (
                    <div key={index} className="col-md-6">
                      <Card className="h-100">
                        <Card.Body>
                          {address.isDefault && (
                            <Badge bg="primary" className="mb-2">Default</Badge>
                          )}
                          <p className="mb-1"><strong>{address.street}</strong></p>
                          <p className="mb-1">{address.city}, {address.state} {address.zipCode}</p>
                          <p className="mb-0 text-muted">{address.country}</p>
                        </Card.Body>
                        <Card.Footer className="bg-transparent">
                          <Link to={`/profile/addresses/edit/${index}`}>
                            <Button variant="outline-primary" size="sm" className="me-2">
                              Edit
                            </Button>
                          </Link>
                          <Button variant="outline-danger" size="sm">
                            Remove
                          </Button>
                        </Card.Footer>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Preferences Tab */}
        <Tab eventKey="preferences" title="⚙️ Preferences">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Account Preferences</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Notifications</h6>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Email Notifications</span>
                      <Badge bg={profile.preferences.emailNotifications ? 'success' : 'secondary'}>
                        {profile.preferences.emailNotifications ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>SMS Notifications</span>
                      <Badge bg={profile.preferences.smsNotifications ? 'success' : 'secondary'}>
                        {profile.preferences.smsNotifications ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Marketing Emails</span>
                      <Badge bg={profile.preferences.marketingEmails ? 'success' : 'secondary'}>
                        {profile.preferences.marketingEmails ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                <Col md={6}>
                  <h6>Display Settings</h6>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Theme</span>
                      <Badge bg="info">{profile.preferences.theme}</Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Currency</span>
                      <Badge bg="info">{profile.preferences.currency}</Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Language</span>
                      <Badge bg="info">{profile.preferences.language}</Badge>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
              <hr />
              <div className="text-end">
                <Link to="/profile/preferences">
                  <Button variant="primary">Update Preferences</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        {/* Account Management Tab */}
        <Tab eventKey="account" title="🔧 Account">
          <Card>
            <Card.Header>
              <h5 className="mb-0 text-danger">⚠️ Account Management</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="warning">
                <Alert.Heading>Danger Zone</Alert.Heading>
                <p>These actions are permanent and cannot be undone.</p>
              </Alert>
              
              <div className="d-grid gap-3">
                <div className="p-3 border rounded">
                  <h6>Deactivate Account</h6>
                  <p className="text-muted mb-2">
                    Temporarily disable your account. You can reactivate it later by contacting support.
                  </p>
                  <Button 
                    variant="warning" 
                    onClick={handleDeactivateAccount}
                    disabled={!profile.isActive}
                  >
                    {profile.isActive ? 'Deactivate Account' : 'Account Already Deactivated'}
                  </Button>
                </div>
                
                <div className="p-3 border border-danger rounded">
                  <h6 className="text-danger">Delete Account</h6>
                  <p className="text-muted mb-2">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button 
                    variant="danger" 
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete Account Permanently
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Delete Account Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">⚠️ Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <Alert.Heading>This action is permanent!</Alert.Heading>
            <p>Deleting your account will:</p>
            <ul>
              <li>Remove all your personal data</li>
              <li>Delete your order history</li>
              <li>Remove saved addresses and preferences</li>
              <li>Cancel any active subscriptions</li>
            </ul>
            <p className="mb-0"><strong>This cannot be undone.</strong></p>
          </Alert>
          
          <div className="mb-3">
            <label htmlFor="deletePassword" className="form-label">
              Enter your password to confirm:
            </label>
            <input
              type="password"
              className="form-control"
              id="deletePassword"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Your current password"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowDeleteModal(false);
              setDeletePassword('');
            }}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteAccount}
            disabled={!deletePassword || deleteLoading}
          >
            {deleteLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  className="me-2"
                />
                Deleting Account...
              </>
            ) : (
              'Delete My Account'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserProfilePage;