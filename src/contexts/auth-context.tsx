'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  lastActivity: number;
  updateActivity: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session configuration
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Session management functions
  const updateActivity = () => {
    setLastActivity(Date.now());
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_activity', Date.now().toString());
    }
  };

  const startSessionTimer = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log('Session expired due to inactivity');
      logout();
    }, SESSION_TIMEOUT);
  };

  const startActivityChecker = () => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Check activity every minute
    intervalRef.current = setInterval(() => {
      if (typeof window !== 'undefined') {
        const storedActivity = localStorage.getItem('last_activity');
        if (storedActivity) {
          const lastActivityTime = parseInt(storedActivity);
          const now = Date.now();
          const timeSinceActivity = now - lastActivityTime;
          
          if (timeSinceActivity > SESSION_TIMEOUT) {
            console.log('Session expired due to inactivity');
            logout();
          }
        }
      }
    }, ACTIVITY_CHECK_INTERVAL);
  };

  const stopSessionTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const initializeAuth = () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');
      const storedActivity = localStorage.getItem('last_activity');
      
      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userData);
          
          // Check if session is still valid
          if (storedActivity) {
            const lastActivityTime = parseInt(storedActivity);
            const now = Date.now();
            const timeSinceActivity = now - lastActivityTime;
            
            if (timeSinceActivity > SESSION_TIMEOUT) {
              console.log('Session expired, logging out');
              logout();
            } else {
              setLastActivity(lastActivityTime);
              startSessionTimer();
              startActivityChecker();
            }
          } else {
            setLastActivity(Date.now());
            startSessionTimer();
            startActivityChecker();
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('last_activity');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    // Use a small delay to ensure DOM is ready
    const timer = setTimeout(initializeAuth, 100);
    return () => {
      clearTimeout(timer);
      stopSessionTimer();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      
      // The API returns the user object directly, not wrapped in data.data
      const userData = response.data;
      
      // For now, create a simple token since the API doesn't return JWT
      const simpleToken = typeof window !== 'undefined' ? btoa(JSON.stringify({ email: userData.email, id: userData.id })) : 'temp-token';
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', simpleToken);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        localStorage.setItem('last_activity', Date.now().toString());
      }
      
      setToken(simpleToken);
      setUser(userData);
      setLastActivity(Date.now());
      
      // Start session management
      startSessionTimer();
      startActivityChecker();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Stop session timers
    stopSessionTimer();
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('last_activity');
    }
    setToken(null);
    setUser(null);
    setLastActivity(Date.now());
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, lastActivity, updateActivity }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
