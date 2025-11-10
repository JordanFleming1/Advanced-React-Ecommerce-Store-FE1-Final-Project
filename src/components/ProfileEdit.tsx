import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner,
  Tab,
  Tabs
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  getUserProfile, 
  updateUserProfile,
  updateUserEmail,
  updateUserPassword 
} from '../services/userCrudService';
import type { UserProfile, UserProfileUpdateData, UserPreferences } from '../types/authTypes';

const ProfileEdit: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: ''
  });
  
  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    theme: 'auto' as const,
    currency: 'USD',
    language: 'en'
  });
  
  // Email/Password state
  const [emailData, setEmailData] = useState({
    newEmail: '',
    currentPassword: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const profileData = await getUserProfile(user.uid);
        
        if (profileData) {
          setProfile(profileData);
          setFormData({
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            phone: profileData.phone || '',
            dateOfBirth: profileData.dateOfBirth 
              ? profileData.dateOfBirth.toISOString().split('T')[0] 
              : ''
          });
          setPreferences(profileData.preferences);
          setEmailData(prev => ({ ...prev, newEmail: profileData.email }));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load profile';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      loadData();
    } else if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const profileData = await getUserProfile(user.uid);
      
      if (profileData) {
        setProfile(profileData);
        setFormData({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone || '',
          dateOfBirth: profileData.dateOfBirth 
            ? profileData.dateOfBirth.toISOString().split('T')[0] 
            : ''
        });
        setPreferences(profileData.preferences);
        setEmailData(prev => ({ ...prev, newEmail: profileData.email }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const updateData: UserProfileUpdateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        preferences: preferences
      };
      
      await updateUserProfile(user.uid, updateData);
      setSuccess('Profile updated successfully!');
      
      // Refresh profile data
      await loadProfile();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSaving(true);
      setError(null);
      
      await updateUserEmail(user.uid, emailData.newEmail, emailData.currentPassword);
      setSuccess('Email updated successfully!');
      setEmailData(prev => ({ ...prev, currentPassword: '' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update email';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
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

  if (!profile) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Profile Not Found</Alert.Heading>
          <p>Unable to load your profile information.</p>
          <Button variant="outline-danger" onClick={loadProfile}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">✏️ Edit Profile</h3>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate('/profile')}
                >
                  ← Back to Profile
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Success/Error Alerts */}
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="mb-4">
                  {success}
                </Alert>
              )}

              {/* Edit Tabs */}
              <Tabs 
                activeKey={activeTab} 
                onSelect={(k) => setActiveTab(k || 'profile')} 
                className="mb-4"
              >
                {/* Profile Information Tab */}
                <Tab eventKey="profile" title="👤 Profile Info">
                  <Form onSubmit={handleProfileSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(optional)"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                      />
                    </Form.Group>

                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={saving}
                      className="me-2"
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Saving...
                        </>
                      ) : (
                        'Save Profile'
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline-secondary"
                      onClick={() => navigate('/profile')}
                    >
                      Cancel
                    </Button>
                  </Form>
                </Tab>

                {/* Preferences Tab */}
                <Tab eventKey="preferences" title="⚙️ Preferences">
                  <Form onSubmit={handleProfileSubmit}>
                    <h5>Notifications</h5>
                    <Form.Check
                      type="checkbox"
                      name="emailNotifications"
                      label="Email Notifications"
                      checked={preferences.emailNotifications}
                      onChange={handlePreferenceChange}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      name="smsNotifications"
                      label="SMS Notifications"
                      checked={preferences.smsNotifications}
                      onChange={handlePreferenceChange}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      name="marketingEmails"
                      label="Marketing Emails"
                      checked={preferences.marketingEmails}
                      onChange={handlePreferenceChange}
                      className="mb-4"
                    />

                    <h5>Display Settings</h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Theme</Form.Label>
                          <Form.Select
                            name="theme"
                            value={preferences.theme}
                            onChange={handlePreferenceChange}
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Currency</Form.Label>
                          <Form.Select
                            name="currency"
                            value={preferences.currency}
                            onChange={handlePreferenceChange}
                          >
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="CAD">CAD - Canadian Dollar</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-4">
                      <Form.Label>Language</Form.Label>
                      <Form.Select
                        name="language"
                        value={preferences.language}
                        onChange={handlePreferenceChange}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </Form.Select>
                    </Form.Group>

                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Saving...
                        </>
                      ) : (
                        'Save Preferences'
                      )}
                    </Button>
                  </Form>
                </Tab>

                {/* Email Tab */}
                <Tab eventKey="email" title="📧 Email">
                  <Form onSubmit={handleEmailSubmit}>
                    <Alert variant="info">
                      <strong>Current Email:</strong> {profile.email}
                    </Alert>

                    <Form.Group className="mb-3">
                      <Form.Label>New Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="newEmail"
                        value={emailData.newEmail}
                        onChange={handleEmailChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={emailData.currentPassword}
                        onChange={handleEmailChange}
                        required
                        placeholder="Enter your current password to confirm"
                      />
                    </Form.Group>

                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={saving || emailData.newEmail === profile.email}
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Updating...
                        </>
                      ) : (
                        'Update Email'
                      )}
                    </Button>
                  </Form>
                </Tab>

                {/* Password Tab */}
                <Tab eventKey="password" title="🔒 Password">
                  <Form onSubmit={handlePasswordSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                      />
                      <Form.Text className="text-muted">
                        Password must be at least 6 characters long.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                      />
                    </Form.Group>

                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </Form>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileEdit;