import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChange, getUserProfile, logoutUser } from '../services/authService';
import type { AuthContextType, UserProfile } from '../types/authTypes';
import type { User } from 'firebase/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser: User | null) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userProfile = await getUserProfile(firebaseUser.uid);
          if (userProfile) {
            setUser(userProfile);
            setIsAuthenticated(true);
          } else {
            // If no profile found, user might be registered but profile not created
            console.warn('User authenticated but no profile found');
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
          setIsAuthenticated(false);
          setError('Failed to load user profile');
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (): Promise<void> => {
    setError(null);
    // Registration is handled by the components directly
    // This is here for context completeness
  };

  const login = async (): Promise<void> => {
    setError(null);
    // Login is handled by the components directly
    // This is here for context completeness
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await logoutUser();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
      setError(errorMessage);
      throw error;
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

