import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Business, Profile } from '../db/schema';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  businesses: Business[];
  currentBusiness: Business | null;
  setCurrentBusiness: (business: Business) => void;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, businessName?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default development profile for seamless testing when remote Supabase is unconfigured
const DEMO_USER: User = {
  id: 'usr_nepal_demo_01',
  app_metadata: {},
  user_metadata: { full_name: 'Prakash Suvedi' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'prakashsuvedi@gmail.com',
  phone: '+977-9801234567',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

const DEMO_PROFILE: Profile = {
  id: 'usr_nepal_demo_01',
  email: 'prakashsuvedi@gmail.com',
  fullName: 'Prakash Suvedi',
  phone: '+977-9801234567',
  avatarUrl: '',
  systemRole: 'super_admin',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const DEMO_BUSINESS: Business = {
  id: 'biz_nepal_demo_01',
  name: 'NepalAI Commerce HQ',
  slug: 'nepalai-hq',
  description: 'Flagship sovereign AI and multi-tenant commerce operations.',
  logoUrl: '',
  bannerUrl: '',
  panNumber: '609812453',
  isVatRegistered: true,
  currency: 'NPR',
  phone: '+977-1-4422000',
  email: 'prakash@scamspike.com',
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
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([DEMO_BUSINESS]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(DEMO_BUSINESS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const configured = isSupabaseConfigured();

  // Load session from Supabase on mount
  useEffect(() => {
    if (!configured) {
      // In standalone / preview mode, check local storage for simulated session
      const savedAuth = localStorage.getItem('nepalai_local_session');
      if (savedAuth === 'active') {
        setUser(DEMO_USER);
        setProfile(DEMO_PROFILE);
      }
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndBusinesses(session.user.id, session.user.email);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndBusinesses(session.user.id, session.user.email);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  const fetchProfileAndBusinesses = async (userId: string, email?: string) => {
    try {
      // 1. Fetch profile record
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData && !profileErr) {
        setProfile(profileData as Profile);
      } else {
        // Fallback default profile
        setProfile({
          id: userId,
          email: email || '',
          fullName: user?.user_metadata?.full_name || 'NepalAI Member',
          phone: '',
          avatarUrl: '',
          systemRole: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // 2. Fetch businesses via membership
      const { data: membersData } = await supabase
        .from('business_members')
        .select('business_id, role, businesses(*)')
        .eq('userId', userId);

      if (membersData && membersData.length > 0) {
        const userBizs = membersData
          .map((m: any) => m.businesses)
          .filter(Boolean) as Business[];
        if (userBizs.length > 0) {
          setBusinesses(userBizs);
          setCurrentBusiness(userBizs[0]);
        }
      }
    } catch (err) {
      console.warn('[AuthContext] Profile load warning:', err);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!configured) {
        // Standalone preview login simulation
        if (password.length >= 6) {
          localStorage.setItem('nepalai_local_session', 'active');
          setUser(DEMO_USER);
          setProfile(DEMO_PROFILE);
          setIsLoading(false);
          return { success: true };
        }
        setIsLoading(false);
        return { success: false, error: 'Password must be at least 6 characters.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      setUser(data.user);
      setSession(data.session);
      if (data.user) {
        await fetchProfileAndBusinesses(data.user.id, data.user.email);
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Login failed. Please verify credentials.' };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    businessName?: string
  ) => {
    setIsLoading(true);
    try {
      if (!configured) {
        localStorage.setItem('nepalai_local_session', 'active');
        const customProfile: Profile = {
          ...DEMO_PROFILE,
          email,
          fullName,
        };
        const customBusiness: Business = {
          ...DEMO_BUSINESS,
          name: businessName || `${fullName}'s Store`,
          slug: (businessName || fullName).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        };
        setUser({ ...DEMO_USER, email });
        setProfile(customProfile);
        setBusinesses([customBusiness]);
        setCurrentBusiness(customBusiness);
        setIsLoading(false);
        return { 
          success: true, 
          message: 'Account created! Welcome to NepalAI Commerce.' 
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            business_name: businessName,
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create initial profile record
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          system_role: 'user',
        });

        // If a business name was specified, create the initial business tenant
        if (businessName) {
          const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
          const { data: newBiz } = await supabase.from('businesses').insert({
            name: businessName,
            slug,
            email,
            status: 'active',
            tier: 'starter',
          }).select().single();

          if (newBiz) {
            await supabase.from('business_members').insert({
              business_id: newBiz.id,
              userId: data.user.id,
              role: 'owner',
              permissions: ['all'],
            });
          }
        }
      }

      setIsLoading(false);
      return { 
        success: true, 
        message: 'Registration successful! Please check your email to confirm your account.' 
      };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Registration failed.' };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('nepalai_local_session');
      if (configured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setSession(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (!configured) {
        return { 
          success: true, 
          message: 'Password reset link simulated. Check inbox for instructions.' 
        };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        message: 'Password reset email sent. Please check your inbox.' 
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to send password reset.' };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndBusinesses(user.id, user.email);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        businesses,
        currentBusiness,
        setCurrentBusiness,
        isLoading,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshProfile,
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
