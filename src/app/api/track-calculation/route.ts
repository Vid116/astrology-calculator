import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { STRIPE_CONFIG } from '@/lib/stripe/config';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // If not logged in, allow calculation (anonymous users get limited by localStorage on client)
    if (authError || !user) {
      return NextResponse.json({
        success: true,
        isAnonymous: true,
        message: 'Anonymous user - client-side limiting applies',
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
    const { data: result, error: countError } = await supabaseAdmin
      .rpc('increment_calculation_count', { p_user_id: user.id });

    if (countError) {
      console.error('Error incrementing count:', countError);
      return NextResponse.json(
        { error: 'Failed to track calculation' },
        { status: 500 }
      );
    }

    const newCount = result?.[0]?.new_count || 0;
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
      return NextResponse.json({
        isLoggedIn: false,
        isAnonymous: true,
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
    const resetDateStr = userData?.calculation_reset_date?.toString().split('T')[0]; // Handle both "2025-01-02" and "2025-01-02T00:00:00"
    const isToday = resetDateStr === todayUTC;

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
