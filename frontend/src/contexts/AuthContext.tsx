'use client';

/**
 * Authentication Context Provider
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined' || !auth) {
      setLoading(false);
      return;
    }

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      // Set/clear auth cookie for middleware
      if (user) {
        // Get the ID token and set it in a cookie
        const token = await user.getIdToken();
        document.cookie = `firebase-auth-token=${token}; path=/; max-age=3600; SameSite=Lax`;
      } else {
        // Clear the cookie on sign out
        document.cookie = 'firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not initialized');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sign in';
      throw new Error(message);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!auth) throw new Error('Firebase not initialized');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sign up';
      throw new Error(message);
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase not initialized');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sign in with Google';
      throw new Error(message);
    }
  };

  const signOut = async () => {
    if (!auth) throw new Error('Firebase not initialized');
    try {
      await firebaseSignOut(auth);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sign out';
      throw new Error(message);
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase not initialized');
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send password reset email';
      throw new Error(message);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
