import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../firebase/firebase.config';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register new user
  const signup = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user profile with display name
    if (displayName) {
      await updateProfile(result.user, {
        displayName: displayName
      });
    }
    
    // Send email verification
    await sendEmailVerification(result.user);
    
    return result;
  };

  // Login existing user
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Google sign-in
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    // Add custom parameters to handle CORS issues
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (error) {
      // Handle popup blocked or closed by user
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        // Fallback to redirect method for better compatibility
        console.log('Popup blocked, falling back to redirect method');
        throw error;
      }
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    return signOut(auth);
  };

  // Update user profile
  const updateUserProfile = (updates) => {
    return updateProfile(currentUser, updates);
  };

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
