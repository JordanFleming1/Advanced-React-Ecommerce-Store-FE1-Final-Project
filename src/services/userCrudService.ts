import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch,
  Timestamp 
} from "firebase/firestore";
import { 
  deleteUser,
  updateProfile as updateFirebaseProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { auth, db } from "../firebase/index";
import type { 
  UserProfile, 
  UserProfileUpdateData, 
  UserAddress, 
  UserPreferences 
} from "../types/authTypes";

/**
 * CRUD Operations for User Management in Firestore
 */

// ========================================
// CREATE Operations
// ========================================

/**
 * Create a new user profile document in Firestore
 * Called after successful Firebase Auth registration
 */
export const createUserProfile = async (
  uid: string,
  userData: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: Date;
  }
): Promise<UserProfile> => {
  try {
    const defaultPreferences: UserPreferences = {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
      theme: 'auto',
      currency: 'USD',
      language: 'en'
    };

    const userProfile: Omit<UserProfile, 'uid'> = {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      displayName: `${userData.firstName} ${userData.lastName}`,
      phone: userData.phone || '',
      dateOfBirth: userData.dateOfBirth,
      profilePicture: '',
      addresses: [],
      preferences: defaultPreferences,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true
    };

    // Save to Firestore
    await setDoc(doc(db, "users", uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      dateOfBirth: userData.dateOfBirth ? Timestamp.fromDate(userData.dateOfBirth) : null
    });

    return {
      uid,
      ...userProfile
    };
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw new Error("Failed to create user profile");
  }
};

/**
 * Add a new address to user's profile
 */
export const addUserAddress = async (uid: string, address: UserAddress): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User profile not found");
    }
    
    const currentAddresses = userDoc.data().addresses || [];
    
    // If this is the first address or marked as default, make it default
    if (currentAddresses.length === 0 || address.isDefault) {
      // Remove default from other addresses
      currentAddresses.forEach((addr: UserAddress) => {
        addr.isDefault = false;
      });
      address.isDefault = true;
    }
    
    await updateDoc(userRef, {
      addresses: [...currentAddresses, address],
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding user address:", error);
    throw new Error("Failed to add address");
  }
};

// ========================================
// READ Operations  
// ========================================

/**
 * Get user profile from Firestore by UID
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName,
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth?.toDate(),
        profilePicture: data.profilePicture || '',
        addresses: data.addresses || [],
        preferences: data.preferences || getDefaultPreferences(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate(),
        isActive: data.isActive !== false // Default to true if not set
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile");
  }
};

/**
 * Get user profile by email address
 */
export const getUserByEmail = async (email: string): Promise<UserProfile | null> => {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        uid: doc.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName,
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth?.toDate(),
        profilePicture: data.profilePicture || '',
        addresses: data.addresses || [],
        preferences: data.preferences || getDefaultPreferences(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate(),
        isActive: data.isActive !== false
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw new Error("Failed to fetch user");
  }
};

/**
 * Get user addresses
 */
export const getUserAddresses = async (uid: string): Promise<UserAddress[]> => {
  try {
    const userProfile = await getUserProfile(uid);
    return userProfile?.addresses || [];
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    throw new Error("Failed to fetch addresses");
  }
};

// ========================================
// UPDATE Operations
// ========================================

/**
 * Update user profile information
 */
export const updateUserProfile = async (
  uid: string, 
  updateData: UserProfileUpdateData
): Promise<UserProfile> => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User profile not found");
    }
    
    // Prepare update data
    const updates: Record<string, unknown> = {
      updatedAt: serverTimestamp()
    };
    
    if (updateData.firstName) {
      updates.firstName = updateData.firstName;
    }
    
    if (updateData.lastName) {
      updates.lastName = updateData.lastName;
    }
    
    // Update display name if first or last name changed
    if (updateData.firstName || updateData.lastName) {
      const currentData = userDoc.data();
      const firstName = updateData.firstName || currentData.firstName;
      const lastName = updateData.lastName || currentData.lastName;
      updates.displayName = `${firstName} ${lastName}`;
    }
    
    if (updateData.phone !== undefined) {
      updates.phone = updateData.phone;
    }
    
    if (updateData.dateOfBirth) {
      updates.dateOfBirth = Timestamp.fromDate(updateData.dateOfBirth);
    }
    
    if (updateData.profilePicture !== undefined) {
      updates.profilePicture = updateData.profilePicture;
    }
    
    if (updateData.addresses) {
      updates.addresses = updateData.addresses;
    }
    
    if (updateData.preferences) {
      const currentPreferences = userDoc.data().preferences || getDefaultPreferences();
      updates.preferences = { ...currentPreferences, ...updateData.preferences };
    }
    
    // Update Firestore document
    await updateDoc(userRef, updates);
    
    // Update Firebase Auth profile if display name changed
    if (updates.displayName && auth.currentUser) {
      await updateFirebaseProfile(auth.currentUser, {
        displayName: updates.displayName as string
      });
    }
    
    // Return updated profile
    const updatedProfile = await getUserProfile(uid);
    if (!updatedProfile) {
      throw new Error("Failed to fetch updated profile");
    }
    
    return updatedProfile;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update profile");
  }
};

