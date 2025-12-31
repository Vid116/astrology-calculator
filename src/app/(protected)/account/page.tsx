'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { STRIPE_CONFIG } from '@/lib/stripe/config';

interface UserUsage {
  calculation_count: number;
  calculation_reset_date: string;
}

function AccountContent() {
  const { user, subscription, isPremium, signOut, isLoading } = useAuth();
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  const supabase = createClient();

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('user_usage')
        .select('calculation_count, calculation_reset_date')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setUsage(data);
      }
    };

    fetchUsage();
  }, [user]);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const { url, error } = await response.json();

      if (error) {
        console.error('Portal error:', error);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Portal error:', error);
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-[#67e8f9]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#ffd800] animate-spin" />
            <div className="absolute inset-2 rounded-full border border-[#67e8f9]/10" />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,216,0,0.1) 0%, transparent 70%)',
              }}
            />
          </div>
          <p className="text-[#67e8f9] text-sm tracking-wider animate-pulse">
            Aligning celestial bodies...
          </p>
        </div>
      </div>
    );
  }

  const remainingCalculations = STRIPE_CONFIG.freeTier.dailyCalculations - (usage?.calculation_count || 0);
  const calculationPercentage = Math.max(0, (remainingCalculations / STRIPE_CONFIG.freeTier.dailyCalculations) * 100);

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || '??';

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Cosmic Traveler';
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="space-y-20">
      {/* Success Message */}
      {success && (
        <div
          className="mb-8 p-5 rounded-xl border border-[#758e4f]/40 animate-menu-open"
          style={{
            marginTop: '20px',
            background: 'linear-gradient(135deg, rgba(117,142,79,0.15) 0%, rgba(117,142,79,0.05) 100%)',
            boxShadow: '0 0 30px rgba(117,142,79,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex items-start gap-3">
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#758e4f]/20 text-[#758e4f]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-[#758e4f] text-lg">Welcome to Astro Pro!</p>
              <p className="text-[#758e4f]/80 text-sm mt-1">
                Your subscription is now active. The cosmos awaits with unlimited calculations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Header Card */}
      <div
        className="relative rounded-2xl"
        style={{
          marginTop: '20px',
          marginLeft: '5px',
          marginRight: '5px',
          background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
          border: '1px solid rgba(103, 232, 249, 0.15)',
          boxShadow: `
            0 4px 6px rgba(0, 0, 0, 0.1),
            0 10px 40px rgba(0, 0, 0, 0.4),
            0 0 60px rgba(103, 232, 249, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `,
        }}
      >
        {/* Decorative Background */}
        <div
          className="absolute inset-0 opacity-30 rounded-2xl overflow-hidden"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(103, 232, 249, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 70% 100%, rgba(255, 216, 0, 0.08) 0%, transparent 50%)
            `,
          }}
        />

        {/* Content */}
        <div className="relative py-20 pt-28 pb-20" style={{ paddingLeft: '15px', paddingRight: '15px', paddingTop: '5px', paddingBottom: '5px' }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className={`
                  w-24 h-24 md:w-28 md:h-28 rounded-full
                  flex items-center justify-center
                  text-2xl md:text-3xl font-bold
                  transition-all duration-500
                  ${isPremium
                    ? 'shadow-[0_0_25px_rgba(255,216,0,0.4)]'
                    : 'shadow-[0_0_20px_rgba(103,232,249,0.3)]'
                  }
                `}
                style={{
                  background: isPremium
                    ? 'linear-gradient(135deg, rgba(255, 216, 0, 0.15) 0%, rgba(255, 184, 0, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(103, 232, 249, 0.15) 0%, rgba(30, 150, 252, 0.08) 100%)',
                }}
              >
                <div
                  className={`
                    absolute inset-0 rounded-full
                    ${isPremium
                      ? 'ring-[3px] ring-[#ffd800]/60'
                      : 'ring-[3px] ring-[#67e8f9]/50'
                    }
                  `}
                />

                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span className={isPremium ? 'text-[#ffd800]' : 'text-[#67e8f9]'}>
                    {initials}
                  </span>
                )}
              </div>

              {/* Premium Badge on Avatar */}
              {isPremium && (
                <div
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-[#ffd800] to-[#ff9500] border-[3px] border-[#0a0e1a] shadow-[0_0_15px_rgba(255,216,0,0.5)]"
                >
                  <svg className="w-4 h-4 text-[#0a0e1a]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left min-w-0">
              <h1 className="font-cinzel text-2xl md:text-3xl text-white tracking-wide truncate">
                {displayName}
              </h1>
              <p className="text-[#6b7a90] text-sm mt-1 truncate">{user?.email}</p>

              {/* Subscription Badge */}
              <div className="mt-6 flex justify-center md:justify-start">
                {isPremium ? (
                  <span
                    className="inline-flex items-center gap-3 py-3.5 rounded-full text-sm font-semibold text-[#ffd800] bg-gradient-to-r from-[#ffd800]/15 to-[#ff9500]/10 border border-[#ffd800]/30 shadow-[0_0_20px_rgba(255,216,0,0.15)]"
                    style={{ paddingLeft: '10px', paddingRight: '14px' }}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    Astro Pro Active
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-sm font-medium text-[#67e8f9] bg-[#67e8f9]/10 border border-[#67e8f9]/20"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#67e8f9] flex-shrink-0" />
                    Free Tier
                  </span>
                )}
              </div>

              {/* Member Since */}
              <p className="text-[#4a5568] text-xs mt-6">
                Joined the cosmos{' '}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'recently'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Section */}
      {isPremium && subscription ? (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            marginTop: '20px',
            marginLeft: '5px',
            marginRight: '5px',
            padding: '24px',
            background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
            border: '1px solid rgba(103, 232, 249, 0.15)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Header */}
          <h2
            className="text-xl font-bold tracking-wide"
            style={{
              marginBottom: '28px',
              background: 'linear-gradient(135deg, #ffd800 0%, #ffb800 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Astro Pro Subscription
          </h2>

          {/* Status and Renewal - Clean and Big */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="w-4 h-4 rounded-full bg-[#758e4f] shadow-[0_0_12px_rgba(117,142,79,0.8)] flex-shrink-0" />
              <span className="text-white text-xl font-semibold capitalize">{subscription.status}</span>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-[#6b7a90] text-xs uppercase tracking-wider mb-1">Renews</p>
              <p className="text-white text-xl font-semibold">
                {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Manage Button */}
          <div className="flex justify-center" style={{ marginTop: '24px', marginBottom: '4px' }}>
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="rounded-xl text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(103,232,249,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                paddingTop: '22px',
                paddingBottom: '22px',
                paddingLeft: '100px',
                paddingRight: '100px',
                background: '#1e96fc',
                color: '#ffffff',
                boxShadow: '0 0 20px rgba(30, 150, 252, 0.3)',
              }}
            >
            {portalLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Opening Portal...
              </span>
            ) : (
              'Manage Subscription'
            )}
            </button>
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            marginTop: '20px',
            marginLeft: '5px',
            marginRight: '5px',
            background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
            border: '1px solid rgba(103, 232, 249, 0.15)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="p-8">
            <div className="space-y-8">
              {/* Daily Usage */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[#67e8f9] text-xs font-medium uppercase tracking-wider">Daily Calculations</p>
                  <p className="text-white text-sm font-medium">
                    {Math.max(0, remainingCalculations)} / {STRIPE_CONFIG.freeTier.dailyCalculations}
                  </p>
                </div>
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{
                    background: 'rgba(103, 232, 249, 0.1)',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${calculationPercentage}%`,
                      background: calculationPercentage > 30
                        ? 'linear-gradient(90deg, #1e96fc 0%, #67e8f9 100%)'
                        : calculationPercentage > 10
                        ? 'linear-gradient(90deg, #ffd800 0%, #ff9500 100%)'
                        : 'linear-gradient(90deg, #e3170a 0%, #ff6b6b 100%)',
                      boxShadow: calculationPercentage > 30
                        ? '0 0 10px rgba(103, 232, 249, 0.4)'
                        : calculationPercentage > 10
                        ? '0 0 10px rgba(255, 216, 0, 0.4)'
                        : '0 0 10px rgba(227, 23, 10, 0.4)',
                    }}
                  />
                </div>
                <p className="text-[#4a5568] text-xs mt-2">
                  Resets daily at midnight UTC
                </p>
              </div>

              {/* Upgrade CTA */}
              <div
                className="p-8 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 216, 0, 0.05) 0%, rgba(255, 184, 0, 0.02) 100%)',
                  border: '1px solid rgba(255, 216, 0, 0.15)',
                }}
              >
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div
                    className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center bg-[#ffd800]/10 text-[#ffd800]"
                  >
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#ffd800] font-semibold text-lg mb-3">Unlock Unlimited Access</h3>
                    <p className="text-[#a1a1aa] text-sm mb-6 leading-relaxed">
                      Remove daily limits and explore the cosmos without restrictions.
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-3 px-8 py-4 rounded-lg text-sm font-semibold text-[#0a0e1a] bg-gradient-to-r from-[#ffd800] to-[#ffb800] transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,216,0,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Upgrade to Pro
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          marginTop: '20px',
          marginBottom: '20px',
          marginLeft: '5px',
          marginRight: '5px',
          background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.9) 0%, rgba(10, 14, 26, 0.9) 100%)',
          border: '1px solid rgba(103, 232, 249, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="px-10 py-8">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-4 py-5 px-8 rounded-xl text-sm font-medium text-[#f87171] transition-all duration-300 hover:bg-[#f87171]/10 group"
            style={{
              background: 'rgba(248, 113, 113, 0.05)',
              border: '1px solid rgba(248, 113, 113, 0.15)',
            }}
          >
            <span
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#f87171]/10 text-[#f87171] transition-all duration-200 group-hover:bg-[#f87171]/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-[#67e8f9]/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#ffd800] animate-spin" />
            </div>
            <p className="text-[#67e8f9] text-sm tracking-wider animate-pulse">
              Loading your cosmic profile...
            </p>
          </div>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
