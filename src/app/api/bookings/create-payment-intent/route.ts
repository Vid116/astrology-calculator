import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { STRIPE_CONFIG } from '@/lib/stripe/config';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and validate duration
    const { duration_minutes } = await request.json();
    const priceInfo = STRIPE_CONFIG.consultation.prices[duration_minutes];

    if (!priceInfo) {
      return NextResponse.json(
        { error: 'Invalid duration. Must be 30, 60, or 90.' },
        { status: 400 }
      );
    }

    // 3. Get or create Stripe customer (reuses existing pattern)
    let stripeCustomerId: string;

    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!customerError && customer?.stripe_customer_id) {
      stripeCustomerId = customer.stripe_customer_id;
    } else {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });

      await supabaseAdmin
        .from('customers')
        .upsert({ id: user.id, stripe_customer_id: stripeCustomer.id });

      stripeCustomerId = stripeCustomer.id;
    }

    // 4. Create PaymentIntent with manual capture (authorize only)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceInfo.amount_cents,
      currency: priceInfo.currency,
      customer: stripeCustomerId,
      capture_method: 'manual',
      automatic_payment_methods: { enabled: true },
      metadata: {
        supabase_user_id: user.id,
        duration_minutes: String(duration_minutes),
        type: 'consultation_booking',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount_cents: priceInfo.amount_cents,
      currency: priceInfo.currency,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create payment intent', details: errorMessage },
      { status: 500 }
    );
  }
}