/**
 * Update user email address
 */
export const updateUserEmail = async (
  uid: string, 
  newEmail: string, 
  currentPassword: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== uid) {
      throw new Error("User not authenticated");
    }
    
    // Re-authenticate user before email update
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update email in Firebase Auth
    await updateEmail(user, newEmail);
    
    // Update email in Firestore
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      email: newEmail,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating user email:", error);
    throw new Error("Failed to update email");
  }
};

/**
 * Update user password
 */
export const updateUserPassword = async (
  currentPassword: string, 
  newPassword: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Re-authenticate user before password update
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password in Firebase Auth
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error("Error updating password:", error);
    throw new Error("Failed to update password");
  }
};

/**
 * Update user address
 */
export const updateUserAddress = async (
  uid: string, 
  addressIndex: number, 
  updatedAddress: UserAddress
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User profile not found");
    }
    
    const addresses = userDoc.data().addresses || [];
    
    if (addressIndex < 0 || addressIndex >= addresses.length) {
      throw new Error("Invalid address index");
    }
    
    addresses[addressIndex] = updatedAddress;
    
    await updateDoc(userRef, {
      addresses: addresses,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating user address:", error);
    throw new Error("Failed to update address");
  }
};

/**
 * Update last login timestamp
 */
export const updateLastLogin = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating last login:", error);
    // Don't throw error for login timestamp update failure
  }
};

// ========================================
// DELETE Operations
// ========================================

/**
 * Delete user account and all associated data
 */
export const deleteUserAccount = async (uid: string, password: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== uid) {
      throw new Error("User not authenticated");
    }
    
    // Re-authenticate user before deletion
    const credential = EmailAuthProvider.credential(user.email!, password);
    await reauthenticateWithCredential(user, credential);
    
    // Use batch to delete all user data atomically
    const batch = writeBatch(db);
    
    // Delete user profile
    const userRef = doc(db, "users", uid);
    batch.delete(userRef);
    
    // Delete user's orders (if exists)
    const ordersQuery = query(collection(db, "orders"), where("userId", "==", uid));
    const ordersSnapshot = await getDocs(ordersQuery);
    ordersSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Delete user's cart data (if stored separately)
    const cartRef = doc(db, "carts", uid);
    batch.delete(cartRef);
    
    // Commit batch delete
    await batch.commit();
    
    // Delete user from Firebase Auth (this must be last)
    await deleteUser(user);
    
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw new Error("Failed to delete account");
  }
};

/**
 * Soft delete user account (mark as inactive)
 */
export const deactivateUserAccount = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error deactivating user account:", error);
    throw new Error("Failed to deactivate account");
  }
};

/**
 * Remove user address
 */
export const removeUserAddress = async (uid: string, addressIndex: number): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User profile not found");
    }
    
    const addresses = userDoc.data().addresses || [];
    
    if (addressIndex < 0 || addressIndex >= addresses.length) {
      throw new Error("Invalid address index");
    }
    
    addresses.splice(addressIndex, 1);
    
    await updateDoc(userRef, {
      addresses: addresses,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error removing user address:", error);
    throw new Error("Failed to remove address");
  }
};

// ========================================
// Utility Functions
// ========================================

/**
 * Get default user preferences
 */
const getDefaultPreferences = (): UserPreferences => ({
  emailNotifications: true,
  smsNotifications: false,
  marketingEmails: false,
  theme: 'auto',
  currency: 'USD',
  language: 'en'
});

/**
 * Check if user profile exists
 */
export const checkUserExists = async (uid: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists();
  } catch (error) {
    console.error("Error checking if user exists:", error);
    return false;
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (uid: string): Promise<{
  totalOrders: number;
  totalSpent: number;
  accountAge: number; // in days
}> => {
  try {
    const userProfile = await getUserProfile(uid);
    if (!userProfile) {
      throw new Error("User not found");
    }
    
    // Get orders count (if orders collection exists)
    const ordersQuery = query(collection(db, "orders"), where("userId", "==", uid));
    const ordersSnapshot = await getDocs(ordersQuery);
    
    const totalOrders = ordersSnapshot.size;
    const totalSpent = ordersSnapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().total || 0);
    }, 0);
    
    const accountAge = Math.floor(
      (new Date().getTime() - userProfile.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return { totalOrders, totalSpent, accountAge };
  } catch (error) {
    console.error("Error getting user stats:", error);
    throw new Error("Failed to get user statistics");
  }
};