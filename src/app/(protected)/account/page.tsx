'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { STRIPE_CONFIG } from '@/lib/stripe/config';
import { PLANET_AVATARS, ZODIAC_ICON_AVATARS } from '@/lib/avatars';

interface UserUsage {
  calculation_count: number;
  calculation_reset_date: string;
}

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

function AccountContent() {
  const { user, subscription, isPremium, signOut, isLoading, setAvatarUrl: setContextAvatarUrl, avatarUrl: contextAvatarUrl } = useAuth();
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(contextAvatarUrl);
  const timeLeft = useCountdown();
  const [portalLoading, setPortalLoading] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  const supabase = createClient();

  // Sync local avatar state with context when it loads
  useEffect(() => {
    if (contextAvatarUrl && !avatarUrl) {
      setAvatarUrl(contextAvatarUrl);
    }
  }, [contextAvatarUrl]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      // Fetch usage data
      const { data: usageData } = await supabase
        .from('user_usage')
        .select('calculation_count, calculation_reset_date')
        .eq('user_id', user.id)
        .single();

      if (usageData) {
        setUsage(usageData);
      }

      // Fetch profile data (fallback if context doesn't have it yet)
      if (!contextAvatarUrl) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('user_id', user.id)
          .single() as { data: { avatar_url: string | null } | null };

        if (profileData?.avatar_url) {
          setAvatarUrl(profileData.avatar_url);
        }
      }
    };

    fetchUserData();
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

  const handleAvatarChange = async (avatarPath: string) => {
    if (!isPremium || avatarSaving || !user) return;
    if (avatarPath === avatarUrl) return;

    setAvatarSaving(true);
    try {
      const { error } = await (supabase
        .from('profiles') as ReturnType<typeof supabase.from>)
        .upsert({
          user_id: user.id,
          avatar_url: avatarPath
        } as { user_id: string; avatar_url: string });

      if (!error) {
        setAvatarUrl(avatarPath);
        setContextAvatarUrl(avatarPath);
      }
    } catch (err) {
      console.error('Failed to update avatar:', err);
    } finally {
      setAvatarSaving(false);
    }
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
                    className="inline-flex items-center gap-3 py-3.5 rounded-full text-sm font-semibold text-[#67e8f9] bg-gradient-to-r from-[#67e8f9]/15 to-[#1e96fc]/10 border border-[#67e8f9]/30 shadow-[0_0_20px_rgba(103,232,249,0.15)]"
                    style={{ paddingLeft: '10px', paddingRight: '14px' }}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Free Explorer
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

      {/* Avatar Picker Section */}
      <div
        className="relative rounded-2xl overflow-hidden"
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
          <h2
            className="text-lg font-semibold tracking-wide mb-6"
            style={{ color: '#67e8f9' }}
          >
            Choose Your Planet
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {PLANET_AVATARS.map((planet) => {
              const isSelected = avatarUrl === planet.path;
              const canSelect = isPremium && !avatarSaving;

              return (
                <button
                  key={planet.id}
                  onClick={() => handleAvatarChange(planet.path)}
                  disabled={!canSelect}
                  className={`
                    relative aspect-square rounded-xl overflow-hidden
                    transition-all duration-300
                    ${canSelect ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                    ${isSelected ? 'ring-[3px] ring-offset-2 ring-offset-[#0a0e1a]' : ''}
                    ${isSelected && isPremium ? 'ring-[#ffd800]' : isSelected ? 'ring-[#67e8f9]' : ''}
                  `}
                  style={{
                    background: 'rgba(103, 232, 249, 0.05)',
                    border: isSelected
                      ? '2px solid transparent'
                      : '1px solid rgba(103, 232, 249, 0.15)',
                    boxShadow: isSelected
                      ? isPremium
                        ? '0 0 20px rgba(255, 216, 0, 0.3)'
                        : '0 0 20px rgba(103, 232, 249, 0.3)'
                      : 'none',
                  }}
                >
                  <Image
                    src={planet.path}
                    alt={planet.name}
                    fill
                    className={`object-contain p-2 ${!isPremium ? 'opacity-50' : ''}`}
                  />

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: isPremium
                          ? 'linear-gradient(135deg, #ffd800 0%, #ff9500 100%)'
                          : 'linear-gradient(135deg, #67e8f9 0%, #1e96fc 100%)',
                      }}
                    >
                      <svg className="w-3 h-3 text-[#0a0e1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {/* Saving spinner */}
                  {avatarSaving && avatarUrl !== planet.path && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#67e8f9] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Planet name tooltip */}
                  <div
                    className="absolute bottom-0 left-0 right-0 py-1 text-center text-[10px] font-medium"
                    style={{
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      color: isSelected ? (isPremium ? '#ffd800' : '#67e8f9') : '#a1a1aa',
                    }}
                  >
                    {planet.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sign Icons Section (SVG) */}
          <h2
            className="text-lg font-semibold tracking-wide mb-6 mt-10"
            style={{ color: '#22d3ee' }}
          >
            Sign Icons
          </h2>

          <div className="grid grid-cols-5 sm:grid-cols-5 gap-4">
            {ZODIAC_ICON_AVATARS.map((sign) => {
              const isSelected = avatarUrl === sign.path;
              const canSelect = isPremium && !avatarSaving;

              return (
                <button
                  key={sign.id}
                  onClick={() => handleAvatarChange(sign.path)}
                  disabled={!canSelect}
                  className={`
                    relative aspect-square rounded-xl overflow-hidden
                    transition-all duration-300
                    ${canSelect ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                    ${isSelected ? 'ring-[3px] ring-offset-2 ring-offset-[#0a0e1a]' : ''}
                    ${isSelected ? 'ring-[#22d3ee]' : ''}
                  `}
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(34, 211, 238, 0.1) 100%)'
                      : 'rgba(34, 211, 238, 0.05)',
                    border: isSelected
                      ? '2px solid transparent'
                      : '1px solid rgba(34, 211, 238, 0.15)',
                    boxShadow: isSelected
                      ? '0 0 20px rgba(34, 211, 238, 0.3)'
                      : 'none',
                  }}
                >
                  <Image
                    src={sign.path}
                    alt={sign.name}
                    fill
                    className={`object-contain p-3 ${!isPremium ? 'opacity-50' : ''}`}
                  />

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                      }}
                    >
                      <svg className="w-3 h-3 text-[#0a0e1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {/* Saving spinner */}
                  {avatarSaving && avatarUrl !== sign.path && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Upgrade prompt for free users */}
          {!isPremium && (
            <div
              className="mt-6 p-4 rounded-xl flex items-center gap-4"
              style={{
                background: 'rgba(255, 216, 0, 0.05)',
                border: '1px solid rgba(255, 216, 0, 0.2)',
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#ffd800]/10 text-[#ffd800] flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[#ffd800] text-sm font-medium">Unlock Avatar Customization</p>
                <p className="text-[#a1a1aa] text-xs mt-0.5">Upgrade to Pro to choose your planet avatar</p>
              </div>
              <Link
                href="/pricing"
                className="rounded-lg text-xs font-semibold text-[#0a0e1a] bg-gradient-to-r from-[#ffd800] to-[#ffb800] hover:shadow-[0_0_15px_rgba(255,216,0,0.4)] transition-all duration-300"
                style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '10px', paddingBottom: '10px' }}
              >
                Upgrade
              </Link>
            </div>
          )}
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
              background: 'linear-gradient(135deg, #67e8f9 0%, #1e96fc 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Free Explorer Plan
          </h2>

          {/* Usage Stats */}
          <div
            className="rounded-xl p-5"
            style={{
              background: 'rgba(103, 232, 249, 0.03)',
              border: '1px solid rgba(103, 232, 249, 0.1)',
              marginBottom: '24px',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'rgba(103, 232, 249, 0.1)',
                  }}
                >
                  <svg className="w-5 h-5 text-[#67e8f9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-white font-medium">Daily Calculations</span>
              </div>
              <span className="text-2xl font-bold text-white">
                {Math.max(0, remainingCalculations)}<span className="text-[#6b7a90] text-lg font-normal">/{STRIPE_CONFIG.freeTier.dailyCalculations}</span>
              </span>
            </div>

            {/* Progress bar */}
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{
                background: 'rgba(103, 232, 249, 0.1)',
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
                    ? '0 0 10px rgba(103, 232, 249, 0.5)'
                    : calculationPercentage > 10
                    ? '0 0 10px rgba(255, 216, 0, 0.5)'
                    : '0 0 10px rgba(227, 23, 10, 0.5)',
                }}
              />
            </div>
            <p className="text-[#6b7a90] text-xs mt-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Resets daily at midnight UTC <span className="text-white">{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
            </p>
          </div>

          {/* Upgrade CTA */}
          <div
            className="rounded-xl p-6 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 216, 0, 0.08) 0%, rgba(255, 184, 0, 0.03) 100%)',
              border: '1px solid rgba(255, 216, 0, 0.2)',
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg className="w-5 h-5 text-[#ffd800]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <h3 className="text-[#ffd800] font-bold text-lg">Unlock Unlimited Access</h3>
            </div>
            <p
              className="text-sm mb-8"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 50%, #ffffff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 20px rgba(255,255,255,0.3)',
              }}
            >
              Remove daily limits and explore the cosmos without restrictions
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl text-base font-semibold text-[#0a0e1a] bg-gradient-to-r from-[#ffd800] to-[#ffb800] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,216,0,0.4)] hover:scale-[1.02] active:scale-[0.98]"
              style={{
                marginTop: '10px',
                marginBottom: '10px',
                paddingTop: '16px',
                paddingBottom: '16px',
                paddingLeft: '40px',
                paddingRight: '40px',
              }}
            >
              Upgrade to Pro
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
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
