'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUsageLimit } from '@/lib/hooks/useUsageLimit';

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();

      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return timeLeft;
}

interface UsageLimitBannerProps {
  canCalculateOverride?: boolean;
}

export function UsageLimitBanner({ canCalculateOverride }: UsageLimitBannerProps = {}) {
  const { remaining, limit, isPremium, canCalculate: canCalculateFromHook, isLoading, isLoggedIn, showUpgradePrompt, dismissUpgradePrompt } = useUsageLimit();
  const timeLeft = useCountdown();

  // Use override if provided, otherwise use hook value
  const canCalculate = canCalculateOverride !== undefined ? canCalculateOverride : canCalculateFromHook;

  // Don't show for premium users
  if (isPremium || isLoading) {
    return null;
  }

  // Show warning when running low
  if (showUpgradePrompt && canCalculate && remaining > 0) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
        <div className="bg-[rgba(255,216,0,0.15)] border border-[#ffd800] rounded-lg p-4 backdrop-blur-xl shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[#ffd800] font-semibold text-sm">
                Running low on calculations
              </p>
              <p className="text-[#e8e8e8] text-xs mt-1">
                {remaining} of {limit} remaining today
              </p>
            </div>
            <button
              onClick={dismissUpgradePrompt}
              className="text-[#71717a] hover:text-[#e8e8e8] transition-colors"
            >
              ✕
            </button>
          </div>
          <Link href="/pricing">
            <button className="mt-3 w-full px-4 py-2 bg-[#ffd800] text-[#0a0e1a] rounded-lg text-sm font-semibold hover:bg-[#e6c200] transition-all">
              Upgrade to Pro
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Show limit reached
  if (!canCalculate) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[rgba(10,14,26,0.98)] border border-white/10 rounded-2xl p-10 max-w-md text-center shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          <h2 className="font-cinzel text-3xl text-[#ffd800] mb-4">
            Daily Limit Reached
          </h2>

          <p className="text-[#e8e8e8] text-lg mb-6">
            You&apos;ve used all {limit} free calculations for today.
          </p>

          {/* Countdown Timer */}
          <div style={{ marginBottom: '8px' }}>
            <p className="text-[#a1a1aa] text-sm mb-3">Resets in</p>
            <div className="flex justify-center gap-3">
              <div className="bg-[rgba(103,232,249,0.08)] border border-[#67e8f9]/20 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl font-bold text-[#67e8f9]">{String(timeLeft.hours).padStart(2, '0')}</span>
                <p className="text-[#6b7a90] text-xs mt-1">hours</p>
              </div>
              <div className="bg-[rgba(103,232,249,0.08)] border border-[#67e8f9]/20 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl font-bold text-[#67e8f9]">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <p className="text-[#6b7a90] text-xs mt-1">mins</p>
              </div>
              <div className="bg-[rgba(103,232,249,0.08)] border border-[#67e8f9]/20 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl font-bold text-[#67e8f9]">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <p className="text-[#6b7a90] text-xs mt-1">secs</p>
              </div>
            </div>
          </div>

          {/* Different CTAs for anonymous vs logged-in users */}
          {!isLoggedIn ? (
            <>
              {/* Anonymous user - encourage sign up */}
              <div className="bg-[rgba(103,232,249,0.08)] border border-[#67e8f9]/20 rounded-xl p-4 mb-6">
                <p className="text-[#67e8f9] font-semibold mb-1">Want more calculations?</p>
                <p className="text-[#a1a1aa] text-sm">
                  Create a free account and get <span className="text-white font-bold">10 calculations per day</span>
                </p>
              </div>

              <Link href="/signup" className="block" style={{ marginTop: '8px' }}>
                <button className="w-full px-8 py-4 bg-gradient-to-r from-[#67e8f9] to-[#1e96fc] text-[#0a0e1a] rounded-xl text-lg font-bold hover:shadow-[0_0_30px_rgba(103,232,249,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                  Create Free Account
                </button>
              </Link>

              <p className="text-[#6b7a90] text-sm mt-4">
                Already have an account?{' '}
                <Link href="/login" className="text-[#67e8f9] hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              {/* Logged-in user - encourage upgrade */}
              <Link href="/pricing" className="block" style={{ marginTop: '8px' }}>
                <button className="w-full px-8 py-4 bg-gradient-to-r from-[#ffd800] to-[#ffb800] text-[#0a0e1a] rounded-xl text-lg font-bold hover:shadow-[0_0_30px_rgba(255,216,0,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                  Unlock Unlimited Access
                </button>
              </Link>

              <p className="text-[#6b7a90] text-sm mt-6">
                Or wait for your daily calculations to refresh
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
