import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  type User
} from "firebase/auth";
import { auth } from "../firebase/index";
import { createUserProfile, getUserProfile, updateLastLogin } from "./userCrudService";
import type { UserRegistrationData, UserLoginData, UserProfile } from "../types/authTypes";

/**
 * Register a new user with email and password
 * Creates user in Firebase Auth and corresponding document in Firestore
 */
export const registerUser = async (userData: UserRegistrationData): Promise<UserProfile> => {
  try {
    // Validate password confirmation
    if (userData.password !== userData.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    const user = userCredential.user;
    const displayName = `${userData.firstName} ${userData.lastName}`;

    // Update the user's display name in Firebase Auth
    await updateProfile(user, {
      displayName: displayName
    });

    // Create user profile document in Firestore using CRUD service
    const userProfile = await createUserProfile(user.uid, {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined
    });

    return userProfile;
  } catch (error) {
    console.error("Error registering user:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to register user";
    throw new Error(getAuthErrorMessage(errorMessage));
  }
};

/**
 * Sign in user with email and password
 */
export const loginUser = async (userData: UserLoginData): Promise<UserProfile> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    const user = userCredential.user;
    
    // Update last login timestamp
    await updateLastLogin(user.uid);
    
    // Get user profile from Firestore using CRUD service
    const userProfile = await getUserProfile(user.uid);
    
    if (!userProfile) {
      throw new Error("User profile not found");
    }
    
    return userProfile;
  } catch (error) {
    console.error("Error signing in:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to sign in";
    throw new Error(getAuthErrorMessage(errorMessage));
  }
};

/**
 * Sign out current user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw new Error("Failed to sign out");
  }
};

/**
 * Auth state listener
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Export getUserProfile from CRUD service for convenience
 */
export { getUserProfile } from "./userCrudService";

/**
 * Get user-friendly error messages
 */
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please use a different email or try logging in.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password with at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address. Please enter a valid email.';
    case 'auth/user-not-found':
      return 'No account found with this email address. Please check your email or register for a new account.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment before trying again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'Passwords do not match':
      return 'Passwords do not match. Please make sure both passwords are identical.';
    default:
      return errorCode || 'An unexpected error occurred. Please try again.';
  }
};