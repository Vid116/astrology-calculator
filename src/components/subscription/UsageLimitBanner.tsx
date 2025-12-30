'use client';

import Link from 'next/link';
import { useUsageLimit } from '@/lib/hooks/useUsageLimit';

export function UsageLimitBanner() {
  const { remaining, limit, isPremium, canCalculate, isLoading, showUpgradePrompt, dismissUpgradePrompt } = useUsageLimit();

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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[rgba(10,14,26,0.95)] border border-[#ffd800] rounded-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">✨</div>
          <h2 className="font-cinzel text-2xl text-[#ffd800] mb-3">
            Daily Limit Reached
          </h2>
          <p className="text-[#e8e8e8] mb-2">
            You&apos;ve used all {limit} free calculations for today.
          </p>
          <p className="text-[#a1a1aa] text-sm mb-6">
            Upgrade to Pro for unlimited celestial insights, or come back tomorrow.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/pricing">
              <button className="w-full px-6 py-3 bg-[#ffd800] text-[#0a0e1a] rounded-lg font-semibold hover:bg-[#e6c200] transition-all hover:shadow-[0_0_20px_rgba(255,216,0,0.3)]">
                Unlock Unlimited
              </button>
            </Link>
            <Link href="/signup">
              <button className="w-full px-6 py-2 border border-[rgba(103,232,249,0.3)] text-[#67e8f9] rounded-lg text-sm hover:bg-[rgba(103,232,249,0.1)] transition-all">
                Create free account to track usage
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
