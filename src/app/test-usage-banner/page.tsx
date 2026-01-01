'use client';

import { useState } from 'react';
import Link from 'next/link';

function useCountdown() {
  // Mock countdown for testing
  return { hours: 5, minutes: 23, seconds: 45 };
}

// Standalone test version of the banner components
function WarningBanner({ remaining, limit, onDismiss }: { remaining: number; limit: number; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-[rgba(255,216,0,0.15)] border border-[#ffd800] rounded-lg backdrop-blur-xl shadow-lg relative" style={{ padding: '24px' }}>
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-[#71717a] hover:text-[#e8e8e8] transition-colors"
        >
          ✕
        </button>
        <div>
          <p className="text-[#ffd800] font-semibold text-sm">
            Running low on calculations
          </p>
          <p className="text-[#e8e8e8] text-xs mt-1">
            {remaining} of {limit} remaining today
          </p>
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

function LimitReachedModal({ limit, isLoggedIn }: { limit: number; isLoggedIn: boolean }) {
  const timeLeft = useCountdown();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="bg-[rgba(10,14,26,0.98)] border border-white/10 rounded-2xl max-w-md text-center shadow-[0_0_60px_rgba(0,0,0,0.5)]" style={{ padding: '48px' }}>
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
            <div className="px-4 py-3 min-w-[70px]">
              <span className="text-2xl font-bold text-[#67e8f9]">{String(timeLeft.hours).padStart(2, '0')}</span>
              <p className="text-[#6b7a90] text-xs mt-1">hours</p>
            </div>
            <div className="px-4 py-3 min-w-[70px]">
              <span className="text-2xl font-bold text-[#67e8f9]">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <p className="text-[#6b7a90] text-xs mt-1">mins</p>
            </div>
            <div className="px-4 py-3 min-w-[70px]">
              <span className="text-2xl font-bold text-[#67e8f9]">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <p className="text-[#6b7a90] text-xs mt-1">secs</p>
            </div>
          </div>
        </div>

        {/* Different CTAs for anonymous vs logged-in users */}
        {!isLoggedIn ? (
          <>
            {/* Anonymous user - encourage sign up */}
            <div className="mb-6">
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

export default function TestUsageBannerPage() {
  const [activeView, setActiveView] = useState<'none' | 'warning' | 'limit-anon' | 'limit-logged'>('none');
  const [showWarning, setShowWarning] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-cinzel text-[#ffd800] mb-8">Usage Limit Banner Test</h1>

        <div className="space-y-4 mb-8">
          <p className="text-[#e8e8e8]">Select which component to preview:</p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveView('none')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeView === 'none'
                  ? 'bg-[#67e8f9] text-[#0a0e1a]'
                  : 'bg-[#1a1a2e] text-[#e8e8e8] hover:bg-[#2a2a4e]'
              }`}
            >
              None
            </button>

            <button
              onClick={() => { setActiveView('warning'); setShowWarning(true); }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeView === 'warning'
                  ? 'bg-[#ffd800] text-[#0a0e1a]'
                  : 'bg-[#1a1a2e] text-[#e8e8e8] hover:bg-[#2a2a4e]'
              }`}
            >
              Warning Banner (Low)
            </button>

            <button
              onClick={() => setActiveView('limit-anon')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeView === 'limit-anon'
                  ? 'bg-[#ef4444] text-white'
                  : 'bg-[#1a1a2e] text-[#e8e8e8] hover:bg-[#2a2a4e]'
              }`}
            >
              Limit Reached (Anonymous)
            </button>

            <button
              onClick={() => setActiveView('limit-logged')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeView === 'limit-logged'
                  ? 'bg-[#ef4444] text-white'
                  : 'bg-[#1a1a2e] text-[#e8e8e8] hover:bg-[#2a2a4e]'
              }`}
            >
              Limit Reached (Logged In)
            </button>
          </div>
        </div>

        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-white/10">
          <h2 className="text-xl text-[#67e8f9] mb-4">Component States</h2>
          <ul className="space-y-2 text-[#a1a1aa]">
            <li><strong className="text-[#ffd800]">Warning Banner:</strong> Shows when user has 1-2 calculations remaining</li>
            <li><strong className="text-[#ef4444]">Limit Reached (Anonymous):</strong> Full modal for users not logged in</li>
            <li><strong className="text-[#ef4444]">Limit Reached (Logged In):</strong> Full modal for free-tier logged in users</li>
          </ul>
        </div>
      </div>

      {/* Render the selected component */}
      {activeView === 'warning' && showWarning && (
        <WarningBanner remaining={2} limit={10} onDismiss={() => setShowWarning(false)} />
      )}

      {activeView === 'limit-anon' && (
        <LimitReachedModal limit={3} isLoggedIn={false} />
      )}

      {activeView === 'limit-logged' && (
        <LimitReachedModal limit={10} isLoggedIn={true} />
      )}
    </div>
  );
}
