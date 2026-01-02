'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { STRIPE_CONFIG } from '@/lib/stripe/config';

interface UsageState {
  isLoading: boolean;
  canCalculate: boolean;
  remaining: number;
  limit: number;
  isPremium: boolean;
  isLoggedIn: boolean;
  showUpgradePrompt: boolean;
  showLimitReachedOverlay: boolean; // Only true after user tries to calculate at 0
}

const ANON_LIMIT = STRIPE_CONFIG.freeTier.anonymousDailyCalculations;
const LOGGED_IN_LIMIT = STRIPE_CONFIG.freeTier.dailyCalculations;

export function useUsageLimit() {
  const { user, isPremium: authIsPremium, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<UsageState>({
    isLoading: true,
    canCalculate: true,
    remaining: ANON_LIMIT,
    limit: ANON_LIMIT,
    isPremium: false,
    isLoggedIn: false,
    showUpgradePrompt: false,
    showLimitReachedOverlay: false,
  });

  // Prevent multiple fetches
  const hasFetched = useRef(false);
  const lastUserId = useRef<string | null>(null);

  // Fetch current usage on mount
  useEffect(() => {
    // Wait for auth to finish loading before checking usage
    if (authLoading) {
      return;
    }

    // Only refetch if user changed (login/logout)
    const currentUserId = user?.id || null;
    if (hasFetched.current && lastUserId.current === currentUserId) {
      return;
    }
    hasFetched.current = true;
    lastUserId.current = currentUserId;

    const fetchUsage = async () => {
      // If logged in and premium (from auth context), always allow
      if (authIsPremium) {
        setState({
          isLoading: false,
          canCalculate: true,
          remaining: -1,
          limit: -1,
          isPremium: true,
          isLoggedIn: true,
          showUpgradePrompt: false,
          showLimitReachedOverlay: false,
        });
        return;
      }

      // If logged in but not premium, check server
      if (user) {
        try {
          const response = await fetch('/api/track-calculation');
          const data = await response.json();

          setState({
            isLoading: false,
            canCalculate: data.remaining > 0 || data.isPremium,
            remaining: data.remaining || 0,
            limit: data.limit || LOGGED_IN_LIMIT,
            isPremium: data.isPremium || false,
            isLoggedIn: true,
            showUpgradePrompt: data.remaining <= 2 && !data.isPremium,
            showLimitReachedOverlay: false,
          });
        } catch {
          // On error, allow but show warning
          setState((prev) => ({ ...prev, isLoading: false }));
        }
        return;
      }

      // Anonymous user - check server (IP-based tracking)
      try {
        const response = await fetch('/api/track-calculation');
        const data = await response.json();

        const remaining = data.remaining ?? ANON_LIMIT;
        setState({
          isLoading: false,
          canCalculate: remaining > 0,
          remaining,
          limit: data.limit ?? ANON_LIMIT,
          isPremium: false,
          isLoggedIn: false,
          showUpgradePrompt: remaining <= 1 && remaining > 0,
          showLimitReachedOverlay: false,
        });
      } catch {
        // On error, assume fresh
        setState({
          isLoading: false,
          canCalculate: true,
          remaining: ANON_LIMIT,
          limit: ANON_LIMIT,
          isPremium: false,
          isLoggedIn: false,
          showUpgradePrompt: false,
          showLimitReachedOverlay: false,
        });
      }
    };

    fetchUsage();
  }, [user, authIsPremium, authLoading]);

  // Track a calculation
  const trackCalculation = useCallback(async (): Promise<boolean> => {
    // Premium users always allowed (check both state and auth context)
    if (state.isPremium || authIsPremium) {
      return true;
    }

    // Logged in users - check locally first, track in background
    if (user) {
      // Check if already at limit BEFORE trying to calculate
      if (state.remaining <= 0) {
        setState((prev) => ({
          ...prev,
          canCalculate: false,
          showLimitReachedOverlay: true, // User tried to calculate at 0
        }));
        return false;
      }

      // Optimistically allow and decrement locally
      setState((prev) => ({
        ...prev,
        remaining: prev.remaining - 1,
        showUpgradePrompt: prev.remaining - 1 <= 2,
      }));

      // Track on server in background (don't await)
      fetch('/api/track-calculation', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          // Only lock out if explicitly at limit AND remaining is 0
          if (data.limitReached === true && data.remaining === 0) {
            setState((prev) => ({
              ...prev,
              canCalculate: false,
              remaining: 0,
              showLimitReachedOverlay: true, // Server confirmed limit reached
            }));
          } else if (data.success && data.remaining !== undefined) {
            // Sync with server count
            // Only update canCalculate to false if remaining is 0, never block mid-session
            setState((prev) => ({
              ...prev,
              remaining: data.remaining,
              showUpgradePrompt: data.remaining <= 2 && data.remaining > 0,
            }));
          }
        })
        .catch(() => {
          // On error, don't block
        });

      return true;
    }

    // Anonymous user - check locally first, track via server (IP-based)
    // Check if already at limit BEFORE trying to calculate
    if (state.remaining <= 0) {
      setState((prev) => ({
        ...prev,
        canCalculate: false,
        showLimitReachedOverlay: true, // User tried to calculate at 0
      }));
      return false;
    }

    // Optimistically allow and decrement locally
    setState((prev) => ({
      ...prev,
      remaining: prev.remaining - 1,
      showUpgradePrompt: prev.remaining - 1 <= 1,
    }));

    // Track on server in background (don't await)
    fetch('/api/track-calculation', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        // Only lock out if explicitly at limit AND remaining is 0
        if (data.limitReached === true && data.remaining === 0) {
          setState((prev) => ({
            ...prev,
            canCalculate: false,
            remaining: 0,
            showLimitReachedOverlay: true, // Server confirmed limit reached
          }));
        } else if (data.success && data.remaining !== undefined) {
          // Sync with server count
          setState((prev) => ({
            ...prev,
            remaining: data.remaining,
            showUpgradePrompt: data.remaining <= 1 && data.remaining > 0,
          }));
        }
      })
      .catch(() => {
        // On error, don't block
      });

    return true;
  }, [user, state.isPremium, state.remaining, authIsPremium]);

  const dismissUpgradePrompt = useCallback(() => {
    setState((prev) => ({ ...prev, showUpgradePrompt: false }));
  }, []);

  // Check usage from server (for opening calculator)
  const checkUsage = useCallback(async (): Promise<boolean> => {
    // Premium users always allowed
    if (state.isPremium || authIsPremium) {
      return true;
    }

    // For logged-in users, check server
    if (user) {
      try {
        const response = await fetch('/api/track-calculation');
        const data = await response.json();

        const canCalc = data.remaining > 0 || data.isPremium;
        setState((prev) => ({
          ...prev,
          remaining: data.remaining ?? prev.remaining,
          canCalculate: canCalc,
          isPremium: data.isPremium || prev.isPremium,
          showUpgradePrompt: data.remaining <= 2 && !data.isPremium && data.remaining > 0,
        }));

        return canCalc;
      } catch {
        // On error, use local state
        return state.remaining > 0;
      }
    }

    // Anonymous user - check server (IP-based)
    try {
      const response = await fetch('/api/track-calculation');
      const data = await response.json();

      const remaining = data.remaining ?? ANON_LIMIT;
      const canCalc = remaining > 0;

      setState((prev) => ({
        ...prev,
        remaining,
        canCalculate: canCalc,
        showUpgradePrompt: remaining <= 1 && remaining > 0,
      }));

      return canCalc;
    } catch {
      // On error, use local state
      return state.remaining > 0;
    }
  }, [user, state.isPremium, state.remaining, authIsPremium]);

  const dismissLimitReachedOverlay = useCallback(() => {
    setState((prev) => ({ ...prev, showLimitReachedOverlay: false }));
  }, []);

  // Combine state with auth context premium status for safety
  const isPremium = state.isPremium || authIsPremium;

  return {
    ...state,
    isPremium,
    canCalculate: state.canCalculate || isPremium,
    trackCalculation,
    checkUsage,
    dismissUpgradePrompt,
    dismissLimitReachedOverlay,
  };
}
