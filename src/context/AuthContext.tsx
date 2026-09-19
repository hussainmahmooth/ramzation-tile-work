import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConnected } from '../services/supabase';

export interface UserProfile {
  id: string;
  email: string;
  role: 'owner' | 'admin';
  name: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  enableDemoMode: () => void;
}

const DEMO_USER: UserProfile = {
  id: 'user_demo_owner',
  email: 'ramzan@ramzationtile.com',
  role: 'owner',
  name: 'Mohamed Ramzan (Owner)',
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('rtw_auth_user');
    return saved ? JSON.parse(saved) : DEMO_USER; // Default logged in as Owner for smooth immediate experience
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return !isSupabaseConnected();
  });

  useEffect(() => {
    async function checkAuth() {
      if (isSupabaseConnected() && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            const loggedIn: UserProfile = {
              id: data.session.user.id,
              email: data.session.user.email || 'user@ramzationtile.com',
              role: 'owner',
              name: 'Owner Admin',
            };
            setUser(loggedIn);
            localStorage.setItem('rtw_auth_user', JSON.stringify(loggedIn));
            setIsDemoMode(false);
          }
        } catch (e) {
          console.warn('Supabase session check:', e);
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConnected() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const loggedIn: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            role: 'owner',
            name: 'Contractor Owner',
          };
          setUser(loggedIn);
          localStorage.setItem('rtw_auth_user', JSON.stringify(loggedIn));
          setIsDemoMode(false);
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Login failed' };
      }
    }

    // Local / Demo Login fallback
    if (email && pass) {
      const demoUser: UserProfile = {
        id: 'usr_local_owner',
        email,
        role: 'owner',
        name: email.split('@')[0].toUpperCase() || 'Business Owner',
      };
      setUser(demoUser);
      localStorage.setItem('rtw_auth_user', JSON.stringify(demoUser));
      return { success: true };
    }

    return { success: false, error: 'Please enter a valid email and password' };
  };

  const logout = async () => {
    if (isSupabaseConnected() && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('rtw_auth_user');
  };

  const enableDemoMode = () => {
    setUser(DEMO_USER);
    localStorage.setItem('rtw_auth_user', JSON.stringify(DEMO_USER));
    setIsDemoMode(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isDemoMode,
        login,
        logout,
        enableDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
