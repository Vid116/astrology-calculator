'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { clearAuthCookies } from '@/lib/auth';
import { getRandomAvatarPath } from '@/lib/avatars';
import type { Subscription, UserRole } from '@/types/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  subscription: Subscription | null;
  userRole: UserRole | null;
  avatarUrl: string | null;
  isLoading: boolean;
  isPremium: boolean;
  isAdmin: boolean;
  isSuperuser: boolean;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const hasRefreshedRef = useRef(false);
  const hasAssignedAvatarRef = useRef(false);

  // Assign a random planet avatar if user doesn't have one
  const assignRandomAvatar = async (currentUser: User) => {
    if (hasAssignedAvatarRef.current) return;
    if (currentUser.user_metadata?.avatar_url) return;

    hasAssignedAvatarRef.current = true;
    const randomAvatar = getRandomAvatarPath();

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { avatar_url: randomAvatar }
      });

      if (!error && data.user) {
        setUser(data.user);
      }
    } catch {
      // Silently fail - avatar assignment is not critical
    }
  };

  // Check if user has active premium subscription
  const isPremium = subscription?.status === 'active' || subscription?.status === 'trialing';

  // Check admin and superuser status
  const isAdmin = userRole?.is_admin ?? false;
  const isSuperuser = userRole?.is_superuser ?? false;

  const fetchSubscription = async (userId: string) => {
    try {
      // Use maybeSingle() instead of single() to avoid errors when no subscription exists
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .order('created', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        // Only log actual errors, not "no rows found" which is expected for free users
        if (error.code !== 'PGRST116') {
          console.error('Subscription fetch error:', error.message);
        }
        setSubscription(null);
      } else {
        setSubscription(data);
      }
    } catch (err) {
      console.error('Subscription fetch error:', err);
      setSubscription(null);
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('User role fetch error:', error.message);
        }
        setUserRole(null);
      } else {
        setUserRole(data);
      }
    } catch (err) {
      console.error('User role fetch error:', err);
      setUserRole(null);
    }
  };

  const fetchAvatar = async (userId: string, retries = 3) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', userId)
        .single();

      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      } else if (retries > 0) {
        // Profile might not be created yet, retry after a short delay
        setTimeout(() => fetchAvatar(userId, retries - 1), 500);
      }
    } catch {
      if (retries > 0) {
        // Profile might not be created yet, retry after a short delay
        setTimeout(() => fetchAvatar(userId, retries - 1), 500);
      }
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
    setUserRole(null);
    setAvatarUrl(null);
    hasRefreshedRef.current = false;
    // Force a full page reload to clear server-side session state
    window.location.href = '/';
  };

  useEffect(() => {
    // Set up auth state change listener FIRST
    // This ensures we catch any auth events that happen during initialization
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, newSession: Session | null) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);

        if (newSession?.user) {
          // Load subscription, role, and avatar in background - don't block
          fetchSubscription(newSession.user.id);
          fetchUserRole(newSession.user.id);
          fetchAvatar(newSession.user.id);

          // Assign random avatar if user doesn't have one
          assignRandomAvatar(newSession.user);

          // After OAuth redirect, force a router refresh to sync server state
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && !hasRefreshedRef.current) {
            hasRefreshedRef.current = true;
            setTimeout(() => {
              router.refresh();
            }, 100);
          }
        } else {
          setSubscription(null);
          setUserRole(null);
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
          // Don't await subscription/role/avatar - let them load in background
          fetchSubscription(currentSession.user.id);
          fetchUserRole(currentSession.user.id);
          fetchAvatar(currentSession.user.id);
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
      } catch {
        // Auth initialization failed - user will need to sign in
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
        userRole,
        avatarUrl,
        isLoading,
        isPremium,
        isAdmin,
        isSuperuser,
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
