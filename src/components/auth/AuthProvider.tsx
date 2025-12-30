'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { withAuthTimeout, syncAuthState, clearAuthCookies } from '@/lib/auth';
import type { Subscription } from '@/types/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  subscription: Subscription | null;
  isLoading: boolean;
  isPremium: boolean;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Check if user has active premium subscription
  const isPremium = subscription?.status === 'active' || subscription?.status === 'trialing';

  const fetchSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .order('created', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log('Subscription query:', error.message);
      }

      if (!error && data) {
        setSubscription(data);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Subscription fetch error:', err);
      setSubscription(null);
    }
  };

  const refreshSubscription = async () => {
    if (user) {
      await fetchSubscription(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setSubscription(null);
    // Force a full page reload to clear server-side session state
    syncAuthState('/');
  };

  useEffect(() => {
    // Get initial auth state using getUser() - same as middleware for consistency
    const initAuth = async () => {
      try {
        // Use getUser() as source of truth (same as middleware)
        let currentUser: User | null = null;
        try {
          const userResult = await withAuthTimeout(
            supabase.auth.getUser().then(r => r.data.user),
            null
          );
          currentUser = userResult;
        } catch {
          currentUser = null;
        }

        if (currentUser) {
          // User is valid, now get the session
          const currentSession = await withAuthTimeout(
            supabase.auth.getSession().then(r => r.data.session),
            null
          );

          setUser(currentUser);
          setSession(currentSession);

          await fetchSubscription(currentUser.id);
        } else {
          // No valid user - check if we have stale cookies that need clearing
          const hasAuthCookies = document.cookie.split(';').some(c =>
            c.trim().startsWith('sb-') || c.includes('auth-token')
          );

          if (hasAuthCookies) {
            // Stale cookies exist but no valid user - clear them directly
            // (don't use supabase.auth.signOut() as it might hang)
            clearAuthCookies();
          }

          setUser(null);
          setSession(null);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchSubscription(session.user.id);
        } else {
          setSubscription(null);
        }
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        subscription,
        isLoading,
        isPremium,
        signOut,
        refreshSubscription,
      }}
    >
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
