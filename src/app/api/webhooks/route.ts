import { stripe } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'product.deleted',
  'price.created',
  'price.updated',
  'price.deleted',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'checkout.session.completed',
  'payment_intent.payment_failed',
  'payment_intent.canceled',
]);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  if (!relevantEvents.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case 'product.created':
      case 'product.updated':
        await upsertProduct(event.data.object as Stripe.Product);
        break;

      case 'product.deleted':
        await deleteProduct((event.data.object as Stripe.Product).id);
        break;

      case 'price.created':
      case 'price.updated':
        await upsertPrice(event.data.object as Stripe.Price);
        break;

      case 'price.deleted':
        await deletePrice((event.data.object as Stripe.Price).id);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await upsertSubscription(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await deleteSubscription((event.data.object as Stripe.Subscription).id);
        break;

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await upsertSubscription(subscription);
        }
        break;

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        if (pi.metadata.type === 'consultation_booking') {
          await supabaseAdmin
            .from('consultation_bookings')
            .update({ payment_status: 'failed' })
            .eq('payment_intent_id', pi.id);
          console.log(`Payment failed for PI: ${pi.id}`);
        }
        break;
      }

      case 'payment_intent.canceled': {
        const pi = event.data.object as Stripe.PaymentIntent;
        if (pi.metadata.type === 'consultation_booking') {
          await supabaseAdmin
            .from('consultation_bookings')
            .update({ payment_status: 'cancelled' })
            .eq('payment_intent_id', pi.id)
            .in('payment_status', ['authorized', 'requires_action', 'requires_confirmation']);
          console.log(`Payment canceled for PI: ${pi.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Helper functions
async function upsertProduct(product: Stripe.Product) {
  await supabaseAdmin.from('products').upsert({
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description,
    image: product.images?.[0] || null,
    metadata: product.metadata,
  });
}

async function deleteProduct(productId: string) {
  await supabaseAdmin.from('products').delete().eq('id', productId);
}

async function upsertPrice(price: Stripe.Price) {
  await supabaseAdmin.from('prices').upsert({
    id: price.id,
    product_id: typeof price.product === 'string' ? price.product : price.product.id,
    active: price.active,
    description: price.nickname,
    unit_amount: price.unit_amount,
    currency: price.currency,
    type: price.type,
    interval: price.recurring?.interval || null,
    interval_count: price.recurring?.interval_count || null,
    trial_period_days: price.recurring?.trial_period_days || null,
    metadata: price.metadata,
  });
}

async function deletePrice(priceId: string) {
  await supabaseAdmin.from('prices').delete().eq('id', priceId);
}

async function upsertSubscription(subscription: Stripe.Subscription) {
  // Get user ID from customer
  const customer = await stripe.customers.retrieve(
    subscription.customer as string
  );

  if (customer.deleted) {
    console.error('Customer was deleted');
    return;
  }

  const userId = customer.metadata.supabase_user_id;

  if (!userId) {
    console.error('No supabase_user_id in customer metadata');
    return;
  }

  // Get period dates from the first subscription item (Stripe API v2024+)
  const firstItem = subscription.items.data[0];
  const currentPeriodStart = firstItem?.current_period_start;
  const currentPeriodEnd = firstItem?.current_period_end;

  await supabaseAdmin.from('subscriptions').upsert({
    id: subscription.id,
    user_id: userId,
    status: subscription.status,
    metadata: subscription.metadata,
    price_id: firstItem?.price.id,
    quantity: firstItem?.quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    created: new Date(subscription.created * 1000).toISOString(),
    current_period_start: currentPeriodStart
      ? new Date(currentPeriodStart * 1000).toISOString()
      : null,
    current_period_end: currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000).toISOString()
      : null,
    ended_at: subscription.ended_at
      ? new Date(subscription.ended_at * 1000).toISOString()
      : null,
    cancel_at: subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  });
}

async function deleteSubscription(subscriptionId: string) {
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('id', subscriptionId);
}
