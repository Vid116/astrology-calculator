'use client';

import { useState, useEffect, useCallback } from 'react';
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
}

const ANON_STORAGE_KEY = 'astro_anon_calculations';
const ANON_DATE_KEY = 'astro_anon_date';

export function useUsageLimit() {
  const { user, isPremium } = useAuth();
  const [state, setState] = useState<UsageState>({
    isLoading: true,
    canCalculate: true,
    remaining: STRIPE_CONFIG.freeTier.dailyCalculations,
    limit: STRIPE_CONFIG.freeTier.dailyCalculations,
    isPremium: false,
    isLoggedIn: false,
    showUpgradePrompt: false,
  });

  // Fetch current usage on mount
  useEffect(() => {
    const fetchUsage = async () => {
      // If logged in and premium, always allow
      if (isPremium) {
        setState({
          isLoading: false,
          canCalculate: true,
          remaining: -1,
          limit: -1,
          isPremium: true,
          isLoggedIn: true,
          showUpgradePrompt: false,
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
            limit: data.limit || STRIPE_CONFIG.freeTier.dailyCalculations,
            isPremium: data.isPremium || false,
            isLoggedIn: true,
            showUpgradePrompt: data.remaining <= 2 && !data.isPremium,
          });
        } catch {
          // On error, allow but show warning
          setState((prev) => ({ ...prev, isLoading: false }));
        }
        return;
      }

      // Anonymous user - use localStorage
      const today = new Date().toISOString().split('T')[0];
      const storedDate = localStorage.getItem(ANON_DATE_KEY);
      let count = 0;

      if (storedDate === today) {
        count = parseInt(localStorage.getItem(ANON_STORAGE_KEY) || '0', 10);
      } else {
        // Reset for new day
        localStorage.setItem(ANON_DATE_KEY, today);
        localStorage.setItem(ANON_STORAGE_KEY, '0');
      }

      const remaining = Math.max(0, STRIPE_CONFIG.freeTier.dailyCalculations - count);

      setState({
        isLoading: false,
        canCalculate: remaining > 0,
        remaining,
        limit: STRIPE_CONFIG.freeTier.dailyCalculations,
        isPremium: false,
        isLoggedIn: false,
        showUpgradePrompt: remaining <= 2,
      });
    };

    fetchUsage();
  }, [user, isPremium]);

  // Track a calculation
  const trackCalculation = useCallback(async (): Promise<boolean> => {
    // Premium users always allowed
    if (state.isPremium) {
      return true;
    }

    // Logged in users - track on server
    if (user) {
      try {
        const response = await fetch('/api/track-calculation', { method: 'POST' });
        const data = await response.json();

        if (data.limitReached) {
          setState((prev) => ({
            ...prev,
            canCalculate: false,
            remaining: 0,
            showUpgradePrompt: true,
          }));
          return false;
        }

        setState((prev) => ({
          ...prev,
          remaining: data.remaining,
          canCalculate: data.remaining > 0,
          showUpgradePrompt: data.remaining <= 2,
        }));

        return data.success;
      } catch {
        // On error, allow but don't update state
        return true;
      }
    }

    // Anonymous user - use localStorage
    const today = new Date().toISOString().split('T')[0];
    const storedDate = localStorage.getItem(ANON_DATE_KEY);
    let count = 0;

    if (storedDate === today) {
      count = parseInt(localStorage.getItem(ANON_STORAGE_KEY) || '0', 10);
    } else {
      localStorage.setItem(ANON_DATE_KEY, today);
      count = 0;
    }

    if (count >= STRIPE_CONFIG.freeTier.dailyCalculations) {
      setState((prev) => ({
        ...prev,
        canCalculate: false,
        remaining: 0,
        showUpgradePrompt: true,
      }));
      return false;
    }

    count += 1;
    localStorage.setItem(ANON_STORAGE_KEY, count.toString());
    const remaining = Math.max(0, STRIPE_CONFIG.freeTier.dailyCalculations - count);

    setState((prev) => ({
      ...prev,
      remaining,
      canCalculate: remaining > 0,
      showUpgradePrompt: remaining <= 2,
    }));

    return true;
  }, [user, state.isPremium]);

  const dismissUpgradePrompt = useCallback(() => {
    setState((prev) => ({ ...prev, showUpgradePrompt: false }));
  }, []);

  return {
    ...state,
    trackCalculation,
    dismissUpgradePrompt,
  };
}
