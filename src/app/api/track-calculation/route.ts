import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { STRIPE_CONFIG } from '@/lib/stripe/config';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Helper to get client IP from request headers
async function getClientIP(): Promise<string> {
  const headersList = await headers();
  // Try various headers that might contain the real IP
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }
  const realIP = headersList.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  // Fallback - this shouldn't happen in production
  return 'unknown';
}

export async function POST() {
  try {
    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // If not logged in, track by IP address
    if (authError || !user) {
      const ipAddress = await getClientIP();
      const anonLimit = STRIPE_CONFIG.freeTier.anonymousDailyCalculations;

      // Use admin client to call RPC (no auth needed for anonymous)
      const { data: result, error: countError } = await supabaseAdmin
        .rpc('increment_anonymous_calculation', { p_ip_address: ipAddress }) as {
          data: { new_count: number; reset_date: string; is_reset: boolean }[] | null;
          error: Error | null;
        };

      if (countError) {
        console.error('Error incrementing anonymous count:', countError);
        // On error, allow but don't track
        return NextResponse.json({
          success: true,
          isAnonymous: true,
          remaining: anonLimit,
          limit: anonLimit,
        });
      }

      const newCount = result?.[0]?.new_count ?? 0;
      const remaining = Math.max(0, anonLimit - newCount);

      // Check if over limit
      if (newCount > anonLimit) {
        return NextResponse.json({
          success: false,
          isAnonymous: true,
          count: newCount,
          remaining: 0,
          limit: anonLimit,
          limitReached: true,
          message: 'Daily limit reached. Sign up for more calculations!',
        });
      }

      return NextResponse.json({
        success: true,
        isAnonymous: true,
        count: newCount,
        remaining,
        limit: anonLimit,
        limitReached: false,
      });
    }

    // Check if user has active subscription
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle();

    // Premium users have unlimited calculations
    if (subscription) {
      return NextResponse.json({
        success: true,
        isPremium: true,
        remaining: -1, // Unlimited
        message: 'Premium user - unlimited calculations',
      });
    }

    // For free users, increment and check the count
    // Use user's session so auth.uid() works in the RPC function
    const { data: result, error: countError } = await supabase
      .rpc('increment_calculation_count') as {
        data: { new_count: number; reset_date: string; is_reset: boolean }[] | null;
        error: Error | null;
      };

    if (countError) {
      console.error('Error incrementing count:', countError);
      return NextResponse.json(
        { error: 'Failed to track calculation' },
        { status: 500 }
      );
    }

    const newCount = result?.[0]?.new_count ?? 0;
    const dailyLimit = STRIPE_CONFIG.freeTier.dailyCalculations;
    const remaining = Math.max(0, dailyLimit - newCount);

    // Check if over limit
    if (newCount > dailyLimit) {
      return NextResponse.json({
        success: false,
        isPremium: false,
        count: newCount,
        remaining: 0,
        limit: dailyLimit,
        limitReached: true,
        message: 'Daily limit reached. Upgrade to Pro for unlimited calculations!',
      });
    }

    return NextResponse.json({
      success: true,
      isPremium: false,
      count: newCount,
      remaining,
      limit: dailyLimit,
      limitReached: false,
      message: `${remaining} calculations remaining today`,
    });
  } catch (error) {
    console.error('Track calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check current usage without incrementing
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // Anonymous user - check by IP
      const ipAddress = await getClientIP();
      const anonLimit = STRIPE_CONFIG.freeTier.anonymousDailyCalculations;

      const { data: result, error: usageError } = await supabaseAdmin
        .rpc('get_anonymous_usage', { p_ip_address: ipAddress }) as {
          data: { calculation_count: number; calculation_reset_date: string }[] | null;
          error: Error | null;
        };

      if (usageError) {
        console.error('Error getting anonymous usage:', usageError);
        // On error, assume fresh
        return NextResponse.json({
          isLoggedIn: false,
          isAnonymous: true,
          remaining: anonLimit,
          limit: anonLimit,
        });
      }

      const count = result?.[0]?.calculation_count ?? 0;
      const remaining = Math.max(0, anonLimit - count);

      return NextResponse.json({
        isLoggedIn: false,
        isAnonymous: true,
        count,
        remaining,
        limit: anonLimit,
      });
    }

    // Check subscription
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle();

    if (subscription) {
      return NextResponse.json({
        isLoggedIn: true,
        isPremium: true,
        remaining: -1,
      });
    }

    // Get current count from user_usage table
    const { data: userData } = await supabaseAdmin
      .from('user_usage')
      .select('calculation_count, calculation_reset_date')
      .eq('user_id', user.id)
      .single();

    // Compare dates properly using UTC (matches PostgreSQL CURRENT_DATE)
    const todayUTC = new Date().toISOString().split('T')[0]; // "2025-01-02"
    const resetDateStr = userData?.calculation_reset_date?.toString().split('T')[0];

    // If date is NULL but count > 0, treat as today (don't give free calculations)
    // If date is NULL and count = 0, treat as fresh (new user)
    const hasCount = (userData?.calculation_count || 0) > 0;
    const isToday = resetDateStr === todayUTC || (resetDateStr == null && hasCount);

    const count = isToday ? (userData?.calculation_count || 0) : 0;
    const remaining = Math.max(0, STRIPE_CONFIG.freeTier.dailyCalculations - count);

    return NextResponse.json({
      isLoggedIn: true,
      isPremium: false,
      count,
      remaining,
      limit: STRIPE_CONFIG.freeTier.dailyCalculations,
    });
  } catch (error) {
    console.error('Get usage error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
