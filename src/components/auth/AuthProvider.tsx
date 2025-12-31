'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { clearAuthCookies } from '@/lib/auth';
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
  const router = useRouter();
  const hasRefreshedRef = useRef(false);

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
    hasRefreshedRef.current = false;
    // Force a full page reload to clear server-side session state
    window.location.href = '/';
  };

  useEffect(() => {
    // Set up auth state change listener FIRST
    // This ensures we catch any auth events that happen during initialization
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, newSession: Session | null) => {
        console.log('[AuthProvider] Auth state change:', event, newSession?.user?.email);

        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);

        if (newSession?.user) {
          // Load subscription in background - don't block
          fetchSubscription(newSession.user.id);

          // After OAuth redirect, force a router refresh to sync server state
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && !hasRefreshedRef.current) {
            hasRefreshedRef.current = true;
            setTimeout(() => {
              router.refresh();
            }, 100);
          }
        } else {
          setSubscription(null);
        }
      }
    );

    // Initialize auth state from session (reads cookies)
    const initAuth = async () => {
      // Timeout to prevent hanging forever
      const timeout = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 3000)
      );

      try {
        // Race between getSession and timeout
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          timeout.then(() => ({ data: { session: null }, error: null }))
        ]);

        const currentSession = sessionResult?.data?.session;

        if (currentSession?.user) {
          setUser(currentSession.user);
          setSession(currentSession);
          // Don't await subscription - let it load in background
          fetchSubscription(currentSession.user.id);
        } else {
          // No session - check for stale cookies
          const hasAuthCookies = document.cookie.split(';').some(c =>
            c.trim().startsWith('sb-') || c.includes('auth-token')
          );

          if (hasAuthCookies) {
            clearAuthCookies();
          }

          setUser(null);
          setSession(null);
        }
      } catch (err) {
        console.error('[AuthProvider] Init error:', err);
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

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
