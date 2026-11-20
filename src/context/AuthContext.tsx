import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { Business, Profile } from '../db/schema';

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  businesses: Business[];
  currentBusiness: Business | null;
  setCurrentBusiness: (business: Business) => void;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  createBusiness: (name: string, panNumber?: string, isVatRegistered?: boolean) => Promise<{ success: boolean; business?: Business; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_PUBLIC_BUSINESS: Business = {
  id: 'biz_default',
  name: 'Himalayan Sovereign Organic Store',
  slug: 'himalayan-coffee',
  description: 'Flagship sovereign AI and multi-tenant commerce operations.',
  logoUrl: '',
  bannerUrl: '',
  panNumber: '609812453',
  isVatRegistered: true,
  currency: 'NPR',
  phone: '+977-1-4422000',
  email: 'store@nepalai.tech',
  address: 'Durbar Marg, Ward 1',
  municipality: 'Kathmandu Metropolitan',
  wardNo: '01',
  district: 'Kathmandu',
  status: 'active',
  tier: 'enterprise',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([DEFAULT_PUBLIC_BUSINESS]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(DEFAULT_PUBLIC_BUSINESS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // In-memory ID token cache (never stored in localStorage)
  const inMemoryTokenRef = useRef<string | null>(null);

  const syncUserWithBackend = useCallback(async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken();
      inMemoryTokenRef.current = token;

      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile as Profile);
        }
        if (Array.isArray(data.businesses) && data.businesses.length > 0) {
          setBusinesses(data.businesses as Business[]);
          setCurrentBusiness((prev) => {
            const match = (data.businesses as Business[]).find((b) => b.id === prev?.id);
            return match || (data.businesses[0] as Business);
          });
        }
      } else {
        setProfile({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          fullName: firebaseUser.displayName || 'NepalAI Member',
          phone: '',
          avatarUrl: firebaseUser.photoURL || '',
          systemRole: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      console.warn('[AuthContext] Backend sync warning:', err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await syncUserWithBackend(firebaseUser);
      } else {
        inMemoryTokenRef.current = null;
        setProfile(null);
        setBusinesses([DEFAULT_PUBLIC_BUSINESS]);
        setCurrentBusiness(DEFAULT_PUBLIC_BUSINESS);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [syncUserWithBackend]);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!auth.currentUser) {
      inMemoryTokenRef.current = null;
      return null;
    }
    const token = await auth.currentUser.getIdToken();
    inMemoryTokenRef.current = token;
    return token;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleAuthProvider);
      if (credential.user) {
        await syncUserWithBackend(credential.user);
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Sign-in popup was closed before completing.' };
      }
      return { success: false, error: err?.message || 'Google Sign-In failed. Please try again.' };
    }
  }, [syncUserWithBackend]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      inMemoryTokenRef.current = null;
      await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
      setBusinesses([DEFAULT_PUBLIC_BUSINESS]);
      setCurrentBusiness(DEFAULT_PUBLIC_BUSINESS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (auth.currentUser) {
      await syncUserWithBackend(auth.currentUser);
    }
  }, [syncUserWithBackend]);

  const createBusiness = useCallback(
    async (name: string, panNumber?: string, isVatRegistered?: boolean) => {
      const token = await getIdToken();
      if (!token) {
        return { success: false, error: 'Please sign in first.' };
      }
      try {
        const res = await fetch('/api/auth/businesses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, panNumber, isVatRegistered }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || 'Failed to create business' };
        }
        const created = data.business as Business;
        setBusinesses((prev) => [...prev, created]);
        setCurrentBusiness(created);
        return { success: true, business: created };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to create business' };
      }
    },
    [getIdToken]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        businesses,
        currentBusiness,
        setCurrentBusiness,
        isLoading,
        isConfigured: true,
        signInWithGoogle,
        signOut,
        refreshProfile,
        getIdToken,
        createBusiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
